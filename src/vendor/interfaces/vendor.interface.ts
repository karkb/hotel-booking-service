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
  // Vendor-specific optional fields
  metadata?: Record<string, any>; // Vendor A specific
  transactionId?: string; // Vendor B specific
  vendorLegacyRef?: string; // Vendor B specific
  soapVersion?: string; // Vendor B specific
}

export interface IVendorAdapter {
  createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse>;
}
