import { Module } from '@nestjs/common';
import { QueueConfigService } from '../queue';
import { VendorAService } from './services/vendors/vendor-a.service';
import { VendorBService } from './services/vendors/vendor-b.service';
import { VendorFactory } from './services/vendor.factory';
import { VendorAdapterService } from './services/vendor-adapter.service';
import { VENDOR_QUEUE_NAMES, VENDOR_QUEUE_TOKENS } from './constants/vendor-queues.constant';

@Module({
  providers: [
    VendorAService,
    VendorBService,
    VendorFactory,
    {
      provide: 'IVendorAdapter',
      useClass: VendorAdapterService,
    },
    // Vendor A Queue
    {
      provide: VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE,
      useFactory: (queueConfig: QueueConfigService) => {
        return queueConfig.createQueue({
          name: VENDOR_QUEUE_NAMES.VENDOR_A_BOOKINGS,
          defaultJobOptions: queueConfig.getVendorBookingJobOptions(),
        });
      },
      inject: [QueueConfigService],
    },
    // Vendor B Queue
    {
      provide: VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE,
      useFactory: (queueConfig: QueueConfigService) => {
        return queueConfig.createQueue({
          name: VENDOR_QUEUE_NAMES.VENDOR_B_BOOKINGS,
          defaultJobOptions: queueConfig.getVendorBookingJobOptions(),
        });
      },
      inject: [QueueConfigService],
    },
  ],
  exports: [
    'IVendorAdapter',
    VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE,
    VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE,
  ],
})
export class VendorModule {}
