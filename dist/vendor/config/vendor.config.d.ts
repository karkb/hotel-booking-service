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
        pattern: string;
    };
}
export declare const VENDOR_CONFIGS: Record<string, VendorConfig>;
