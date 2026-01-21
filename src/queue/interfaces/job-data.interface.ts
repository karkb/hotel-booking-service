export interface AlternateVendor {
  vendor: string;
  vendorHotelId: string;
  price: string;
}

export interface VendorBookingJobData {
  bookingId: string;
  vendor: string;
  vendorHotelId: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  alternateVendors?: AlternateVendor[];
  userEmail?: string; // for notifications
}

export interface PostBookingJobData {
  bookingId: string;
  userEmail: string;
  confirmationCode: string;
}
