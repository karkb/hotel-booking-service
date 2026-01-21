import { ApiProperty } from '@nestjs/swagger';

export class BookingAttemptDetailDto {
  @ApiProperty({
    description: 'Attempt number (1-based)',
    example: 1,
  })
  attemptNumber!: number;

  @ApiProperty({
    description: 'HTTP status code from vendor response',
    example: 200,
    nullable: true,
  })
  statusCode!: number | null;

  @ApiProperty({
    description: 'Error message if attempt failed',
    example: null,
    nullable: true,
  })
  errorMessage!: string | null;

  @ApiProperty({
    description: 'Duration of the attempt in milliseconds',
    example: 1250,
    nullable: true,
  })
  durationMs!: number | null;

  @ApiProperty({
    description: 'Timestamp when the attempt was created',
    example: '2026-01-21T10:30:00.000Z',
  })
  createdAt!: Date;
}
