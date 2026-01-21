import { Injectable, Logger } from '@nestjs/common';
import { BaseVendorService } from './base-vendor.service';
import { VENDOR_CONFIGS } from '../../config/vendor.config';
import { VendorBookingRequest, VendorBookingResponse } from '../../interfaces/vendor.interface';

/**
 * Vendor B Service - Legacy SOAP-like API
 *
 * Key Difference: Returns transaction ID and has slower processing (legacy system)
 */
@Injectable()
export class VendorBService extends BaseVendorService {
  protected readonly logger = new Logger(VendorBService.name);
  protected readonly config = VENDOR_CONFIGS.B;

  /**
   * Vendor B specific: Legacy SOAP API with transaction tracking
   */
  async createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse> {
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
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Vendor B specific: Slower processing due to legacy SOAP system
   */
  protected async simulateDelay(): Promise<void> {
    // Base delay
    await super.simulateDelay();

    // Additional SOAP overhead (legacy system is slower)
    const soapOverhead = 50 + Math.random() * 100;
    await new Promise((resolve) => setTimeout(resolve, soapOverhead));
  }
}
