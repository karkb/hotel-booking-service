import { ConfigService } from '@nestjs/config';
import { Queue, DefaultJobOptions } from 'bullmq';
export interface QueueCreationOptions {
    name: string;
    defaultJobOptions?: Partial<DefaultJobOptions>;
}
export interface RateLimiterOptions {
    max: number;
    duration: number;
}
export declare class QueueConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    /**
     * Get Redis connection configuration for BullMQ
     */
    getRedisConnection(): {
        host: any;
        port: any;
        maxRetriesPerRequest: null;
        enableReadyCheck: boolean;
    };
    /**
     * Create a new queue with custom options
     */
    createQueue(options: QueueCreationOptions): Queue;
    /**
     * Get default job options (can be overridden per queue)
     */
    getDefaultJobOptions(): DefaultJobOptions;
    /**
     * Get vendor booking job options with higher retry attempts
     */
    getVendorBookingJobOptions(): DefaultJobOptions;
    /**
     * Get post-booking task job options
     */
    getPostBookingJobOptions(): DefaultJobOptions;
}
