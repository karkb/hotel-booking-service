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
var PostBookingWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostBookingWorker = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const queue_names_constant_1 = require("../constants/queue-names.constant");
let PostBookingWorker = PostBookingWorker_1 = class PostBookingWorker {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PostBookingWorker_1.name);
    }
    async onModuleInit() {
        this.logger.log('Initializing post-booking worker...');
        // Post-Booking Worker
        this.postBookingWorker = new bullmq_1.Worker(queue_names_constant_1.QUEUE_NAMES.POST_BOOKING_TASKS, async (job) => this.processPostBooking(job), {
            connection: this.getRedisConnection(),
            concurrency: 5,
        });
        // Setup event handlers
        this.setupWorkerEvents(this.postBookingWorker);
        this.logger.log('Post-booking worker initialized successfully');
    }
    getRedisConnection() {
        return {
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };
    }
    async processPostBooking(job) {
        const { bookingId, userEmail, confirmationCode } = job.data;
        this.logger.log(`Processing post-booking task for booking ${bookingId} (attempt ${job.attemptsMade + 1})`);
        try {
            // Mock email sending implementation
            // In a real system, this would integrate with an email service (e.g., SendGrid, AWS SES, etc.)
            this.logger.log(`Sending confirmation email to ${userEmail}`);
            this.logger.log(`Booking ID: ${bookingId}`);
            this.logger.log(`Confirmation Code: ${confirmationCode}`);
            // Simulate email sending delay
            await new Promise((resolve) => setTimeout(resolve, 100));
            // Mock successful email delivery
            this.logger.log(`Confirmation email sent successfully to ${userEmail} for booking ${bookingId}`);
            return {
                success: true,
                emailSent: true,
                recipient: userEmail,
                bookingId,
                confirmationCode,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send confirmation email for booking ${bookingId}: ${errorMessage}`);
            throw error; // Let BullMQ handle retry
        }
    }
    setupWorkerEvents(worker) {
        worker.on('completed', (job) => {
            this.logger.log(`Post-booking job ${job.id} completed successfully`);
        });
        worker.on('failed', (job, error) => {
            this.logger.error(`Post-booking job ${job?.id || 'unknown'} failed: ${error.message}`, error.stack);
        });
        worker.on('stalled', (jobId) => {
            this.logger.warn(`Post-booking job ${jobId} stalled`);
        });
        worker.on('error', (error) => {
            this.logger.error(`Post-booking worker error: ${error.message}`, error.stack);
        });
    }
    async onModuleDestroy() {
        this.logger.log('Closing post-booking worker...');
        await this.postBookingWorker?.close();
        this.logger.log('Post-booking worker closed');
    }
};
exports.PostBookingWorker = PostBookingWorker;
exports.PostBookingWorker = PostBookingWorker = PostBookingWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PostBookingWorker);
//# sourceMappingURL=post-booking.worker.js.map