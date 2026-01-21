import { BookingStatus } from '../../common/enums/booking-status.enum';
export declare class QueryBookingsDto {
    status?: BookingStatus;
    page?: number;
    limit?: number;
}
