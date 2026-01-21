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
var BookingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const booking_service_1 = require("./booking.service");
const booking_response_dto_1 = require("./dto/booking-response.dto");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const query_bookings_dto_1 = require("./dto/query-bookings.dto");
let BookingController = BookingController_1 = class BookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
        this.logger = new common_1.Logger(BookingController_1.name);
    }
    /**
     * Creates a new booking (returns PENDING status)
     * @param dto - Booking creation data
     * @param idempotencyKey - Unique UUID v4 key to prevent duplicate bookings
     * @returns The created booking with PENDING status
     * @note In production, userId would be extracted from JWT token via auth middleware
     */
    async createBooking(dto, idempotencyKey) {
        // Validate idempotency key is UUID
        if (!idempotencyKey || !this.isValidUUID(idempotencyKey)) {
            throw new common_1.BadRequestException('Invalid or missing Idempotency-Key header (must be UUID)');
        }
        // In production, this would come from JWT token via auth middleware
        // For demo purposes, using a fixed user ID
        const userId = '550e8400-e29b-41d4-a716-446655440000';
        const booking = await this.bookingService.createBooking(dto, idempotencyKey, userId);
        this.logger.log(`Booking created: ${booking.id} (status: ${booking.status})`);
        return booking;
    }
    /**
     * Lists bookings with filters and pagination
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of bookings
     */
    async listBookings(query) {
        return this.bookingService.findAll(query);
    }
    /**
     * Gets the current status of a booking (for polling)
     * @param id - Booking ID
     * @returns Booking status information
     */
    async getBookingStatus(id) {
        return this.bookingService.getBookingStatus(id);
    }
    /**
     * Gets a booking by ID
     * @param id - Booking ID
     * @returns The booking with its attempts
     */
    async getBooking(id) {
        return this.bookingService.findById(id, true); // include attempts
    }
    /**
     * Validates if a string is a valid UUID
     * @param str - String to validate
     * @returns True if the string is a valid UUID, false otherwise
     */
    isValidUUID(str) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking (returns PENDING status)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: booking_response_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cached response', type: booking_response_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request or missing headers' }),
    (0, swagger_1.ApiHeader)({ name: 'idempotency-key', required: true, description: 'UUID v4' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List bookings with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_bookings_dto_1.QueryBookingsDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "listBookings", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking status (for polling)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: booking_response_dto_1.BookingResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBooking", null);
exports.BookingController = BookingController = BookingController_1 = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, swagger_1.ApiTags)('Bookings'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map