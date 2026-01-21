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
exports.CreateBookingDto = void 0;
exports.IsAfterDate = IsAfterDate;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
// Custom validator to ensure checkOutDate is after checkInDate
function IsAfterDate(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isAfterDate',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    if (!value || !relatedValue) {
                        return false;
                    }
                    const checkOutDate = new Date(value);
                    const checkInDate = new Date(relatedValue);
                    return checkOutDate > checkInDate;
                },
                defaultMessage(args) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be after ${relatedPropertyName}`;
                },
            },
        });
    };
}
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'hotel-123',
        description: 'Hotel identifier',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "hotelId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2026-02-15',
        description: 'Check-in date in ISO 8601 format',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "checkInDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    IsAfterDate('checkInDate', {
        message: 'Check-out date must be after check-in date',
    }),
    (0, swagger_1.ApiProperty)({
        example: '2026-02-20',
        description: 'Check-out date in ISO 8601 format',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "checkOutDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: 'Number of guests',
        minimum: 1,
        maximum: 10,
    }),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "guests", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 5000,
        description: 'Total price for the booking',
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "totalPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    (0, swagger_1.ApiProperty)({
        example: 'AED',
        default: 'AED',
        description: 'Currency code (ISO 4217)',
        required: false,
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "currency", void 0);
//# sourceMappingURL=create-booking.dto.js.map