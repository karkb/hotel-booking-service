import { Injectable, Logger } from '@nestjs/common';
import {
  IVendorAdapter,
  VendorBookingRequest,
  VendorBookingResponse,
} from '../interfaces/vendor.interface';
import { VendorFactory } from './vendor.factory';

/**
 * Vendor Adapter Service
 * Implements Adapter Pattern and Strategy Pattern
 * Uses Factory for vendor selection (Dependency Inversion Principle)
 * Depends on abstractions (BaseVendorService) not concrete implementations
 */
@Injectable()
export class VendorAdapterService implements IVendorAdapter {
  private readonly logger = new Logger(VendorAdapterService.name);

  constructor(private readonly vendorFactory: VendorFactory) {}

  async createBooking(request: VendorBookingRequest): Promise<VendorBookingResponse> {
    this.logger.log(
      `Routing booking to Vendor ${request.vendor} for hotel: ${request.vendorHotelId}`,
    );
    this.logger.debug(
      `Booking details - CheckIn: ${request.checkIn}, CheckOut: ${request.checkOut}, Guests: ${request.guests}`,
    );

    try {
      const startTime = Date.now();

      // Use factory to get appropriate vendor service (Strategy Pattern)
      // No switch statement needed - follows Open/Closed Principle
      const vendorService = this.vendorFactory.getVendor(request.vendor);
      const response = await vendorService.createBooking(request);

      const duration = Date.now() - startTime;

      this.logger.log(
        `Vendor ${request.vendor} booking successful: ${response.bookingId} (took ${duration}ms)`,
      );
      this.logger.debug(
        `Confirmation code: ${response.confirmationCode}, Status: ${response.status}`,
      );

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create booking with vendor ${request.vendor}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
