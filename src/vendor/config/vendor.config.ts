/**
 * Vendor Configuration
 * Single source of truth for vendor-specific settings
 */

export interface VendorConfig {
  id: string;
  name: string;
  responseTime: {
    min: number;
    max: number;
  };
  idFormat: {
    prefix: string;
    length: number;
    type: 'numeric' | 'alphanumeric' | 'lowercase';
  };
  confirmationFormat: {
    prefix: string;
    pattern: string; // e.g., "XXXX-XXXX" or "XXXXXX"
  };
}

export const VENDOR_CONFIGS: Record<string, VendorConfig> = {
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
