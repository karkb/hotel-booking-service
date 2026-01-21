import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { VENDOR_QUEUE_TOKENS } from '../../vendor/constants/vendor-queues.constant';

@Injectable()
export class QueueMetricsService {
  constructor(
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE)
    private readonly vendorAQueue: Queue,
    @Inject(VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE)
    private readonly vendorBQueue: Queue,
  ) {}

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
  private async getMetricsForQueue(queue: Queue, name: string) {
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
}
