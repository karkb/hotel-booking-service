import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';

import { BookingService } from '../src/booking/booking.service';
import { Booking } from '../src/booking/booking.entity';
import { BookingAttempt } from '../src/booking/booking-attempt.entity';
import { HotelVendorOption } from '../src/booking/hotel-vendor-option.entity';
import { REDIS_CLIENT } from '../src/redis/redis.module';
import { VENDOR_QUEUE_TOKENS } from '../src/vendor/constants/vendor-queues.constant';
import { BookingStatus } from '../src/common/enums/booking-status.enum';
import { CreateBookingDto } from '../src/booking/dto/create-booking.dto';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepo: jest.Mocked<Repository<Booking>>;
  let redis: jest.Mocked<Redis>;

  const mockBookingRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAttemptRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHotelVendorOptionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepo,
        },
        {
          provide: getRepositoryToken(BookingAttempt),
          useValue: mockAttemptRepo,
        },
        {
          provide: getRepositoryToken(HotelVendorOption),
          useValue: mockHotelVendorOptionRepo,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
        {
          provide: VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE,
          useValue: mockQueue,
        },
        {
          provide: VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE,
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepo = module.get(getRepositoryToken(Booking));
    redis = module.get(REDIS_CLIENT);

    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const createBookingDto: CreateBookingDto = {
      hotelId: 'hotel-123',
      checkInDate: '2026-02-15',
      checkOutDate: '2026-02-20',
      guests: 2,
      totalPrice: 5000,
      currency: 'AED',
    };

    const idempotencyKey = 'idempotency-key-123';

    const mockBooking: Booking = {
      id: 'booking-uuid-123',
      userId,
      vendor: 'A',
      hotelId: createBookingDto.hotelId,
      hotelName: 'Test Hotel',
      vendorHotelId: 'vendor-hotel-123',
      checkInDate: createBookingDto.checkInDate,
      checkOutDate: createBookingDto.checkOutDate,
      guests: createBookingDto.guests,
      currency: createBookingDto.currency || 'AED',
      status: BookingStatus.PENDING,
      idempotencyKey,
      totalPrice: '5000',
      externalReference: null,
      failoverUsed: false,
      originalVendor: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmedAt: null,
      attempts: [],
    };

    it('should create a booking successfully', async () => {
      const mockVendorOptions = [
        {
          id: 'option-1',
          hotelId: 'hotel-123',
          hotelName: 'Test Hotel',
          vendor: 'A',
          vendorHotelId: 'vendor-hotel-123',
          price: '5000',
          available: true,
          priority: 1,
        },
      ];
      mockHotelVendorOptionRepo.find.mockResolvedValue(mockVendorOptions);
      redis.get.mockResolvedValue(null);
      bookingRepo.create.mockReturnValue(mockBooking);
      bookingRepo.save.mockResolvedValue(mockBooking);
      mockQueue.add.mockResolvedValue({} as any);
      redis.setex.mockResolvedValue('OK');

      const result = await service.createBooking(createBookingDto, idempotencyKey, userId);

      expect(bookingRepo.save).toHaveBeenCalled();
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.id).toBe(mockBooking.id);
    });

    it('should return cached booking if idempotency key exists', async () => {
      const cachedBooking = JSON.stringify(mockBooking);
      redis.get.mockResolvedValue(cachedBooking);

      const result = await service.createBooking(createBookingDto, idempotencyKey, userId);

      expect(bookingRepo.create).not.toHaveBeenCalled();
      expect(bookingRepo.save).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        id: mockBooking.id,
        hotelId: mockBooking.hotelId,
        status: mockBooking.status,
      });
    });
  });

  describe('findById', () => {
    const bookingId = 'booking-uuid-123';
    const mockBooking: Booking = {
      id: bookingId,
      userId: '550e8400-e29b-41d4-a716-446655440000',
      vendor: 'A',
      hotelId: 'hotel-123',
      hotelName: 'Test Hotel',
      vendorHotelId: 'vendor-hotel-123',
      status: BookingStatus.CONFIRMED,
      externalReference: 'ext-ref-123',
      idempotencyKey: 'idempotency-key-123',
      checkInDate: '2026-02-15',
      checkOutDate: '2026-02-20',
      guests: 2,
      totalPrice: '5000',
      currency: 'AED',
      failoverUsed: false,
      originalVendor: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmedAt: new Date(),
      attempts: [],
    };

    it('should return booking by id', async () => {
      bookingRepo.findOne.mockResolvedValue(mockBooking);

      const result = await service.findById(bookingId);

      expect(bookingRepo.findOne).toHaveBeenCalledWith({
        where: { id: bookingId },
        relations: [],
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      bookingRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const mockBookings: Booking[] = [
      {
        id: 'booking-1',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        vendor: 'A',
        hotelId: 'hotel-123',
        hotelName: 'Test Hotel 1',
        vendorHotelId: 'vendor-hotel-123',
        status: BookingStatus.CONFIRMED,
        externalReference: 'ext-ref-123',
        idempotencyKey: 'idempotency-key-1',
        checkInDate: '2026-02-15',
        checkOutDate: '2026-02-20',
        guests: 2,
        totalPrice: '5000',
        currency: 'AED',
        failoverUsed: false,
        originalVendor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        confirmedAt: new Date(),
        attempts: [],
      },
    ];

    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      bookingRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    });

    it('should return bookings with pagination', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockBookings, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(bookingRepo.createQueryBuilder).toHaveBeenCalledWith('booking');
      expect(result.data).toEqual(mockBookings);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
