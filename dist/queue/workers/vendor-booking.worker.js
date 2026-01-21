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
var VendorBookingWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorBookingWorker = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../../booking/booking.entity");
const booking_attempt_entity_1 = require("../../booking/booking-attempt.entity");
const booking_status_enum_1 = require("../../common/enums/booking-status.enum");
const vendor_queues_constant_1 = require("../../vendor/constants/vendor-queues.constant");
let VendorBookingWorker = VendorBookingWorker_1 = class VendorBookingWorker {
    constructor(postBookingQueue, vendorAdapter, bookingRepo, attemptRepo, configService) {
        this.postBookingQueue = postBookingQueue;
        this.vendorAdapter = vendorAdapter;
        this.bookingRepo = bookingRepo;
        this.attemptRepo = attemptRepo;
        this.configService = configService;
        this.logger = new common_1.Logger(VendorBookingWorker_1.name);
    }
    async onModuleInit() {
        this.logger.log('Initializing vendor booking workers...');
        // Get shared concurrency setting for all workers
        const workerConcurrency = parseInt(this.configService.get('WORKER_CONCURRENCY', '5'), 10) || 5;
        // Vendor A Worker
        this.vendorAWorker = new bullmq_1.Worker(vendor_queues_constant_1.VENDOR_QUEUE_NAMES.VENDOR_A_BOOKINGS, async (job) => this.processVendorBooking(job, vendor_queues_constant_1.VENDOR_NAMES.VENDOR_A.id), {
            connection: this.getRedisConnection(),
            concurrency: workerConcurrency,
        });
        // Vendor B Worker
        this.vendorBWorker = new bullmq_1.Worker(vendor_queues_constant_1.VENDOR_QUEUE_NAMES.VENDOR_B_BOOKINGS, async (job) => this.processVendorBooking(job, vendor_queues_constant_1.VENDOR_NAMES.VENDOR_B.id), {
            connection: this.getRedisConnection(),
            concurrency: workerConcurrency,
        });
        // Setup event handlers for each worker
        this.setupWorkerEvents(this.vendorAWorker, vendor_queues_constant_1.VENDOR_NAMES.VENDOR_A.displayName);
        this.setupWorkerEvents(this.vendorBWorker, vendor_queues_constant_1.VENDOR_NAMES.VENDOR_B.displayName);
        this.logger.log(`Vendor booking workers initialized with concurrency: ${workerConcurrency}`);
    }
    getRedisConnection() {
        return {
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };
    }
    async processVendorBooking(job, vendor) {
        const { bookingId, vendorHotelId, alternateVendors, checkIn, checkOut, guests } = job.data;
        const startTime = Date.now(); // Track timing for both success and failure
        try {
            // ===== Try Primary Vendor =====
            this.logger.log(`[Attempt ${job.attemptsMade + 1}] Booking ${bookingId} with primary vendor ${vendor}`);
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
            attempt.responsePayload = result;
            await this.attemptRepo.save(attempt);
            await this.bookingRepo.update(bookingId, {
                status: booking_status_enum_1.BookingStatus.CONFIRMED,
                externalReference: result.bookingId,
                confirmedAt: new Date(),
            });
            this.logger.log(`✓ Booking ${bookingId} confirmed with primary vendor ${vendor}`);
            return { success: true };
        }
        catch (error) {
            // Primary vendor FAILED
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const statusCode = error.statusCode || 500;
            const failedDuration = Date.now() - startTime;
            this.logger.error(`✗ Primary vendor ${vendor} failed for booking ${bookingId}: ${errorMessage}`);
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
                this.logger.warn(`⚠ Primary vendor ${vendor} exhausted all retries. Attempting FAILOVER to ${alternateVendors.length} alternate vendor(s)...`);
                // Try each alternate vendor
                for (let i = 0; i < alternateVendors.length; i++) {
                    const alt = alternateVendors[i];
                    // Validate alternate vendor before attempting
                    if (!alt.vendor || !alt.vendorHotelId) {
                        this.logger.warn(`[Failover ${i + 1}/${alternateVendors.length}] Skipping invalid alternate vendor - missing vendor ID or hotel ID`);
                        continue;
                    }
                    // Skip if alternate vendor is same as primary (should not happen, but safety check)
                    if (alt.vendor === vendor) {
                        this.logger.warn(`[Failover ${i + 1}/${alternateVendors.length}] Skipping alternate vendor ${alt.vendor} - same as primary`);
                        continue;
                    }
                    try {
                        this.logger.log(`[Failover ${i + 1}/${alternateVendors.length}] Trying vendor ${alt.vendor} for booking ${bookingId}`);
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
                        failoverAttempt.responsePayload = result;
                        await this.attemptRepo.save(failoverAttempt);
                        await this.bookingRepo.update(bookingId, {
                            status: booking_status_enum_1.BookingStatus.CONFIRMED,
                            vendor: alt.vendor, // Update to failover vendor
                            vendorHotelId: alt.vendorHotelId,
                            externalReference: result.bookingId,
                            confirmedAt: new Date(),
                            failoverUsed: true,
                        });
                        this.logger.log(`✓ Booking ${bookingId} confirmed via FAILOVER with vendor ${alt.vendor}`);
                        return { success: true }; // Exit successfully
                    }
                    catch (failoverError) {
                        const failoverErrorMessage = failoverError instanceof Error ? failoverError.message : 'Unknown error';
                        const failoverStatusCode = failoverError.statusCode || 500;
                        this.logger.error(`✗ Failover vendor ${alt.vendor} also failed: ${failoverErrorMessage}`);
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
                this.logger.error(`✗✗✗ Booking ${bookingId} FAILED - all ${alternateVendors.length + 1} vendor options exhausted`);
                await this.bookingRepo.update(bookingId, {
                    status: booking_status_enum_1.BookingStatus.FAILED,
                });
                // Throw error so job appears in failed queue (not completed)
                throw new Error(`All ${alternateVendors.length + 1} vendor options exhausted for booking ${bookingId}`);
            }
            // Not final attempt or no alternates available - let BullMQ retry primary
            throw error;
        }
    }
    setupWorkerEvents(worker, name) {
        worker.on('completed', (job) => {
            this.logger.log(`${name} job ${job.id} completed successfully`);
        });
        worker.on('failed', async (job, error) => {
            this.logger.error(`${name} job ${job?.id || 'unknown'} failed: ${error.message}`, error.stack);
            // Update booking status to FAILED if still PENDING after all retries exhausted
            if (job?.data?.bookingId) {
                try {
                    const booking = await this.bookingRepo.findOne({
                        where: { id: job.data.bookingId },
                    });
                    if (booking && booking.status === booking_status_enum_1.BookingStatus.PENDING) {
                        await this.bookingRepo.update(job.data.bookingId, {
                            status: booking_status_enum_1.BookingStatus.FAILED,
                        });
                        this.logger.error(`✗✗✗ Booking ${job.data.bookingId} marked as FAILED after exhausting all retries`);
                    }
                }
                catch (updateError) {
                    this.logger.error(`Failed to update booking ${job.data.bookingId} status: ${updateError}`);
                }
            }
        });
        worker.on('stalled', (jobId) => {
            this.logger.warn(`${name} job ${jobId} stalled`);
        });
        worker.on('error', (error) => {
            this.logger.error(`${name} worker error: ${error.message}`, error.stack);
        });
    }
    async onModuleDestroy() {
        this.logger.log('Closing vendor booking workers...');
        await this.vendorAWorker?.close();
        await this.vendorBWorker?.close();
        this.logger.log('Vendor booking workers closed');
    }
};
exports.VendorBookingWorker = VendorBookingWorker;
exports.VendorBookingWorker = VendorBookingWorker = VendorBookingWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('POST_BOOKING_QUEUE')),
    __param(1, (0, common_1.Inject)('IVendorAdapter')),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(booking_attempt_entity_1.BookingAttempt)),
    __metadata("design:paramtypes", [bullmq_1.Queue, Object, typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], VendorBookingWorker);
//# sourceMappingURL=vendor-booking.worker.js.map