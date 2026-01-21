import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';

import { BookingStatus } from '../common/enums/booking-status.enum';
import { REDIS_CLIENT } from '../redis/redis.module';
import { VENDOR_NAMES, VENDOR_QUEUE_TOKENS } from '../vendor/constants/vendor-queues.constant';
import { BookingAttempt } from './booking-attempt.entity';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { HotelVendorOption } from './hotel-vendor-option.entity';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private readonly vendorQueueMap: Map<string, Queue>;

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingAttempt)
    private readonly attemptRepo: Repository<BookingAttempt>,
    @InjectRepository(HotelVendorOption)
    private hotelVendorOptionRepo: Repository<HotelVendorOption>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)
    private readonly vendorAQueue: Queue,
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)
    private readonly vendorBQueue: Queue,
  ) {
    // Dynamically build vendor queue mapping from configuration
    this.vendorQueueMap = new Map([
      [VENDOR_NAMES.VENDOR_A.id, this.vendorAQueue],
      [VENDOR_NAMES.VENDOR_B.id, this.vendorBQueue],
    ]);
  }

  /**
   * Creates a new booking and adds it to the appropriate vendor queue
   * @param dto - Booking creation data
   * @param idempotencyKey - Unique key to prevent duplicate bookings
   * @param userId - User ID (in production, extracted from JWT token)
   * @returns The created booking with PENDING status
   */
  async createBooking(dto: CreateBookingDto, idempotencyKey: string, userId: string) {
    // 1. Check idempotency
    const cacheKey = `idempotency:${idempotencyKey}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Get ALL vendor options for this hotel (ordered by priority)
    const vendorOptions = await this.hotelVendorOptionRepo.find({
      where: {
        hotelId: dto.hotelId,
        available: true,
      },
      order: { priority: 'ASC' }, // Lower priority number = try first
    });

    if (vendorOptions.length === 0) {
      throw new NotFoundException(`Hotel ${dto.hotelId} not available`);
    }

    // 3. Select primary vendor (first in priority order)
    const primaryVendor = vendorOptions[0];
    const alternateVendors = vendorOptions.slice(1); // Rest for failover

    // Validate primary vendor has required data
    if (!primaryVendor.vendorHotelId) {
      throw new NotFoundException(
        `Primary vendor ${primaryVendor.vendor} missing vendorHotelId for hotel ${dto.hotelId}`,
      );
    }
    if (!primaryVendor.vendor) {
      throw new NotFoundException(`Primary vendor missing vendor ID for hotel ${dto.hotelId}`);
    }

    // Validate alternate vendors
    for (const alt of alternateVendors) {
      if (!alt.vendorHotelId || !alt.vendor) {
        this.logger.warn(
          `Alternate vendor ${alt.vendor || 'unknown'} has missing data, excluding from failover options`,
        );
      }
    }

    this.logger.log(
      `Booking hotel ${dto.hotelId}: Primary vendor ${primaryVendor.vendor}, ` +
        `${alternateVendors.length} alternates available`,
    );

    // 4. Create booking with primary vendor (with race condition handling)
    const booking = this.bookingRepo.create({
      userId: userId,
      hotelId: dto.hotelId,
      hotelName: primaryVendor.hotelName,
      vendor: primaryVendor.vendor,
      vendorHotelId: primaryVendor.vendorHotelId,
      status: BookingStatus.PENDING,
      idempotencyKey,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      guests: dto.guests,
      totalPrice: String(dto.totalPrice),
      currency: dto.currency || 'AED',
      failoverUsed: false,
      originalVendor: primaryVendor.vendor,
    });

    try {
      await this.bookingRepo.save(booking);
    } catch (error: unknown) {
      // Handle race condition: if another request created the booking with same idempotency key
      const dbError = error as { code?: string; constraint?: string };
      if (dbError.code === '23505' && dbError.constraint === 'idx_bookings_idempotency_key') {
        this.logger.log(
          `Race condition detected for idempotency key ${idempotencyKey}, fetching existing booking`,
        );

        // Fetch the existing booking from database
        const existingBooking = await this.bookingRepo.findOne({
          where: { idempotencyKey },
        });

        if (existingBooking) {
          // Cache it for future requests
          await this.redis.setex(cacheKey, 86400, JSON.stringify(existingBooking));
          return existingBooking;
        }
      }
      // Re-throw if it's a different error
      throw error;
    }

    // 5. Add to appropriate vendor queue with failover info
    const queue = this.vendorQueueMap.get(primaryVendor.vendor);
    if (!queue) {
      throw new NotFoundException(`No queue configured for vendor: ${primaryVendor.vendor}`);
    }

    await queue.add('book-hotel', {
      bookingId: booking.id,
      vendor: primaryVendor.vendor,
      vendorHotelId: primaryVendor.vendorHotelId,
      hotelId: dto.hotelId,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      guests: booking.guests,

      // Include alternate vendors for failover
      alternateVendors: alternateVendors.map((v) => ({
        vendor: v.vendor,
        vendorHotelId: v.vendorHotelId,
        price: v.price,
      })),
    });

    // 6. Cache response
    await this.redis.setex(cacheKey, 86400, JSON.stringify(booking));

    this.logger.log(`Booking ${booking.id} created with primary vendor ${primaryVendor.vendor}`);
    return booking;
  }

  /**
   * Finds a booking by ID
   * @param id - Booking ID
   * @param includeAttempts - Whether to include booking attempts in the response
   * @returns The booking entity
   * @throws NotFoundException if booking not found
   */
  async findById(id: string, includeAttempts = false): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: includeAttempts ? ['attempts'] : [],
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  /**
   * Finds all bookings with optional filtering and pagination
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of bookings
   * @note In production, userId would come from JWT token via auth middleware
   */
  async findAll(query: QueryBookingsDto) {
    const { status, page = 1, limit = 10 } = query;

    // In production, this would come from JWT token via auth middleware
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    const qb = this.bookingRepo.createQueryBuilder('booking');

    // Always filter by authenticated user's ID
    qb.andWhere('booking.userId = :userId', { userId });

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }

    qb.orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [bookings, total] = await qb.getManyAndCount();

    return {
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets the current status of a booking (useful for polling)
   * @param id - Booking ID
   * @returns Booking status information
   * @throws NotFoundException if booking not found
   */
  async getBookingStatus(id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      select: ['id', 'status', 'externalReference', 'confirmedAt'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }
}
