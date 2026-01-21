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
var VendorAdapterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorAdapterService = void 0;
const common_1 = require("@nestjs/common");
const vendor_factory_1 = require("./vendor.factory");
/**
 * Vendor Adapter Service
 * Implements Adapter Pattern and Strategy Pattern
 * Uses Factory for vendor selection (Dependency Inversion Principle)
 * Depends on abstractions (BaseVendorService) not concrete implementations
 */
let VendorAdapterService = VendorAdapterService_1 = class VendorAdapterService {
    constructor(vendorFactory) {
        this.vendorFactory = vendorFactory;
        this.logger = new common_1.Logger(VendorAdapterService_1.name);
    }
    async createBooking(request) {
        this.logger.log(`Routing booking to Vendor ${request.vendor} for hotel: ${request.vendorHotelId}`);
        this.logger.debug(`Booking details - CheckIn: ${request.checkIn}, CheckOut: ${request.checkOut}, Guests: ${request.guests}`);
        try {
            const startTime = Date.now();
            // Use factory to get appropriate vendor service (Strategy Pattern)
            // No switch statement needed - follows Open/Closed Principle
            const vendorService = this.vendorFactory.getVendor(request.vendor);
            const response = await vendorService.createBooking(request);
            const duration = Date.now() - startTime;
            this.logger.log(`Vendor ${request.vendor} booking successful: ${response.bookingId} (took ${duration}ms)`);
            this.logger.debug(`Confirmation code: ${response.confirmationCode}, Status: ${response.status}`);
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to create booking with vendor ${request.vendor}: ${errorMessage}`, errorStack);
            throw error;
        }
    }
};
exports.VendorAdapterService = VendorAdapterService;
exports.VendorAdapterService = VendorAdapterService = VendorAdapterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vendor_factory_1.VendorFactory])
], VendorAdapterService);
//# sourceMappingURL=vendor-adapter.service.js.map