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
exports.QueueMetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const queue_metrics_service_1 = require("./queue-metrics.service");
let QueueMetricsController = class QueueMetricsController {
    constructor(queueMetricsService) {
        this.queueMetricsService = queueMetricsService;
    }
    /**
     * Get queue metrics for monitoring
     */
    async getMetrics() {
        return this.queueMetricsService.getQueueMetrics();
    }
    /**
     * Health check for queues
     */
    async healthCheck() {
        const metrics = await this.queueMetricsService.getQueueMetrics();
        const isHealthy = metrics.vendorA.waiting < 1000 && metrics.vendorB.waiting < 1000;
        return {
            status: isHealthy ? 'healthy' : 'degraded',
            queues: metrics,
        };
    }
};
exports.QueueMetricsController = QueueMetricsController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get queue metrics for monitoring' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueMetricsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for queues' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueMetricsController.prototype, "healthCheck", null);
exports.QueueMetricsController = QueueMetricsController = __decorate([
    (0, common_1.Controller)('admin/queues'),
    (0, swagger_1.ApiTags)('Queue Monitoring'),
    __metadata("design:paramtypes", [queue_metrics_service_1.QueueMetricsService])
], QueueMetricsController);
//# sourceMappingURL=queue-metrics.controller.js.map