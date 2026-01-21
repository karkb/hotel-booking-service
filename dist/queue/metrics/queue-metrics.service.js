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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueMetricsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const vendor_queues_constant_1 = require("../../vendor/constants/vendor-queues.constant");
let QueueMetricsService = class QueueMetricsService {
    constructor(vendorAQueue, vendorBQueue) {
        this.vendorAQueue = vendorAQueue;
        this.vendorBQueue = vendorBQueue;
    }
    /**
     * Get metrics for all vendor queues
     */
    async getQueueMetrics() {
        const [vendorAMetrics, vendorBMetrics] = await Promise.all([
            this.getMetricsForQueue(this.vendorAQueue, 'vendor-a'),
            this.getMetricsForQueue(this.vendorBQueue, 'vendor-b'),
        ]);
        return {
            vendorA: vendorAMetrics,
            vendorB: vendorBMetrics,
            timestamp: new Date(),
        };
    }
    /**
     * Get detailed metrics for a specific queue
     */
    async getMetricsForQueue(queue, name) {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);
        return {
            name,
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + delayed,
        };
    }
};
exports.QueueMetricsService = QueueMetricsService;
exports.QueueMetricsService = QueueMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)),
    __param(1, (0, common_1.Inject)(vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        bullmq_1.Queue])
], QueueMetricsService);
//# sourceMappingURL=queue-metrics.service.js.map