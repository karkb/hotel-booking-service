export interface VendorBookingRequest {
    vendor: string;
    vendorHotelId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
}
export interface VendorBookingResponse {
    bookingId: string;
    status: string;
    confirmationCode: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    transactionId?: string;
    vendorLegacyRef?: string;
    soapVersion?: string;
}
export interface IVendorAdapter {
    createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
}
