import { BookingStatus } from '../../common/enums/booking-status.enum';
import { BookingAttemptDetailDto } from './booking-attempt.dto';
export declare class BookingResponseDto {
    id: string;
    hotelId: string;
    status: BookingStatus;
    externalReference: string | null;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    totalPrice: number;
    currency: string;
    createdAt: Date;
    confirmedAt: Date | null;
    attempts?: BookingAttemptDetailDto[];
}
