/**
 * Vendor identifiers and display names
 */
export declare const VENDOR_NAMES: {
    readonly VENDOR_A: {
        readonly id: "A";
        readonly displayName: "Vendor A";
    };
    readonly VENDOR_B: {
        readonly id: "B";
        readonly displayName: "Vendor B";
    };
};
/**
 * Vendor-specific queue names
 * These are owned by the VendorModule and define vendor booking queues
 */
export declare const VENDOR_QUEUE_NAMES: {
    readonly VENDOR_A_BOOKINGS: "vendor-a-bookings";
    readonly VENDOR_B_BOOKINGS: "vendor-b-bookings";
};
/**
 * Queue provider tokens for dependency injection in VendorModule
 */
export declare const VENDOR_QUEUE_TOKENS: {
    readonly VENDOR_A_QUEUE: "VENDOR_A_QUEUE";
    readonly VENDOR_B_QUEUE: "VENDOR_B_QUEUE";
};
/**
 * Rate limiter configurations for different vendors
 * These will be applied to workers when processing vendor bookings
 */
export declare const VENDOR_RATE_LIMITERS: {
    readonly VENDOR_A: {
        readonly max: 100;
        readonly duration: 1000;
    };
    readonly VENDOR_B: {
        readonly max: 50;
        readonly duration: 1000;
    };
};
