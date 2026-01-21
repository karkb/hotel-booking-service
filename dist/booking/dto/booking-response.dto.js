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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const booking_status_enum_1 = require("../../common/enums/booking-status.enum");
const booking_attempt_dto_1 = require("./booking-attempt.dto");
class BookingResponseDto {
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hotel identifier',
        example: 'hotel-123',
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "hotelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the booking',
        enum: booking_status_enum_1.BookingStatus,
        example: booking_status_enum_1.BookingStatus.CONFIRMED,
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'External reference from vendor',
        example: 'VND-A-12345',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "externalReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Check-in date',
        example: '2026-02-15',
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "checkInDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Check-out date',
        example: '2026-02-20',
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "checkOutDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of guests',
        example: 2,
    }),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total price for the booking',
        example: 5000,
    }),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "totalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'AED',
    }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the booking was created',
        example: '2026-01-21T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the booking was confirmed',
        example: '2026-01-21T10:30:05.000Z',
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "confirmedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List of booking attempts (included in detailed view)',
        type: [booking_attempt_dto_1.BookingAttemptDetailDto],
        required: false,
    }),
    __metadata("design:type", Array)
], BookingResponseDto.prototype, "attempts", void 0);
//# sourceMappingURL=booking-response.dto.js.map