import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Custom validator to ensure checkOutDate is after checkInDate
export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (!value || !relatedValue) {
            return false;
          }

          const checkOutDate = new Date(value as string);
          const checkInDate = new Date(relatedValue as string);

          return checkOutDate > checkInDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}

export class CreateBookingDto {
  // Note: userId comes from X-User-Id header (simulating auth), not from body
  // Note: vendor selection is automatic based on hotel availability and priority

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({
    example: 'hotel-123',
    description: 'Hotel identifier',
  })
  hotelId!: string;

  @IsDateString()
  @ApiProperty({
    example: '2026-02-15',
    description: 'Check-in date in ISO 8601 format',
  })
  checkInDate!: string;

  @IsDateString()
  @IsAfterDate('checkInDate', {
    message: 'Check-out date must be after check-in date',
  })
  @ApiProperty({
    example: '2026-02-20',
    description: 'Check-out date in ISO 8601 format',
  })
  checkOutDate!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @ApiProperty({
    example: 2,
    description: 'Number of guests',
    minimum: 1,
    maximum: 10,
  })
  guests!: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5000,
    description: 'Total price for the booking',
    minimum: 0,
  })
  totalPrice!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @ApiProperty({
    example: 'AED',
    default: 'AED',
    description: 'Currency code (ISO 4217)',
    required: false,
  })
  currency?: string;
}
