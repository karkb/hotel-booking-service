import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueOptions, DefaultJobOptions } from 'bullmq';

export interface QueueCreationOptions {
  name: string;
  defaultJobOptions?: Partial<DefaultJobOptions>;
}

export interface RateLimiterOptions {
  max: number;
  duration: number;
}

@Injectable()
export class QueueConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get Redis connection configuration for BullMQ
   */
  getRedisConnection() {
    return {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  /**
   * Create a new queue with custom options
   */
  createQueue(options: QueueCreationOptions): Queue {
    const queueOptions: QueueOptions = {
      connection: this.getRedisConnection(),
      defaultJobOptions: options.defaultJobOptions || this.getDefaultJobOptions(),
    };

    return new Queue(options.name, queueOptions);
  }

  /**
   * Get default job options (can be overridden per queue)
   */
  getDefaultJobOptions(): DefaultJobOptions {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
        count: 5000,
      },
    };
  }

  /**
   * Get vendor booking job options with higher retry attempts
   */
  getVendorBookingJobOptions(): DefaultJobOptions {
    return {
      attempts: 4,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
        count: 5000,
      },
    };
  }

  /**
   * Get post-booking task job options
   */
  getPostBookingJobOptions(): DefaultJobOptions {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600, // 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
        count: 5000,
      },
    };
  }
}
