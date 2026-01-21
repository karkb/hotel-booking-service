export enum BookingStatus {
  PENDING = 'PENDING', // Booking in progress with vendor
  CONFIRMED = 'CONFIRMED', // Successfully booked
  FAILED = 'FAILED', // Failed after all retries
}
