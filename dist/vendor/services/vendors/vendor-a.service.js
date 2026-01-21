"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VendorAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorAService = void 0;
const common_1 = require("@nestjs/common");
const base_vendor_service_1 = require("./base-vendor.service");
const vendor_config_1 = require("../../config/vendor.config");
/**
 * Vendor A Service - Modern REST API
 *
 * Key Difference: Returns structured metadata and uses modern ID format
 */
let VendorAService = VendorAService_1 = class VendorAService extends base_vendor_service_1.BaseVendorService {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(VendorAService_1.name);
        this.config = vendor_config_1.VENDOR_CONFIGS.A;
    }
    /**
     * Vendor A specific: Modern REST API with metadata
     */
    async createBooking(request) {
        this.logger.log(`[Vendor A - REST API] Processing booking for ${request.vendorHotelId}`);
        // Call base implementation
        const response = await super.createBooking(request);
        // Vendor A specific: Add modern API metadata
        return {
            ...response,
            metadata: {
                vendorSystem: 'Vendor-A-REST-v2',
                apiVersion: '2.0',
                region: 'US-EAST-1',
            },
        };
    }
};
exports.VendorAService = VendorAService;
exports.VendorAService = VendorAService = VendorAService_1 = __decorate([
    (0, common_1.Injectable)()
], VendorAService);
//# sourceMappingURL=vendor-a.service.js.map