import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';

import { PostBookingJobData } from '../interfaces/job-data.interface';
import { QUEUE_NAMES } from '../constants/queue-names.constant';

@Injectable()
export class PostBookingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostBookingWorker.name);
  private postBookingWorker?: Worker;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing post-booking worker...');

    // Post-Booking Worker
    this.postBookingWorker = new Worker(
      QUEUE_NAMES.POST_BOOKING_TASKS,
      async (job: Job) => this.processPostBooking(job),
      {
        connection: this.getRedisConnection(),
        concurrency: 5,
      },
    );

    // Setup event handlers
    this.setupWorkerEvents(this.postBookingWorker);

    this.logger.log('Post-booking worker initialized successfully');
  }

  private getRedisConnection() {
    return {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  private async processPostBooking(job: Job<PostBookingJobData>) {
    const { bookingId, userEmail, confirmationCode } = job.data;

    this.logger.log(
      `Processing post-booking task for booking ${bookingId} (attempt ${job.attemptsMade + 1})`,
    );

    try {
      // Mock email sending implementation
      // In a real system, this would integrate with an email service (e.g., SendGrid, AWS SES, etc.)

      this.logger.log(`Sending confirmation email to ${userEmail}`);
      this.logger.log(`Booking ID: ${bookingId}`);
      this.logger.log(`Confirmation Code: ${confirmationCode}`);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Mock successful email delivery
      this.logger.log(
        `Confirmation email sent successfully to ${userEmail} for booking ${bookingId}`,
      );

      return {
        success: true,
        emailSent: true,
        recipient: userEmail,
        bookingId,
        confirmationCode,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send confirmation email for booking ${bookingId}: ${errorMessage}`,
      );
      throw error; // Let BullMQ handle retry
    }
  }

  private setupWorkerEvents(worker: Worker) {
    worker.on('completed', (job: Job) => {
      this.logger.log(`Post-booking job ${job.id} completed successfully`);
    });

    worker.on('failed', (job: Job | undefined, error: Error) => {
      this.logger.error(
        `Post-booking job ${job?.id || 'unknown'} failed: ${error.message}`,
        error.stack,
      );
    });

    worker.on('stalled', (jobId: string) => {
      this.logger.warn(`Post-booking job ${jobId} stalled`);
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`Post-booking worker error: ${error.message}`, error.stack);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Closing post-booking worker...');

    await this.postBookingWorker?.close();

    this.logger.log('Post-booking worker closed');
  }
}
