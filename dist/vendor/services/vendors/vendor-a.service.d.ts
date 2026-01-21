import { Logger } from '@nestjs/common';
import { BaseVendorService } from './base-vendor.service';
import { VendorBookingRequest, VendorBookingResponse } from '../../interfaces/vendor.interface';
/**
 * Vendor A Service - Modern REST API
 *
 * Key Difference: Returns structured metadata and uses modern ID format
 */
export declare class VendorAService extends BaseVendorService {
    protected readonly logger: Logger;
    protected readonly config: import("../../config/vendor.config").VendorConfig;
    /**
     * Vendor A specific: Modern REST API with metadata
     */
    createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
}
