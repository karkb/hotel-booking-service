import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Booking } from '../../booking/booking.entity';
import { BookingAttempt } from '../../booking/booking-attempt.entity';
import { IVendorAdapter } from '../../vendor/interfaces/vendor.interface';
export declare class VendorBookingWorker implements OnModuleInit, OnModuleDestroy {
    private readonly postBookingQueue;
    private readonly vendorAdapter;
    private readonly bookingRepo;
    private readonly attemptRepo;
    private readonly configService;
    private readonly logger;
    private vendorAWorker?;
    private vendorBWorker?;
    constructor(postBookingQueue: Queue, vendorAdapter: IVendorAdapter, bookingRepo: Repository<Booking>, attemptRepo: Repository<BookingAttempt>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private getRedisConnection;
    private processVendorBooking;
    private setupWorkerEvents;
    onModuleDestroy(): Promise<void>;
}
