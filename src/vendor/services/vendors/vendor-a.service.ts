import { Injectable, Logger } from '@nestjs/common';
import { BaseVendorService } from './base-vendor.service';
import { VENDOR_CONFIGS } from '../../config/vendor.config';
import { VendorBookingRequest, VendorBookingResponse } from '../../interfaces/vendor.interface';

/**
 * Vendor A Service - Modern REST API
 *
 * Key Difference: Returns structured metadata and uses modern ID format
 */
@Injectable()
export class VendorAService extends BaseVendorService {
  protected readonly logger = new Logger(VendorAService.name);
  protected readonly config = VENDOR_CONFIGS.A;

  /**
   * Vendor A specific: Modern REST API with metadata
   */
  async createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse> {
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
}
