/**
 * Vendor identifiers and display names
 */
export const VENDOR_NAMES = {
  VENDOR_A: {
    id: 'A',
    displayName: 'Vendor A',
  },
  VENDOR_B: {
    id: 'B',
    displayName: 'Vendor B',
  },
} as const;

/**
 * Vendor-specific queue names
 * These are owned by the VendorModule and define vendor booking queues
 */
export const VENDOR_QUEUE_NAMES = {
  VENDOR_A_BOOKINGS: 'vendor-a-bookings',
  VENDOR_B_BOOKINGS: 'vendor-b-bookings',
} as const;

/**
 * Queue provider tokens for dependency injection in VendorModule
 */
export const VENDOR_QUEUE_TOKENS = {
  VENDOR_A_QUEUE: 'VENDOR_A_QUEUE',
  VENDOR_B_QUEUE: 'VENDOR_B_QUEUE',
} as const;

/**
 * Rate limiter configurations for different vendors
 * These will be applied to workers when processing vendor bookings
 */
export const VENDOR_RATE_LIMITERS = {
  VENDOR_A: {
    max: 100, // 100 jobs per second
    duration: 1000,
  },
  VENDOR_B: {
    max: 50, // 50 jobs per second
    duration: 1000,
  },
} as const;
