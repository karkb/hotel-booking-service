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
exports.BookingAttemptDetailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BookingAttemptDetailDto {
}
exports.BookingAttemptDetailDto = BookingAttemptDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attempt number (1-based)',
        example: 1,
    }),
    __metadata("design:type", Number)
], BookingAttemptDetailDto.prototype, "attemptNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'HTTP status code from vendor response',
        example: 200,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingAttemptDetailDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if attempt failed',
        example: null,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingAttemptDetailDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration of the attempt in milliseconds',
        example: 1250,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BookingAttemptDetailDto.prototype, "durationMs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the attempt was created',
        example: '2026-01-21T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], BookingAttemptDetailDto.prototype, "createdAt", void 0);
//# sourceMappingURL=booking-attempt.dto.js.map