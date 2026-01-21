import { Logger } from '@nestjs/common';
import { BaseVendorService } from './base-vendor.service';
import { VendorBookingRequest, VendorBookingResponse } from '../../interfaces/vendor.interface';
/**
 * Vendor B Service - Legacy SOAP-like API
 *
 * Key Difference: Returns transaction ID and has slower processing (legacy system)
 */
export declare class VendorBService extends BaseVendorService {
    protected readonly logger: Logger;
    protected readonly config: import("../../config/vendor.config").VendorConfig;
    /**
     * Vendor B specific: Legacy SOAP API with transaction tracking
     */
    createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
    /**
     * Vendor B specific: Generate transaction ID for legacy system
     */
    private generateTransactionId;
    /**
     * Vendor B specific: Slower processing due to legacy SOAP system
     */
    protected simulateDelay(): Promise<void>;
}
