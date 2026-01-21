import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue, Job } from 'bullmq';
import { VENDOR_QUEUE_TOKENS } from '../../vendor/constants/vendor-queues.constant';

/**
 * Queue Cleanup Service
 *
 * Provides automated maintenance tasks for queue health:
 * - Daily cleanup of old completed and failed jobs
 * - Periodic health checks to detect backlogs and stuck jobs
 *
 * @example
 * Scheduled tasks run automatically:
 * - 2 AM daily: Clean old jobs
 * - Every 5 minutes: Check queue health
 */
@Injectable()
export class QueueCleanupService {
  private readonly logger = new Logger(QueueCleanupService.name);

  constructor(
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)
    private readonly vendorAQueue: Queue,
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)
    private readonly vendorBQueue: Queue,
  ) {}

  /**
   * Daily cleanup of old jobs (runs at 2 AM)
   *
   * Removes:
   * - Completed jobs older than 7 days
   * - Failed jobs older than 30 days
   *
   * This prevents unbounded queue growth and keeps Redis memory usage optimal.
   */
  @Cron('0 2 * * *')
  async cleanupOldJobs() {
    this.logger.log('Starting daily queue cleanup...');

    try {
      // Clean completed jobs older than 7 days
      const completedCleaned = await Promise.all([
        this.vendorAQueue.clean(7 * 24 * 3600 * 1000, 1000, 'completed'),
        this.vendorBQueue.clean(7 * 24 * 3600 * 1000, 1000, 'completed'),
      ]);

      // Clean failed jobs older than 30 days
      const failedCleaned = await Promise.all([
        this.vendorAQueue.clean(30 * 24 * 3600 * 1000, 1000, 'failed'),
        this.vendorBQueue.clean(30 * 24 * 3600 * 1000, 1000, 'failed'),
      ]);

      const totalCompleted = completedCleaned.reduce(
        (sum: number, jobs: string[]) => sum + jobs.length,
        0,
      );
      const totalFailed = failedCleaned.reduce(
        (sum: number, jobs: string[]) => sum + jobs.length,
        0,
      );

      this.logger.log(`Cleaned ${totalCompleted} completed and ${totalFailed} failed jobs`);
    } catch (error) {
      this.logger.error(
        'Failed to cleanup old jobs',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Health check (runs every 5 minutes)
   *
   * Monitors:
   * - Queue backlogs (warns if > 1000 waiting jobs)
   * - Stuck jobs (active for > 5 minutes)
   *
   * Logs warnings and errors to help identify queue issues early.
   */
  @Cron('*/5 * * * *')
  async checkQueueHealth() {
    try {
      // Check waiting job counts
      const vendorAWaiting = await this.vendorAQueue.getWaitingCount();
      const vendorBWaiting = await this.vendorBQueue.getWaitingCount();

      if (vendorAWaiting > 1000) {
        this.logger.warn(`⚠️  Vendor A queue backlog: ${vendorAWaiting} waiting jobs`);
      }

      if (vendorBWaiting > 1000) {
        this.logger.warn(`⚠️  Vendor B queue backlog: ${vendorBWaiting} waiting jobs`);
      }

      // Check for stuck jobs (active > 5 minutes)
      const vendorAStuckJobs = await this.findStuckJobs(this.vendorAQueue);
      if (vendorAStuckJobs.length > 0) {
        this.logger.error(`🚨 Found ${vendorAStuckJobs.length} stuck jobs in Vendor A queue`);
      }

      const vendorBStuckJobs = await this.findStuckJobs(this.vendorBQueue);
      if (vendorBStuckJobs.length > 0) {
        this.logger.error(`🚨 Found ${vendorBStuckJobs.length} stuck jobs in Vendor B queue`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to check queue health',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Find jobs that have been active for more than 5 minutes
   *
   * @param queue - The queue to check for stuck jobs
   * @returns Array of stuck jobs
   *
   * Stuck jobs may indicate:
   * - Worker crashes
   * - Vendor API timeouts
   * - Deadlocks or infinite loops
   */
  private async findStuckJobs(queue: Queue) {
    const activeJobs = await queue.getActive();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return activeJobs.filter((job: Job) => {
      const processedTime = now - (job.processedOn || 0);
      return processedTime > fiveMinutes;
    });
  }
}
