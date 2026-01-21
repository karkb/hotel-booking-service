"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const redis_module_1 = require("../redis/redis.module");
const vendor_module_1 = require("../vendor/vendor.module");
const booking_entity_1 = require("../booking/booking.entity");
const booking_attempt_entity_1 = require("../booking/booking-attempt.entity");
const queue_config_1 = require("./config/queue.config");
const queue_names_constant_1 = require("./constants/queue-names.constant");
const queue_metrics_controller_1 = require("./metrics/queue-metrics.controller");
const queue_metrics_service_1 = require("./metrics/queue-metrics.service");
const queue_cleanup_service_1 = require("./maintenance/queue-cleanup.service");
const vendor_booking_worker_1 = require("./workers/vendor-booking.worker");
const post_booking_worker_1 = require("./workers/post-booking.worker");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule, vendor_module_1.VendorModule, typeorm_1.TypeOrmModule.forFeature([booking_entity_1.Booking, booking_attempt_entity_1.BookingAttempt])],
        controllers: [queue_metrics_controller_1.QueueMetricsController],
        providers: [
            queue_config_1.QueueConfigService,
            queue_metrics_service_1.QueueMetricsService,
            queue_cleanup_service_1.QueueCleanupService,
            vendor_booking_worker_1.VendorBookingWorker,
            post_booking_worker_1.PostBookingWorker,
            // Post-Booking Queue
            {
                provide: queue_names_constant_1.QUEUE_TOKENS.POST_BOOKING_QUEUE,
                useFactory: (queueConfig) => {
                    return queueConfig.createQueue({
                        name: queue_names_constant_1.QUEUE_NAMES.POST_BOOKING_TASKS,
                        defaultJobOptions: queueConfig.getPostBookingJobOptions(),
                    });
                },
                inject: [queue_config_1.QueueConfigService],
            },
        ],
        exports: [queue_config_1.QueueConfigService, queue_metrics_service_1.QueueMetricsService, queue_names_constant_1.QUEUE_TOKENS.POST_BOOKING_QUEUE],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map