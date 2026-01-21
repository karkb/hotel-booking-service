import { Queue } from 'bullmq';
export declare class BullBoardService {
    private vendorAQueue;
    private vendorBQueue;
    private postBookingQueue;
    private serverAdapter;
    constructor(vendorAQueue: Queue, vendorBQueue: Queue, postBookingQueue: Queue);
    getRouter(): any;
}
export declare class BullBoardModule {
}
