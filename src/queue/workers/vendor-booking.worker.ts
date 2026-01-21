import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import { Repository } from 'typeorm';

import { Booking } from '../../booking/booking.entity';
import { BookingAttempt } from '../../booking/booking-attempt.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { IVendorAdapter } from '../../vendor/interfaces/vendor.interface';
import { VENDOR_NAMES, VENDOR_QUEUE_NAMES } from '../../vendor/constants/vendor-queues.constant';

@Injectable()
export class VendorBookingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VendorBookingWorker.name);
  private vendorAWorker?: Worker;
  private vendorBWorker?: Worker;

  constructor(
    @Inject('POST_BOOKING_QUEUE') private readonly postBookingQueue: Queue,
    @Inject('IVendorAdapter') private readonly vendorAdapter: IVendorAdapter,
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingAttempt) private readonly attemptRepo: Repository<BookingAttempt>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing vendor booking workers...');

    // Get shared concurrency setting for all workers
    const workerConcurrency =
      parseInt(this.configService.get<string>('WORKER_CONCURRENCY', '5'), 10) || 5;

    // Vendor A Worker
    this.vendorAWorker = new Worker(
      VENDOR_QUEUE_NAMES.VENDOR_A_BOOKINGS,
      async (job: Job) => this.processVendorBooking(job, VENDOR_NAMES.VENDOR_A.id),
      {
        connection: this.getRedisConnection(),
        concurrency: workerConcurrency,
      },
    );

    // Vendor B Worker
    this.vendorBWorker = new Worker(
      VENDOR_QUEUE_NAMES.VENDOR_B_BOOKINGS,
      async (job: Job) => this.processVendorBooking(job, VENDOR_NAMES.VENDOR_B.id),
      {
        connection: this.getRedisConnection(),
        concurrency: workerConcurrency,
      },
    );

    // Setup event handlers for each worker
    this.setupWorkerEvents(this.vendorAWorker, VENDOR_NAMES.VENDOR_A.displayName);
    this.setupWorkerEvents(this.vendorBWorker, VENDOR_NAMES.VENDOR_B.displayName);

    this.logger.log(`Vendor booking workers initialized with concurrency: ${workerConcurrency}`);
  }

  private getRedisConnection() {
    return {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  private async processVendorBooking(job: Job, vendor: string) {
    const { bookingId, vendorHotelId, alternateVendors, checkIn, checkOut, guests } = job.data;
    const startTime = Date.now(); // Track timing for both success and failure

    try {
      // ===== Try Primary Vendor =====
      this.logger.log(
        `[Attempt ${job.attemptsMade + 1}] Booking ${bookingId} with primary vendor ${vendor}`,
      );

      const attempt = await this.attemptRepo.save({
        bookingId,
        attemptNumber: job.attemptsMade + 1,
        vendor,
        requestPayload: { vendorHotelId, checkIn, checkOut, guests },
        isFailover: false,
      });

      const result = await this.vendorAdapter.createBooking({
        vendor,
        vendorHotelId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
      });

      // Primary vendor SUCCESS!
      attempt.durationMs = Date.now() - startTime;
      attempt.statusCode = 200;
      attempt.responsePayload = result as unknown as Record<string, unknown>;
      await this.attemptRepo.save(attempt);

      await this.bookingRepo.update(bookingId, {
        status: BookingStatus.CONFIRMED,
        externalReference: result.bookingId,
        confirmedAt: new Date(),
      });

      this.logger.log(`✓ Booking ${bookingId} confirmed with primary vendor ${vendor}`);
      return { success: true };
    } catch (error) {
      // Primary vendor FAILED
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as { statusCode?: number }).statusCode || 500;
      const failedDuration = Date.now() - startTime;

      this.logger.error(
        `✗ Primary vendor ${vendor} failed for booking ${bookingId}: ${errorMessage}`,
      );

      // Log the failed attempt
      const attempt = await this.attemptRepo.findOne({
        where: { bookingId, attemptNumber: job.attemptsMade + 1 },
      });
      if (attempt) {
        attempt.statusCode = statusCode;
        attempt.errorMessage = errorMessage;
        attempt.durationMs = failedDuration;
        await this.attemptRepo.save(attempt);
      }

      // ===== Check if we should try FAILOVER =====
      // Failover triggers after max retries (attempts - 1) are exhausted
      const maxRetries = job.opts.attempts ? job.opts.attempts - 1 : 3;
      if (job.attemptsMade >= maxRetries && alternateVendors?.length > 0) {
        this.logger.warn(
          `⚠ Primary vendor ${vendor} exhausted all retries. Attempting FAILOVER to ${alternateVendors.length} alternate vendor(s)...`,
        );

        // Try each alternate vendor
        for (let i = 0; i < alternateVendors.length; i++) {
          const alt = alternateVendors[i];

          // Validate alternate vendor before attempting
          if (!alt.vendor || !alt.vendorHotelId) {
            this.logger.warn(
              `[Failover ${i + 1}/${alternateVendors.length}] Skipping invalid alternate vendor - missing vendor ID or hotel ID`,
            );
            continue;
          }

          // Skip if alternate vendor is same as primary (should not happen, but safety check)
          if (alt.vendor === vendor) {
            this.logger.warn(
              `[Failover ${i + 1}/${alternateVendors.length}] Skipping alternate vendor ${alt.vendor} - same as primary`,
            );
            continue;
          }

          try {
            this.logger.log(
              `[Failover ${i + 1}/${alternateVendors.length}] Trying vendor ${alt.vendor} for booking ${bookingId}`,
            );

            const failoverAttempt = await this.attemptRepo.save({
              bookingId,
              attemptNumber: job.attemptsMade + i + 2,
              vendor: alt.vendor,
              requestPayload: { vendorHotelId: alt.vendorHotelId, checkIn, checkOut, guests },
              isFailover: true,
            });

            const startTime = Date.now();
            const result = await this.vendorAdapter.createBooking({
              vendor: alt.vendor,
              vendorHotelId: alt.vendorHotelId,
              checkIn: new Date(checkIn),
              checkOut: new Date(checkOut),
              guests,
            });

            // Failover SUCCESS!
            failoverAttempt.durationMs = Date.now() - startTime;
            failoverAttempt.statusCode = 200;
            failoverAttempt.responsePayload = result as unknown as Record<string, unknown>;
            await this.attemptRepo.save(failoverAttempt);

            await this.bookingRepo.update(bookingId, {
              status: BookingStatus.CONFIRMED,
              vendor: alt.vendor, // Update to failover vendor
              vendorHotelId: alt.vendorHotelId,
              externalReference: result.bookingId,
              confirmedAt: new Date(),
              failoverUsed: true,
            });

            this.logger.log(
              `✓ Booking ${bookingId} confirmed via FAILOVER with vendor ${alt.vendor}`,
            );

            return { success: true }; // Exit successfully
          } catch (failoverError) {
            const failoverErrorMessage =
              failoverError instanceof Error ? failoverError.message : 'Unknown error';
            const failoverStatusCode = (failoverError as { statusCode?: number }).statusCode || 500;

            this.logger.error(
              `✗ Failover vendor ${alt.vendor} also failed: ${failoverErrorMessage}`,
            );

            // Log failover failure
            const failoverAttempt = await this.attemptRepo.findOne({
              where: { bookingId, attemptNumber: job.attemptsMade + i + 2 },
            });
            if (failoverAttempt) {
              failoverAttempt.statusCode = failoverStatusCode;
              failoverAttempt.errorMessage = `Failover: ${failoverErrorMessage}`;
              await this.attemptRepo.save(failoverAttempt);
            }

            // Continue to next alternate vendor
          }
        }

        // All vendors (primary + alternates) failed
        this.logger.error(
          `✗✗✗ Booking ${bookingId} FAILED - all ${alternateVendors.length + 1} vendor options exhausted`,
        );

        await this.bookingRepo.update(bookingId, {
          status: BookingStatus.FAILED,
        });

        // Throw error so job appears in failed queue (not completed)
        throw new Error(
          `All ${alternateVendors.length + 1} vendor options exhausted for booking ${bookingId}`,
        );
      }

      // Not final attempt or no alternates available - let BullMQ retry primary
      throw error;
    }
  }

  private setupWorkerEvents(worker: Worker, name: string) {
    worker.on('completed', (job: Job) => {
      this.logger.log(`${name} job ${job.id} completed successfully`);
    });

    worker.on('failed', async (job: Job | undefined, error: Error) => {
      this.logger.error(
        `${name} job ${job?.id || 'unknown'} failed: ${error.message}`,
        error.stack,
      );

      // Update booking status to FAILED if still PENDING after all retries exhausted
      if (job?.data?.bookingId) {
        try {
          const booking = await this.bookingRepo.findOne({
            where: { id: job.data.bookingId },
          });

          if (booking && booking.status === BookingStatus.PENDING) {
            await this.bookingRepo.update(job.data.bookingId, {
              status: BookingStatus.FAILED,
            });
            this.logger.error(
              `✗✗✗ Booking ${job.data.bookingId} marked as FAILED after exhausting all retries`,
            );
          }
        } catch (updateError) {
          this.logger.error(
            `Failed to update booking ${job.data.bookingId} status: ${updateError}`,
          );
        }
      }
    });

    worker.on('stalled', (jobId: string) => {
      this.logger.warn(`${name} job ${jobId} stalled`);
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`${name} worker error: ${error.message}`, error.stack);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Closing vendor booking workers...');

    await this.vendorAWorker?.close();
    await this.vendorBWorker?.close();

    this.logger.log('Vendor booking workers closed');
  }
}
