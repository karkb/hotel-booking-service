import { Queue } from 'bullmq';
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
export declare class QueueCleanupService {
    private readonly vendorAQueue;
    private readonly vendorBQueue;
    private readonly logger;
    constructor(vendorAQueue: Queue, vendorBQueue: Queue);
    /**
     * Daily cleanup of old jobs (runs at 2 AM)
     *
     * Removes:
     * - Completed jobs older than 7 days
     * - Failed jobs older than 30 days
     *
     * This prevents unbounded queue growth and keeps Redis memory usage optimal.
     */
    cleanupOldJobs(): Promise<void>;
    /**
     * Health check (runs every 5 minutes)
     *
     * Monitors:
     * - Queue backlogs (warns if > 1000 waiting jobs)
     * - Stuck jobs (active for > 5 minutes)
     *
     * Logs warnings and errors to help identify queue issues early.
     */
    checkQueueHealth(): Promise<void>;
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
    private findStuckJobs;
}
