"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingTables1234567890123 = void 0;
class CreateBookingTables1234567890123 {
    constructor() {
        this.name = 'CreateBookingTables1234567890123';
    }
    async up(queryRunner) {
        // Create BookingStatus enum type
        await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'FAILED')
    `);
        // Create bookings table
        await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "vendor" character varying(10) NOT NULL,
        "hotelId" character varying(100) NOT NULL,
        "hotelName" character varying(200),
        "vendorHotelId" character varying(100),
        "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING',
        "externalReference" character varying(200),
        "idempotencyKey" character varying(100) NOT NULL,
        "checkInDate" date NOT NULL,
        "checkOutDate" date NOT NULL,
        "guests" integer NOT NULL,
        "totalPrice" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'AED',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "confirmedAt" TIMESTAMP,
        "failoverUsed" boolean DEFAULT false,
        "originalVendor" character varying(10),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);
        // Create indexes for bookings table
        await queryRunner.query(`
      CREATE INDEX "idx_bookings_user_created_at" ON "bookings" ("userId", "createdAt")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_bookings_status_created_at" ON "bookings" ("status", "createdAt")
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_bookings_idempotency_key" ON "bookings" ("idempotencyKey")
    `);
        // Create booking_attempts table
        await queryRunner.query(`
      CREATE TABLE "booking_attempts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bookingId" uuid NOT NULL,
        "attemptNumber" integer NOT NULL,
        "vendor" character varying(10) NOT NULL,
        "requestPayload" jsonb NOT NULL,
        "responsePayload" jsonb,
        "durationMs" integer,
        "statusCode" integer,
        "errorMessage" text,
        "isFailover" boolean DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_attempts" PRIMARY KEY ("id")
      )
    `);
        // Create index for booking_attempts table
        await queryRunner.query(`
      CREATE INDEX "idx_booking_attempts_booking_attempt" ON "booking_attempts" ("bookingId", "attemptNumber")
    `);
        // Add foreign key constraint
        await queryRunner.query(`
      ALTER TABLE "booking_attempts"
      ADD CONSTRAINT "FK_booking_attempts_bookingId"
      FOREIGN KEY ("bookingId")
      REFERENCES "bookings"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
    }
    async down(queryRunner) {
        // Drop foreign key constraint
        await queryRunner.query(`
      ALTER TABLE "booking_attempts"
      DROP CONSTRAINT "FK_booking_attempts_bookingId"
    `);
        // Drop indexes for booking_attempts
        await queryRunner.query(`
      DROP INDEX "idx_booking_attempts_booking_attempt"
    `);
        // Drop booking_attempts table
        await queryRunner.query(`
      DROP TABLE "booking_attempts"
    `);
        // Drop indexes for bookings
        await queryRunner.query(`
      DROP INDEX "idx_bookings_idempotency_key"
    `);
        await queryRunner.query(`
      DROP INDEX "idx_bookings_status_created_at"
    `);
        await queryRunner.query(`
      DROP INDEX "idx_bookings_user_created_at"
    `);
        // Drop bookings table
        await queryRunner.query(`
      DROP TABLE "bookings"
    `);
        // Drop enum type
        await queryRunner.query(`
      DROP TYPE "booking_status_enum"
    `);
    }
}
exports.CreateBookingTables1234567890123 = CreateBookingTables1234567890123;
//# sourceMappingURL=1234567890123-CreateBookingTables.js.map