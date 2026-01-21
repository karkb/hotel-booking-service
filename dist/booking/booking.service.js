"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const typeorm_2 = require("typeorm");
const booking_status_enum_1 = require("../common/enums/booking-status.enum");
const redis_module_1 = require("../redis/redis.module");
const vendor_queues_constant_1 = require("../vendor/constants/vendor-queues.constant");
const booking_attempt_entity_1 = require("./booking-attempt.entity");
const booking_entity_1 = require("./booking.entity");
const hotel_vendor_option_entity_1 = require("./hotel-vendor-option.entity");
let BookingService = BookingService_1 = class BookingService {
    constructor(bookingRepo, attemptRepo, hotelVendorOptionRepo, redis, vendorAQueue, vendorBQueue) {
        this.bookingRepo = bookingRepo;
        this.attemptRepo = attemptRepo;
        this.hotelVendorOptionRepo = hotelVendorOptionRepo;
        this.redis = redis;
        this.vendorAQueue = vendorAQueue;
        this.vendorBQueue = vendorBQueue;
        this.logger = new common_1.Logger(BookingService_1.name);
        // Dynamically build vendor queue mapping from configuration
        this.vendorQueueMap = new Map([
            [vendor_queues_constant_1.VENDOR_NAMES.VENDOR_A.id, this.vendorAQueue],
            [vendor_queues_constant_1.VENDOR_NAMES.VENDOR_B.id, this.vendorBQueue],
        ]);
    }
    /**
     * Creates a new booking and adds it to the appropriate vendor queue
     * @param dto - Booking creation data
     * @param idempotencyKey - Unique key to prevent duplicate bookings
     * @param userId - User ID (in production, extracted from JWT token)
     * @returns The created booking with PENDING status
     */
    async createBooking(dto, idempotencyKey, userId) {
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
            throw new common_1.NotFoundException(`Hotel ${dto.hotelId} not available`);
        }
        // 3. Select primary vendor (first in priority order)
        const primaryVendor = vendorOptions[0];
        const alternateVendors = vendorOptions.slice(1); // Rest for failover
        // Validate primary vendor has required data
        if (!primaryVendor.vendorHotelId) {
            throw new common_1.NotFoundException(`Primary vendor ${primaryVendor.vendor} missing vendorHotelId for hotel ${dto.hotelId}`);
        }
        if (!primaryVendor.vendor) {
            throw new common_1.NotFoundException(`Primary vendor missing vendor ID for hotel ${dto.hotelId}`);
        }
        // Validate alternate vendors
        for (const alt of alternateVendors) {
            if (!alt.vendorHotelId || !alt.vendor) {
                this.logger.warn(`Alternate vendor ${alt.vendor || 'unknown'} has missing data, excluding from failover options`);
            }
        }
        this.logger.log(`Booking hotel ${dto.hotelId}: Primary vendor ${primaryVendor.vendor}, ` +
            `${alternateVendors.length} alternates available`);
        // 4. Create booking with primary vendor (with race condition handling)
        const booking = this.bookingRepo.create({
            userId: userId,
            hotelId: dto.hotelId,
            hotelName: primaryVendor.hotelName,
            vendor: primaryVendor.vendor,
            vendorHotelId: primaryVendor.vendorHotelId,
            status: booking_status_enum_1.BookingStatus.PENDING,
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
        }
        catch (error) {
            // Handle race condition: if another request created the booking with same idempotency key
            const dbError = error;
            if (dbError.code === '23505' && dbError.constraint === 'idx_bookings_idempotency_key') {
                this.logger.log(`Race condition detected for idempotency key ${idempotencyKey}, fetching existing booking`);
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
            throw new common_1.NotFoundException(`No queue configured for vendor: ${primaryVendor.vendor}`);
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
    async findById(id, includeAttempts = false) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
            relations: includeAttempts ? ['attempts'] : [],
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking ${id} not found`);
        }
        return booking;
    }
    /**
     * Finds all bookings with optional filtering and pagination
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of bookings
     * @note In production, userId would come from JWT token via auth middleware
     */
    async findAll(query) {
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
    async getBookingStatus(id) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
            select: ['id', 'status', 'externalReference', 'confirmedAt'],
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking ${id} not found`);
        }
        return booking;
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = BookingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_attempt_entity_1.BookingAttempt)),
    __param(2, (0, typeorm_1.InjectRepository)(hotel_vendor_option_entity_1.HotelVendorOption)),
    __param(3, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __param(4, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)),
    __param(5, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ioredis_1.Redis,
        bullmq_1.Queue,
        bullmq_1.Queue])
], BookingService);
//# sourceMappingURL=booking.service.js.map