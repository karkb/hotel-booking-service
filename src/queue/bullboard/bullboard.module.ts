import { Module } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { VendorModule } from '../../vendor/vendor.module';

@Injectable()
export class BullBoardService {
  private serverAdapter: ExpressAdapter;

  constructor(
    @Inject('VENDOR_A_QUEUE') private vendorAQueue: Queue,
    @Inject('VENDOR_B_QUEUE') private vendorBQueue: Queue,
    @Inject('POST_BOOKING_QUEUE') private postBookingQueue: Queue,
  ) {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues/ui');

    createBullBoard({
      queues: [
        new BullMQAdapter(this.vendorAQueue),
        new BullMQAdapter(this.vendorBQueue),
        new BullMQAdapter(this.postBookingQueue),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  getRouter() {
    return this.serverAdapter.getRouter();
  }
}

@Module({
  imports: [VendorModule],
  providers: [BullBoardService],
  exports: [BullBoardService],
})
export class BullBoardModule {}
