#!/bin/bash

# Audit script for failed bookings
# Shows booking status, attempts, and vendor responses

echo "======================================"
echo "Hotel Booking Audit Tool"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if booking ID is provided
if [ -n "$1" ]; then
  BOOKING_ID_FILTER="WHERE b.\"bookingId\" = '$1'"
  echo "Filtering for Booking ID: $1"
else
  BOOKING_ID_FILTER=""
  echo "Showing all bookings"
fi

echo ""
echo "${BLUE}=== BOOKINGS OVERVIEW ===${NC}"
docker exec -i hotel-booking-postgres psql -U hoteluser -d hotelbookingdb << EOF
SELECT 
  "bookingId",
  "userId",
  status,
  "primaryVendor",
  "finalVendor",
  "totalPrice",
  "createdAt",
  "updatedAt"
FROM bookings
$BOOKING_ID_FILTER
ORDER BY "createdAt" DESC;
EOF

echo ""
echo "${BLUE}=== BOOKING ATTEMPTS ===${NC}"
docker exec -i hotel-booking-postgres psql -U hoteluser -d hotelbookingdb << EOF
SELECT 
  ba."bookingId",
  ba.vendor,
  ba."attemptNumber",
  ba.status,
  ba."errorMessage",
  ba.price,
  ba."responseTime",
  ba."attemptedAt"
FROM booking_attempts ba
JOIN bookings b ON ba."bookingId" = b."bookingId"
$BOOKING_ID_FILTER
ORDER BY ba."attemptedAt" DESC;
EOF

echo ""
echo "${BLUE}=== VENDOR OPTIONS STORED ===${NC}"
docker exec -i hotel-booking-postgres psql -U hoteluser -d hotelbookingdb << EOF
SELECT 
  hvo."bookingId",
  hvo.vendor,
  hvo.price,
  hvo.available,
  hvo."hotelId",
  hvo."retrievedAt"
FROM hotel_vendor_options hvo
JOIN bookings b ON hvo."bookingId" = b."bookingId"
$BOOKING_ID_FILTER
ORDER BY hvo."retrievedAt" DESC;
EOF

echo ""
echo "${BLUE}=== FAILED BOOKINGS SUMMARY ===${NC}"
docker exec -i hotel-booking-postgres psql -U hoteluser -d hotelbookingdb << EOF
SELECT 
  b."bookingId",
  b.status,
  b."primaryVendor",
  COUNT(ba.id) as total_attempts,
  COUNT(CASE WHEN ba.status = 'failed' THEN 1 END) as failed_attempts,
  STRING_AGG(DISTINCT ba.vendor, ', ') as vendors_tried,
  MAX(ba."attemptedAt") as last_attempt
FROM bookings b
LEFT JOIN booking_attempts ba ON b."bookingId" = ba."bookingId"
WHERE b.status = 'failed'
$BOOKING_ID_FILTER
GROUP BY b."bookingId", b.status, b."primaryVendor"
ORDER BY last_attempt DESC;
EOF

echo ""
echo "${YELLOW}=== AUDIT COMPLETE ===${NC}"
