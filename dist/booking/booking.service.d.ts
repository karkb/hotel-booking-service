import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';
import { BookingAttempt } from './booking-attempt.entity';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { HotelVendorOption } from './hotel-vendor-option.entity';
export declare class BookingService {
    private readonly bookingRepo;
    private readonly attemptRepo;
    private hotelVendorOptionRepo;
    private readonly redis;
    private readonly vendorAQueue;
    private readonly vendorBQueue;
    private readonly logger;
    private readonly vendorQueueMap;
    constructor(bookingRepo: Repository<Booking>, attemptRepo: Repository<BookingAttempt>, hotelVendorOptionRepo: Repository<HotelVendorOption>, redis: Redis, vendorAQueue: Queue, vendorBQueue: Queue);
    /**
     * Creates a new booking and adds it to the appropriate vendor queue
     * @param dto - Booking creation data
     * @param idempotencyKey - Unique key to prevent duplicate bookings
     * @param userId - User ID (in production, extracted from JWT token)
     * @returns The created booking with PENDING status
     */
    createBooking(dto: CreateBookingDto, idempotencyKey: string, userId: string): Promise<any>;
    /**
     * Finds a booking by ID
     * @param id - Booking ID
     * @param includeAttempts - Whether to include booking attempts in the response
     * @returns The booking entity
     * @throws NotFoundException if booking not found
     */
    findById(id: string, includeAttempts?: boolean): Promise<Booking>;
    /**
     * Finds all bookings with optional filtering and pagination
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of bookings
     * @note In production, userId would come from JWT token via auth middleware
     */
    findAll(query: QueryBookingsDto): Promise<{
        data: Booking[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Gets the current status of a booking (useful for polling)
     * @param id - Booking ID
     * @returns Booking status information
     * @throws NotFoundException if booking not found
     */
    getBookingStatus(id: string): Promise<Booking>;
}
