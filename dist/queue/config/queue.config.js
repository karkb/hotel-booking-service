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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
let QueueConfigService = class QueueConfigService {
    constructor(configService) {
        this.configService = configService;
    }
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
    createQueue(options) {
        const queueOptions = {
            connection: this.getRedisConnection(),
            defaultJobOptions: options.defaultJobOptions || this.getDefaultJobOptions(),
        };
        return new bullmq_1.Queue(options.name, queueOptions);
    }
    /**
     * Get default job options (can be overridden per queue)
     */
    getDefaultJobOptions() {
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
    getVendorBookingJobOptions() {
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
    getPostBookingJobOptions() {
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
};
exports.QueueConfigService = QueueConfigService;
exports.QueueConfigService = QueueConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueConfigService);
//# sourceMappingURL=queue.config.js.map