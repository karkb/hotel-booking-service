"use strict";
/**
 * Vendor Configuration
 * Single source of truth for vendor-specific settings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VENDOR_CONFIGS = void 0;
exports.VENDOR_CONFIGS = {
    A: {
        id: 'A',
        name: 'Vendor A',
        responseTime: {
            min: 100,
            max: 300,
        },
        idFormat: {
            prefix: 'VND-A-',
            length: 8,
            type: 'numeric',
        },
        confirmationFormat: {
            prefix: 'VA-',
            pattern: 'XXXXXX', // 6 characters
        },
    },
    B: {
        id: 'B',
        name: 'Vendor B',
        responseTime: {
            min: 200,
            max: 500,
        },
        idFormat: {
            prefix: 'VENDOR-B-',
            length: 12,
            type: 'lowercase',
        },
        confirmationFormat: {
            prefix: 'B-',
            pattern: 'XXXX-XXXX', // 4-4 format
        },
    },
};
//# sourceMappingURL=vendor.config.js.map