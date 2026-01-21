"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VendorBService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorBService = void 0;
const common_1 = require("@nestjs/common");
const base_vendor_service_1 = require("./base-vendor.service");
const vendor_config_1 = require("../../config/vendor.config");
/**
 * Vendor B Service - Legacy SOAP-like API
 *
 * Key Difference: Returns transaction ID and has slower processing (legacy system)
 */
let VendorBService = VendorBService_1 = class VendorBService extends base_vendor_service_1.BaseVendorService {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(VendorBService_1.name);
        this.config = vendor_config_1.VENDOR_CONFIGS.B;
    }
    /**
     * Vendor B specific: Legacy SOAP API with transaction tracking
     */
    async createBooking(request) {
        this.logger.log(`[Vendor B - SOAP API] Processing booking for ${request.vendorHotelId}`);
        // Vendor B specific: Legacy SOAP processing overhead
        this.logger.debug('Vendor B: Initiating SOAP transaction...');
        // Call base implementation
        const response = await super.createBooking(request);
        this.logger.debug('Vendor B: SOAP transaction completed');
        // Vendor B specific: Add legacy system transaction details
        return {
            ...response,
            transactionId: this.generateTransactionId(),
            vendorLegacyRef: `LEG-${response.bookingId}`,
            soapVersion: '1.2',
        };
    }
    /**
     * Vendor B specific: Generate transaction ID for legacy system
     */
    generateTransactionId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }
    /**
     * Vendor B specific: Slower processing due to legacy SOAP system
     */
    async simulateDelay() {
        // Base delay
        await super.simulateDelay();
        // Additional SOAP overhead (legacy system is slower)
        const soapOverhead = 50 + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, soapOverhead));
    }
};
exports.VendorBService = VendorBService;
exports.VendorBService = VendorBService = VendorBService_1 = __decorate([
    (0, common_1.Injectable)()
], VendorBService);
//# sourceMappingURL=vendor-b.service.js.map