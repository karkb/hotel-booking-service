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
exports.HotelVendorOption = void 0;
const typeorm_1 = require("typeorm");
let HotelVendorOption = class HotelVendorOption {
};
exports.HotelVendorOption = HotelVendorOption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hotel_id', length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "hotelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hotel_name', length: 200 }),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "hotelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_hotel_id', length: 100 }),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "vendorHotelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], HotelVendorOption.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: 'AED' }),
    __metadata("design:type", String)
], HotelVendorOption.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], HotelVendorOption.prototype, "available", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], HotelVendorOption.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], HotelVendorOption.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], HotelVendorOption.prototype, "updatedAt", void 0);
exports.HotelVendorOption = HotelVendorOption = __decorate([
    (0, typeorm_1.Entity)('hotel_vendor_options'),
    (0, typeorm_1.Index)(['hotelId', 'available', 'priority']),
    (0, typeorm_1.Index)(['hotelId', 'vendor'], { unique: true })
], HotelVendorOption);
//# sourceMappingURL=hotel-vendor-option.entity.js.map