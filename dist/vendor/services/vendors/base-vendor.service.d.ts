import { Logger } from '@nestjs/common';
import { VendorBookingRequest, VendorBookingResponse } from '../../interfaces/vendor.interface';
import { VendorConfig } from '../../config/vendor.config';
/**
 * Base Vendor Service
 * Implements common functionality for all vendor services (Template Method Pattern)
 * Follows DRY principle and Single Responsibility
 */
export declare abstract class BaseVendorService {
    protected abstract readonly logger: Logger;
    protected abstract readonly config: VendorConfig;
    createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
    /**
     * Check if vendor is available
     * Can be overridden by subclasses for custom availability logic
     */
    protected checkAvailability(): void;
    /**
     * Simulate vendor-specific response time
     */
    protected simulateDelay(): Promise<void>;
    /**
     * Generate vendor-specific response
     */
    protected generateResponse(): VendorBookingResponse;
    /**
     * Generate booking ID based on vendor configuration
     */
    protected generateBookingId(): string;
    /**
     * Generate confirmation code based on vendor configuration
     */
    protected generateConfirmationCode(): string;
}
