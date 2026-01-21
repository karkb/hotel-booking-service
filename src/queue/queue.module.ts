import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { VendorModule } from '../vendor/vendor.module';
import { Booking } from '../booking/booking.entity';
import { BookingAttempt } from '../booking/booking-attempt.entity';
import { QueueConfigService } from './config/queue.config';
import { QUEUE_NAMES, QUEUE_TOKENS } from './constants/queue-names.constant';
import { QueueMetricsController } from './metrics/queue-metrics.controller';
import { QueueMetricsService } from './metrics/queue-metrics.service';
import { QueueCleanupService } from './maintenance/queue-cleanup.service';
import { VendorBookingWorker } from './workers/vendor-booking.worker';
import { PostBookingWorker } from './workers/post-booking.worker';

@Global()
@Module({
  imports: [RedisModule, VendorModule, TypeOrmModule.forFeature([Booking, BookingAttempt])],
  controllers: [QueueMetricsController],
  providers: [
    QueueConfigService,
    QueueMetricsService,
    QueueCleanupService,
    VendorBookingWorker,
    PostBookingWorker,
    // Post-Booking Queue
    {
      provide: QUEUE_TOKENS.POST_BOOKING_QUEUE,
      useFactory: (queueConfig: QueueConfigService) => {
        return queueConfig.createQueue({
          name: QUEUE_NAMES.POST_BOOKING_TASKS,
          defaultJobOptions: queueConfig.getPostBookingJobOptions(),
        });
      },
      inject: [QueueConfigService],
    },
  ],
  exports: [QueueConfigService, QueueMetricsService, QUEUE_TOKENS.POST_BOOKING_QUEUE],
})
export class QueueModule {}
