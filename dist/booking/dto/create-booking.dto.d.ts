import { ValidationOptions } from 'class-validator';
export declare function IsAfterDate(property: string, validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare class CreateBookingDto {
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    totalPrice: number;
    currency?: string;
}
