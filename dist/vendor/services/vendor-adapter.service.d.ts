import { IVendorAdapter, VendorBookingRequest, VendorBookingResponse } from '../interfaces/vendor.interface';
import { VendorFactory } from './vendor.factory';
/**
 * Vendor Adapter Service
 * Implements Adapter Pattern and Strategy Pattern
 * Uses Factory for vendor selection (Dependency Inversion Principle)
 * Depends on abstractions (BaseVendorService) not concrete implementations
 */
export declare class VendorAdapterService implements IVendorAdapter {
    private readonly vendorFactory;
    private readonly logger;
    constructor(vendorFactory: VendorFactory);
    createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
}
