"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QueueCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bullmq_1 = require("bullmq");
const vendor_queues_constant_1 = require("../../vendor/constants/vendor-queues.constant");
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
let QueueCleanupService = QueueCleanupService_1 = class QueueCleanupService {
    constructor(vendorAQueue, vendorBQueue) {
        this.vendorAQueue = vendorAQueue;
        this.vendorBQueue = vendorBQueue;
        this.logger = new common_1.Logger(QueueCleanupService_1.name);
    }
    /**
     * Daily cleanup of old jobs (runs at 2 AM)
     *
     * Removes:
     * - Completed jobs older than 7 days
     * - Failed jobs older than 30 days
     *
     * This prevents unbounded queue growth and keeps Redis memory usage optimal.
     */
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
            const totalCompleted = completedCleaned.reduce((sum, jobs) => sum + jobs.length, 0);
            const totalFailed = failedCleaned.reduce((sum, jobs) => sum + jobs.length, 0);
            this.logger.log(`Cleaned ${totalCompleted} completed and ${totalFailed} failed jobs`);
        }
        catch (error) {
            this.logger.error('Failed to cleanup old jobs', error instanceof Error ? error.stack : String(error));
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
        }
        catch (error) {
            this.logger.error('Failed to check queue health', error instanceof Error ? error.stack : String(error));
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
    async findStuckJobs(queue) {
        const activeJobs = await queue.getActive();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        return activeJobs.filter((job) => {
            const processedTime = now - (job.processedOn || 0);
            return processedTime > fiveMinutes;
        });
    }
};
exports.QueueCleanupService = QueueCleanupService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueCleanupService.prototype, "cleanupOldJobs", null);
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueCleanupService.prototype, "checkQueueHealth", null);
exports.QueueCleanupService = QueueCleanupService = QueueCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)),
    __param(1, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        bullmq_1.Queue])
], QueueCleanupService);
//# sourceMappingURL=queue-cleanup.service.js.map