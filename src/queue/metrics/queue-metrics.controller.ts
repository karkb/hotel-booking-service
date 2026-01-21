import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueueMetricsService } from './queue-metrics.service';

@Controller('admin/queues')
@ApiTags('Queue Monitoring')
export class QueueMetricsController {
  constructor(private readonly queueMetricsService: QueueMetricsService) {}

  /**
   * Get queue metrics for monitoring
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Get queue metrics for monitoring' })
  async getMetrics() {
    return this.queueMetricsService.getQueueMetrics();
  }

  /**
   * Health check for queues
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for queues' })
  async healthCheck() {
    const metrics = await this.queueMetricsService.getQueueMetrics();

    const isHealthy = metrics.vendorA.waiting < 1000 && metrics.vendorB.waiting < 1000;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      queues: metrics,
    };
  }
}
