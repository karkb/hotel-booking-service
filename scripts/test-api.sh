#!/bin/bash

set -e

echo "🧪 Testing Etera Hotel Booking Service API..."
echo ""

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

# Check if app is running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pre-flight Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$BASE_URL/api/docs" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Application is not running at $BASE_URL${NC}"
  echo "Please start the application with: npm run start:dev"
  exit 1
fi
echo -e "${GREEN}✅ Application is running${NC}"
echo ""

# Test 1: Create a booking with Vendor A
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Create Booking (Vendor A)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BOOKING_A=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Doe",
    "roomType": "deluxe",
    "checkIn": "2026-02-01",
    "checkOut": "2026-02-05",
    "vendorId": "vendor-a"
  }')

BOOKING_A_ID=$(echo $BOOKING_A | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$BOOKING_A_ID" ]; then
  echo -e "${GREEN}✅ Booking created: $BOOKING_A_ID${NC}"
  echo "Response: $BOOKING_A" | jq '.' 2>/dev/null || echo "$BOOKING_A"
else
  echo -e "${RED}❌ Failed to create booking${NC}"
  echo "Response: $BOOKING_A"
fi
echo ""

# Wait for processing
echo "⏳ Waiting for queue processing (5 seconds)..."
sleep 5
echo ""

# Test 2: Get booking details
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Get Booking Details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$BOOKING_A_ID" ]; then
  BOOKING_DETAILS=$(curl -s "$API_URL/bookings/$BOOKING_A_ID")
  echo "Response: $BOOKING_DETAILS" | jq '.' 2>/dev/null || echo "$BOOKING_DETAILS"
  test_result $? "Get booking details"
fi
echo ""

# Test 3: Get booking status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Get Booking Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$BOOKING_A_ID" ]; then
  BOOKING_STATUS=$(curl -s "$API_URL/bookings/$BOOKING_A_ID/status")
  echo "Response: $BOOKING_STATUS" | jq '.' 2>/dev/null || echo "$BOOKING_STATUS"
  test_result $? "Get booking status"
fi
echo ""

# Test 4: Create booking with Vendor B
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Create Booking (Vendor B)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BOOKING_B=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Jane Smith",
    "roomType": "standard",
    "checkIn": "2026-03-01",
    "checkOut": "2026-03-03",
    "vendorId": "vendor-b"
  }')

BOOKING_B_ID=$(echo $BOOKING_B | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$BOOKING_B_ID" ]; then
  echo -e "${GREEN}✅ Booking created: $BOOKING_B_ID${NC}"
  echo "Response: $BOOKING_B" | jq '.' 2>/dev/null || echo "$BOOKING_B"
else
  echo -e "${RED}❌ Failed to create booking${NC}"
  echo "Response: $BOOKING_B"
fi
echo ""

# Test 5: List all bookings
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: List All Bookings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ALL_BOOKINGS=$(curl -s "$API_URL/bookings")
echo "Response: $ALL_BOOKINGS" | jq '.' 2>/dev/null || echo "$ALL_BOOKINGS"
test_result $? "List all bookings"
echo ""

# Test 6: Filter bookings by status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Filter Bookings by Status (PENDING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PENDING_BOOKINGS=$(curl -s "$API_URL/bookings?status=PENDING")
echo "Response: $PENDING_BOOKINGS" | jq '.' 2>/dev/null || echo "$PENDING_BOOKINGS"
test_result $? "Filter bookings by status"
echo ""

# Test 7: Test idempotency
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Test Idempotency"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
IDEMPOTENCY_KEY="test-$(date +%s)"
BOOKING_1=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "guestName": "Test User",
    "roomType": "suite",
    "checkIn": "2026-04-01",
    "checkOut": "2026-04-05",
    "vendorId": "vendor-a"
  }')

BOOKING_2=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "guestName": "Test User",
    "roomType": "suite",
    "checkIn": "2026-04-01",
    "checkOut": "2026-04-05",
    "vendorId": "vendor-a"
  }')

ID_1=$(echo $BOOKING_1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
ID_2=$(echo $BOOKING_2 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ "$ID_1" == "$ID_2" ]; then
  echo -e "${GREEN}✅ Idempotency working (same booking ID: $ID_1)${NC}"
else
  echo -e "${RED}❌ Idempotency failed (different IDs: $ID_1 vs $ID_2)${NC}"
fi
echo ""

# Test 8: Check queue metrics
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 8: Check Queue Metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
METRICS=$(curl -s "$BASE_URL/admin/queues/metrics")
echo "Response: $METRICS" | jq '.' 2>/dev/null || echo "$METRICS"
test_result $? "Get queue metrics"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ All API tests completed!${NC}"
echo ""
echo "📊 View queue dashboard: $BASE_URL/admin/queues/ui"
echo "📚 View API docs: $BASE_URL/api/docs"
echo ""
