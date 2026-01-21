import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { BookingAttemptDetailDto } from './booking-attempt.dto';

export class BookingResponseDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Hotel identifier',
    example: 'hotel-123',
  })
  hotelId!: string;

  @ApiProperty({
    description: 'Current status of the booking',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  status!: BookingStatus;

  @ApiProperty({
    description: 'External reference from vendor',
    example: 'VND-A-12345',
    nullable: true,
  })
  externalReference!: string | null;

  @ApiProperty({
    description: 'Check-in date',
    example: '2026-02-15',
  })
  checkInDate!: string;

  @ApiProperty({
    description: 'Check-out date',
    example: '2026-02-20',
  })
  checkOutDate!: string;

  @ApiProperty({
    description: 'Number of guests',
    example: 2,
  })
  guests!: number;

  @ApiProperty({
    description: 'Total price for the booking',
    example: 5000,
  })
  totalPrice!: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'AED',
  })
  currency!: string;

  @ApiProperty({
    description: 'Timestamp when the booking was created',
    example: '2026-01-21T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the booking was confirmed',
    example: '2026-01-21T10:30:05.000Z',
    nullable: true,
  })
  confirmedAt!: Date | null;

  @ApiPropertyOptional({
    description: 'List of booking attempts (included in detailed view)',
    type: [BookingAttemptDetailDto],
    required: false,
  })
  attempts?: BookingAttemptDetailDto[];
}
