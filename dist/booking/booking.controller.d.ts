import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
export declare class BookingController {
    private readonly bookingService;
    private readonly logger;
    constructor(bookingService: BookingService);
    /**
     * Creates a new booking (returns PENDING status)
     * @param dto - Booking creation data
     * @param idempotencyKey - Unique UUID v4 key to prevent duplicate bookings
     * @returns The created booking with PENDING status
     * @note In production, userId would be extracted from JWT token via auth middleware
     */
    createBooking(dto: CreateBookingDto, idempotencyKey: string): Promise<any>;
    /**
     * Lists bookings with filters and pagination
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of bookings
     */
    listBookings(query: QueryBookingsDto): Promise<{
        data: import("./booking.entity").Booking[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Gets the current status of a booking (for polling)
     * @param id - Booking ID
     * @returns Booking status information
     */
    getBookingStatus(id: string): Promise<import("./booking.entity").Booking>;
    /**
     * Gets a booking by ID
     * @param id - Booking ID
     * @returns The booking with its attempts
     */
    getBooking(id: string): Promise<import("./booking.entity").Booking>;
    /**
     * Validates if a string is a valid UUID
     * @param str - String to validate
     * @returns True if the string is a valid UUID, false otherwise
     */
    private isValidUUID;
}
