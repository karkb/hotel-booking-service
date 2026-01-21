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
exports.VendorFactory = void 0;
const common_1 = require("@nestjs/common");
const vendor_a_service_1 = require("./vendors/vendor-a.service");
const vendor_b_service_1 = require("./vendors/vendor-b.service");
const vendor_config_1 = require("../config/vendor.config");
/**
 * Vendor Factory
 * Implements Factory Pattern for vendor service creation
 *
 * To add a new vendor:
 * 1. Create new vendor service in services/vendors/ (extend BaseVendorService)
 * 2. Add config to VENDOR_CONFIGS in config/vendor.config.ts
 * 3. Register here in constructor
 * 4. Add to VendorModule providers
 */
let VendorFactory = class VendorFactory {
    constructor(vendorAService, vendorBService) {
        this.vendorAService = vendorAService;
        this.vendorBService = vendorBService;
        // Register vendors - driven by VENDOR_CONFIGS
        this.vendors = new Map();
        this.registerVendor(vendor_config_1.VENDOR_CONFIGS.A.id, this.vendorAService);
        this.registerVendor(vendor_config_1.VENDOR_CONFIGS.B.id, this.vendorBService);
    }
    /**
     * Register a vendor service
     */
    registerVendor(vendorId, service) {
        this.vendors.set(vendorId, service);
    }
    /**
     * Get vendor service by ID
     * @param vendorId - Vendor identifier (A, B, etc.)
     * @returns Vendor service instance
     * @throws NotFoundException if vendor not found
     */
    getVendor(vendorId) {
        const vendor = this.vendors.get(vendorId);
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor ${vendorId} not found`);
        }
        return vendor;
    }
    /**
     * Get all available vendor IDs
     * @returns Array of vendor identifiers
     */
    getAvailableVendors() {
        return Array.from(this.vendors.keys());
    }
};
exports.VendorFactory = VendorFactory;
exports.VendorFactory = VendorFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vendor_a_service_1.VendorAService,
        vendor_b_service_1.VendorBService])
], VendorFactory);
//# sourceMappingURL=vendor.factory.js.map