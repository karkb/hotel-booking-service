import { Booking } from './booking.entity';
export declare class BookingAttempt {
    id: string;
    bookingId: string;
    attemptNumber: number;
    vendor: string;
    requestPayload: Record<string, unknown>;
    responsePayload: Record<string, unknown> | null;
    durationMs: number | null;
    statusCode: number | null;
    errorMessage: string | null;
    isFailover: boolean;
    createdAt: Date;
    booking: Booking;
}
