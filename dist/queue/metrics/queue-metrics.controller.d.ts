import { QueueMetricsService } from './queue-metrics.service';
export declare class QueueMetricsController {
    private readonly queueMetricsService;
    constructor(queueMetricsService: QueueMetricsService);
    /**
     * Get queue metrics for monitoring
     */
    getMetrics(): Promise<{
        vendorA: {
            name: string;
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            delayed: number;
            total: number;
        };
        vendorB: {
            name: string;
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            delayed: number;
            total: number;
        };
        timestamp: Date;
    }>;
    /**
     * Health check for queues
     */
    healthCheck(): Promise<{
        status: string;
        queues: {
            vendorA: {
                name: string;
                waiting: number;
                active: number;
                completed: number;
                failed: number;
                delayed: number;
                total: number;
            };
            vendorB: {
                name: string;
                waiting: number;
                active: number;
                completed: number;
                failed: number;
                delayed: number;
                total: number;
            };
            timestamp: Date;
        };
    }>;
}
