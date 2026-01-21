import { BookingStatus } from '../common/enums/booking-status.enum';
import { BookingAttempt } from './booking-attempt.entity';
export declare class Booking {
    id: string;
    userId: string;
    vendor: string;
    hotelId: string;
    hotelName: string | null;
    vendorHotelId: string | null;
    status: BookingStatus;
    externalReference: string | null;
    idempotencyKey: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    totalPrice: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    failoverUsed: boolean | null;
    originalVendor: string | null;
    attempts: BookingAttempt[];
}
