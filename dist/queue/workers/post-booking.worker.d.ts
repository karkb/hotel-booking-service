import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PostBookingWorker implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private postBookingWorker?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private getRedisConnection;
    private processPostBooking;
    private setupWorkerEvents;
    onModuleDestroy(): Promise<void>;
}
