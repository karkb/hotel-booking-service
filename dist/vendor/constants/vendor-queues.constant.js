"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VENDOR_RATE_LIMITERS = exports.VENDOR_QUEUE_TOKENS = exports.VENDOR_QUEUE_NAMES = exports.VENDOR_NAMES = void 0;
/**
 * Vendor identifiers and display names
 */
exports.VENDOR_NAMES = {
    VENDOR_A: {
        id: 'A',
        displayName: 'Vendor A',
    },
    VENDOR_B: {
        id: 'B',
        displayName: 'Vendor B',
    },
};
/**
 * Vendor-specific queue names
 * These are owned by the VendorModule and define vendor booking queues
 */
exports.VENDOR_QUEUE_NAMES = {
    VENDOR_A_BOOKINGS: 'vendor-a-bookings',
    VENDOR_B_BOOKINGS: 'vendor-b-bookings',
};
/**
 * Queue provider tokens for dependency injection in VendorModule
 */
exports.VENDOR_QUEUE_TOKENS = {
    VENDOR_A_QUEUE: 'VENDOR_A_QUEUE',
    VENDOR_B_QUEUE: 'VENDOR_B_QUEUE',
};
/**
 * Rate limiter configurations for different vendors
 * These will be applied to workers when processing vendor bookings
 */
exports.VENDOR_RATE_LIMITERS = {
    VENDOR_A: {
        max: 100, // 100 jobs per second
        duration: 1000,
    },
    VENDOR_B: {
        max: 50, // 50 jobs per second
        duration: 1000,
    },
};
//# sourceMappingURL=vendor-queues.constant.js.map