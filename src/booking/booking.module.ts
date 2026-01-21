import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueModule } from '../queue/queue.module';
import { VendorModule } from '../vendor/vendor.module';
import { BookingAttempt } from './booking-attempt.entity';
import { BookingController } from './booking.controller';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { HotelVendorOption } from './hotel-vendor-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingAttempt, HotelVendorOption]),
    VendorModule,
    QueueModule,
  ],
  providers: [BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
