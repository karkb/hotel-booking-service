import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseVendorService } from './vendors/base-vendor.service';
import { VendorAService } from './vendors/vendor-a.service';
import { VendorBService } from './vendors/vendor-b.service';
import { VENDOR_CONFIGS } from '../config/vendor.config';

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
@Injectable()
export class VendorFactory {
  private readonly vendors: Map<string, BaseVendorService>;

  constructor(
    private readonly vendorAService: VendorAService,
    private readonly vendorBService: VendorBService,
  ) {
    // Register vendors - driven by VENDOR_CONFIGS
    this.vendors = new Map<string, BaseVendorService>();
    this.registerVendor(VENDOR_CONFIGS.A.id, this.vendorAService);
    this.registerVendor(VENDOR_CONFIGS.B.id, this.vendorBService);
  }

  /**
   * Register a vendor service
   */
  private registerVendor(vendorId: string, service: BaseVendorService): void {
    this.vendors.set(vendorId, service);
  }

  /**
   * Get vendor service by ID
   * @param vendorId - Vendor identifier (A, B, etc.)
   * @returns Vendor service instance
   * @throws NotFoundException if vendor not found
   */
  getVendor(vendorId: string): BaseVendorService {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${vendorId} not found`);
    }
    return vendor;
  }

  /**
   * Get all available vendor IDs
   * @returns Array of vendor identifiers
   */
  getAvailableVendors(): string[] {
    return Array.from(this.vendors.keys());
  }
}
