"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVendorService = void 0;
const common_1 = require("@nestjs/common");
/**
 * Base Vendor Service
 * Implements common functionality for all vendor services (Template Method Pattern)
 * Follows DRY principle and Single Responsibility
 */
let BaseVendorService = class BaseVendorService {
    async createBooking(request) {
        this.logger.log(`${this.config.name} API call: hotelId=${request.vendorHotelId}, guests=${request.guests}`);
        // Check if vendor is disabled (Strategy: Fail Fast)
        this.checkAvailability();
        // Simulate vendor-specific response time
        await this.simulateDelay();
        // Generate vendor-specific response
        const response = this.generateResponse();
        this.logger.log(`${this.config.name} booking confirmed: ${response.bookingId}`);
        return response;
    }
    /**
     * Check if vendor is available
     * Can be overridden by subclasses for custom availability logic
     */
    checkAvailability() {
        const envVar = `VENDOR_${this.config.id}_DOWN`;
        if (process.env[envVar] === 'true') {
            this.logger.warn(`${this.config.name} is DOWN (${envVar}=true)`);
            throw new common_1.ServiceUnavailableException(`${this.config.name} service unavailable`);
        }
    }
    /**
     * Simulate vendor-specific response time
     */
    async simulateDelay() {
        const { min, max } = this.config.responseTime;
        const ms = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Generate vendor-specific response
     */
    generateResponse() {
        return {
            bookingId: this.generateBookingId(),
            status: 'confirmed',
            confirmationCode: this.generateConfirmationCode(),
            timestamp: new Date(),
        };
    }
    /**
     * Generate booking ID based on vendor configuration
     */
    generateBookingId() {
        const { prefix, length, type } = this.config.idFormat;
        let id = '';
        switch (type) {
            case 'numeric': {
                const min = Math.pow(10, length - 1);
                const max = Math.pow(10, length) - 1;
                id = Math.floor(min + Math.random() * (max - min + 1)).toString();
                break;
            }
            case 'lowercase': {
                const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < length; i++) {
                    id += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
                }
                break;
            }
            case 'alphanumeric': {
                const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < length; i++) {
                    id += alphanumericChars.charAt(Math.floor(Math.random() * alphanumericChars.length));
                }
                break;
            }
        }
        return `${prefix}${id}`;
    }
    /**
     * Generate confirmation code based on vendor configuration
     */
    generateConfirmationCode() {
        const { prefix, pattern } = this.config.confirmationFormat;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // Replace X with random character, keep - as is
        const code = pattern
            .split('')
            .map((char) => (char === 'X' ? chars.charAt(Math.floor(Math.random() * chars.length)) : char))
            .join('');
        return `${prefix}${code}`;
    }
};
exports.BaseVendorService = BaseVendorService;
exports.BaseVendorService = BaseVendorService = __decorate([
    (0, common_1.Injectable)()
], BaseVendorService);
//# sourceMappingURL=base-vendor.service.js.map