import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BookingModule } from './booking/booking.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { VendorModule } from './vendor/vendor.module';
import { QueueModule } from './queue/queue.module';
import { BullBoardModule } from './queue/bullboard';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    DatabaseModule,
    VendorModule,
    QueueModule,
    BullBoardModule,
    BookingModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
