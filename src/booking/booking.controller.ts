import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';

@Controller('bookings')
@ApiTags('Bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  /**
   * Creates a new booking (returns PENDING status)
   * @param dto - Booking creation data
   * @param idempotencyKey - Unique UUID v4 key to prevent duplicate bookings
   * @returns The created booking with PENDING status
   * @note In production, userId would be extracted from JWT token via auth middleware
   */
  @Post()
  @ApiOperation({ summary: 'Create a new booking (returns PENDING status)' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  @ApiResponse({ status: 200, description: 'Cached response', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or missing headers' })
  @ApiHeader({ name: 'idempotency-key', required: true, description: 'UUID v4' })
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    // Validate idempotency key is UUID
    if (!idempotencyKey || !this.isValidUUID(idempotencyKey)) {
      throw new BadRequestException('Invalid or missing Idempotency-Key header (must be UUID)');
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
  @Get()
  @ApiOperation({ summary: 'List bookings with filters and pagination' })
  @ApiResponse({ status: 200 })
  async listBookings(@Query() query: QueryBookingsDto) {
    return this.bookingService.findAll(query);
  }

  /**
   * Gets the current status of a booking (for polling)
   * @param id - Booking ID
   * @returns Booking status information
   */
  @Get(':id/status')
  @ApiOperation({ summary: 'Get booking status (for polling)' })
  @ApiResponse({ status: 200 })
  async getBookingStatus(@Param('id') id: string) {
    return this.bookingService.getBookingStatus(id);
  }

  /**
   * Gets a booking by ID
   * @param id - Booking ID
   * @returns The booking with its attempts
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('id') id: string) {
    return this.bookingService.findById(id, true); // include attempts
  }

  /**
   * Validates if a string is a valid UUID
   * @param str - String to validate
   * @returns True if the string is a valid UUID, false otherwise
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
