import { Queue } from 'bullmq';
export declare class QueueMetricsService {
    private readonly vendorAQueue;
    private readonly vendorBQueue;
    constructor(vendorAQueue: Queue, vendorBQueue: Queue);
    /**
     * Get metrics for all vendor queues
     */
    getQueueMetrics(): Promise<{
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
     * Get detailed metrics for a specific queue
     */
    private getMetricsForQueue;
}
