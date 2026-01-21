import { BaseVendorService } from './vendors/base-vendor.service';
import { VendorAService } from './vendors/vendor-a.service';
import { VendorBService } from './vendors/vendor-b.service';
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
export declare class VendorFactory {
    private readonly vendorAService;
    private readonly vendorBService;
    private readonly vendors;
    constructor(vendorAService: VendorAService, vendorBService: VendorBService);
    /**
     * Register a vendor service
     */
    private registerVendor;
    /**
     * Get vendor service by ID
     * @param vendorId - Vendor identifier (A, B, etc.)
     * @returns Vendor service instance
     * @throws NotFoundException if vendor not found
     */
    getVendor(vendorId: string): BaseVendorService;
    /**
     * Get all available vendor IDs
     * @returns Array of vendor identifiers
     */
    getAvailableVendors(): string[];
}
