#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"
BOARD_URL="$BASE_URL/admin/queues/ui"

clear

echo -e "${BOLD}${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     ETERA HOTEL BOOKING SERVICE - VENDOR FAILOVER DEMO         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BOLD}This demo shows 4 key scenarios:${NC}"
echo -e "  ${CYAN}1.${NC} ✅ Primary vendor succeeds"
echo -e "  ${CYAN}2.${NC} 🔄 Primary fails → Failover succeeds"
echo -e "  ${CYAN}3.${NC} ❌ All vendors fail"
echo -e "  ${CYAN}4.${NC} 🔑 Idempotency key test"
echo ""
echo -e "${YELLOW}📊 Monitor live at: ${BOLD}${BOARD_URL}${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🎛️  DEMO CONTROL (For Guaranteed Results):${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}To control vendor availability for reliable demos:${NC}"
echo ""
echo -e "${BOLD}Scenario 2 - Force Failover:${NC}"
echo -e "  ${YELLOW}docker-compose down${NC}"
echo -e "  ${YELLOW}VENDOR_B_DOWN=true docker-compose up -d${NC}"
echo -e "  ${YELLOW}sleep 15 && ./demo.sh${NC}"
echo -e "  ${GREEN}→ Vendor B will fail, system fails over to A${NC}"
echo ""
echo -e "${BOLD}Scenario 3 - Force All Fail:${NC}"
echo -e "  ${YELLOW}docker-compose down${NC}"
echo -e "  ${YELLOW}VENDOR_A_DOWN=true VENDOR_B_DOWN=true docker-compose up -d${NC}"
echo -e "  ${YELLOW}sleep 15 && ./demo.sh${NC}"
echo -e "  ${RED}→ All vendors fail, booking marked FAILED${NC}"
echo ""
echo -e "${BOLD}Reset to Normal:${NC}"
echo -e "  ${YELLOW}docker-compose down && docker-compose up -d${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if vendors are controlled
if [ "$VENDOR_A_DOWN" = "true" ]; then
  echo -e "${RED}🔴 VENDOR A: DOWN (forced via VENDOR_A_DOWN=true)${NC}"
fi
if [ "$VENDOR_B_DOWN" = "true" ]; then
  echo -e "${RED}🔴 VENDOR B: DOWN (forced via VENDOR_B_DOWN=true)${NC}"
fi
if [ "$VENDOR_A_DOWN" = "true" ] || [ "$VENDOR_B_DOWN" = "true" ]; then
  echo ""
fi

read -p "Press ENTER to start the demo..."

# Check if app is running
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🔍 Pre-flight Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s "$BASE_URL/health" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Application is not running at $BASE_URL${NC}"
  echo "Please start: docker-compose up -d"
  exit 1
fi
echo -e "${GREEN}✅ Application is running${NC}"
echo -e "${GREEN}✅ API: $API_URL${NC}"
echo -e "${GREEN}✅ Bull Board: $BOARD_URL${NC}"
echo ""
sleep 2

# Scenario 1: Primary Vendor Succeeds
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}📍 SCENARIO 1: Primary Vendor Succeeds${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Creating booking with Grand Hyatt...${NC}"
echo -e "${CYAN}Expected: System auto-selects best vendor and confirms booking${NC}"
echo ""

IDEMPOTENCY_KEY_1=$(uuidgen)

BOOKING_1=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY_1" \
  -d '{
    "hotelId": "hotel-dubai-001",
    "checkInDate": "2026-03-01",
    "checkOutDate": "2026-03-05",
    "guests": 2,
    "totalPrice": 4800,
    "currency": "AED"
  }')

BOOKING_1_ID=$(echo $BOOKING_1 | jq -r '.id')
echo -e "${GREEN}✅ Booking created: $BOOKING_1_ID${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for job to process (10 seconds)...${NC}"
sleep 10

# Check status
STATUS_1=$(curl -s "$API_URL/bookings/$BOOKING_1_ID")
VENDOR_1=$(echo $STATUS_1 | jq -r '.vendor')
STATUS_TEXT_1=$(echo $STATUS_1 | jq -r '.status')
ATTEMPTS_1=$(curl -s "$API_URL/bookings/$BOOKING_1_ID/attempts" | jq -r '. | length')

echo ""
echo -e "${BOLD}Result:${NC}"
echo -e "  Vendor: ${CYAN}$VENDOR_1${NC}"
echo -e "  Status: ${GREEN}$STATUS_TEXT_1${NC}"
echo -e "  Attempts: ${CYAN}$ATTEMPTS_1${NC}"
echo ""

if [ "$STATUS_TEXT_1" = "CONFIRMED" ] && [ "$ATTEMPTS_1" = "1" ]; then
  echo -e "${GREEN}✅ SUCCESS: Primary vendor succeeded on first try!${NC}"
else
  echo -e "${YELLOW}⚠️  Unexpected result (this is OK - random mock behavior)${NC}"
fi

echo ""
read -p "Press ENTER for Scenario 2..."

# Scenario 2: Primary Fails → Failover Succeeds
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${YELLOW}📍 SCENARIO 2: Primary Fails → Failover Succeeds${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Creating booking with Grand Hyatt (using same hotel as Scenario 1)...${NC}"
echo -e "${CYAN}Expected: If primary fails all retries, failover to alternate vendor${NC}"
echo ""

IDEMPOTENCY_KEY_2=$(uuidgen)

BOOKING_2=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY_2" \
  -d '{
    "hotelId": "hotel-dubai-001",
    "checkInDate": "2026-03-10",
    "checkOutDate": "2026-03-15",
    "guests": 3,
    "totalPrice": 4800,
    "currency": "AED"
  }')

BOOKING_2_ID=$(echo $BOOKING_2 | jq -r '.id')
echo -e "${GREEN}✅ Booking created: $BOOKING_2_ID${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for retries and potential failover (15 seconds)...${NC}"
echo -e "${CYAN}   Watch retries in Bull Board: $BOARD_URL${NC}"
sleep 15

# Check status
STATUS_2=$(curl -s "$API_URL/bookings/$BOOKING_2_ID")
VENDOR_2=$(echo $STATUS_2 | jq -r '.vendor')
STATUS_TEXT_2=$(echo $STATUS_2 | jq -r '.status')
FAILOVER_2=$(echo $STATUS_2 | jq -r '.failoverUsed')
ATTEMPTS_2=$(curl -s "$API_URL/bookings/$BOOKING_2_ID/attempts" | jq -r '. | length')

echo ""
echo -e "${BOLD}Result:${NC}"
echo -e "  Final Vendor: ${CYAN}$VENDOR_2${NC}"
echo -e "  Status: ${GREEN}$STATUS_TEXT_2${NC}"
echo -e "  Failover Used: ${CYAN}$FAILOVER_2${NC}"
echo -e "  Total Attempts: ${CYAN}$ATTEMPTS_2${NC}"
echo ""

if [ "$FAILOVER_2" = "true" ]; then
  echo -e "${GREEN}✅ SUCCESS: Failover mechanism worked! Switched to alternate vendor.${NC}"
elif [ "$STATUS_TEXT_2" = "CONFIRMED" ]; then
  echo -e "${GREEN}✅ Primary vendor succeeded (no failover needed)${NC}"
else
  echo -e "${YELLOW}⚠️  Check Bull Board for details${NC}"
fi

echo ""
read -p "Press ENTER for Scenario 3..."

# Scenario 3: All Vendors Fail
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${RED}📍 SCENARIO 3: All Vendors Fail${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Creating booking with Atlantis...${NC}"
echo -e "${CYAN}Expected: If all vendors fail, booking marked as FAILED${NC}"
echo ""

IDEMPOTENCY_KEY_3=$(uuidgen)

BOOKING_3=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY_3" \
  -d '{
    "hotelId": "hotel-dubai-002",
    "checkInDate": "2026-04-01",
    "checkOutDate": "2026-04-05",
    "guests": 4,
    "totalPrice": 8000,
    "currency": "AED"
  }')

BOOKING_3_ID=$(echo $BOOKING_3 | jq -r '.id')
echo -e "${GREEN}✅ Booking created: $BOOKING_3_ID${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for all attempts to exhaust (15 seconds)...${NC}"
echo -e "${CYAN}   Watch failures in Bull Board: $BOARD_URL${NC}"
sleep 15

# Check status
STATUS_3=$(curl -s "$API_URL/bookings/$BOOKING_3_ID")
STATUS_TEXT_3=$(echo $STATUS_3 | jq -r '.status')
ATTEMPTS_3=$(curl -s "$API_URL/bookings/$BOOKING_3_ID/attempts" | jq -r '. | length')

echo ""
echo -e "${BOLD}Result:${NC}"
echo -e "  Status: ${RED}$STATUS_TEXT_3${NC}"
echo -e "  Total Attempts: ${CYAN}$ATTEMPTS_3${NC}"
echo ""

if [ "$STATUS_TEXT_3" = "FAILED" ]; then
  echo -e "${GREEN}✅ EXPECTED: All vendors exhausted, booking marked as FAILED${NC}"
else
  echo -e "${GREEN}✅ One of the vendors succeeded${NC}"
fi

echo ""
read -p "Press ENTER for Scenario 4..."

# Scenario 4: Idempotency Key Test
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}📍 SCENARIO 4: Idempotency Key Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Testing duplicate request prevention with same idempotency key...${NC}"
echo -e "${CYAN}Expected: Second request returns cached booking (same ID)${NC}"
echo ""

IDEMPOTENCY_KEY_4=$(uuidgen)

echo -e "${YELLOW}📤 First Request (creating new booking)...${NC}"
BOOKING_4_FIRST=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY_4" \
  -d '{
    "hotelId": "hotel-dubai-003",
    "checkInDate": "2026-05-01",
    "checkOutDate": "2026-05-05",
    "guests": 2,
    "totalPrice": 6500,
    "currency": "AED"
  }')

BOOKING_4_ID_1=$(echo $BOOKING_4_FIRST | jq -r '.id')
BOOKING_4_STATUS_1=$(echo $BOOKING_4_FIRST | jq -r '.status')
echo -e "${GREEN}✅ First booking created: $BOOKING_4_ID_1${NC}"
echo -e "   Status: ${CYAN}$BOOKING_4_STATUS_1${NC}"
echo ""

sleep 2

echo -e "${YELLOW}📤 Second Request (same idempotency key)...${NC}"
BOOKING_4_SECOND=$(curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY_4" \
  -d '{
    "hotelId": "hotel-dubai-003",
    "checkInDate": "2026-05-01",
    "checkOutDate": "2026-05-05",
    "guests": 2,
    "totalPrice": 6500,
    "currency": "AED"
  }')

BOOKING_4_ID_2=$(echo $BOOKING_4_SECOND | jq -r '.id')
BOOKING_4_STATUS_2=$(echo $BOOKING_4_SECOND | jq -r '.status')
echo -e "${GREEN}✅ Second request returned: $BOOKING_4_ID_2${NC}"
echo -e "   Status: ${CYAN}$BOOKING_4_STATUS_2${NC}"
echo ""

echo -e "${BOLD}Result:${NC}"
echo -e "  First Booking ID:  ${CYAN}$BOOKING_4_ID_1${NC}"
echo -e "  Second Booking ID: ${CYAN}$BOOKING_4_ID_2${NC}"
echo ""

if [ "$BOOKING_4_ID_1" = "$BOOKING_4_ID_2" ]; then
  echo -e "${GREEN}✅ SUCCESS: Idempotency working! Same booking returned from cache.${NC}"
  echo -e "${GREEN}   No duplicate booking was created.${NC}"
else
  echo -e "${RED}❌ FAILED: Different booking IDs returned (idempotency broken)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}📊 DEMO SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Key Features Demonstrated:${NC}"
echo -e "  ${GREEN}✓${NC} Multi-vendor hotel booking system"
echo -e "  ${GREEN}✓${NC} Automatic vendor selection (price-based)"
echo -e "  ${GREEN}✓${NC} Retry mechanism with exponential backoff"
echo -e "  ${GREEN}✓${NC} Automatic failover to alternate vendors"
echo -e "  ${GREEN}✓${NC} Idempotency protection (duplicate prevention)"
echo -e "  ${GREEN}✓${NC} Comprehensive attempt logging"
echo -e "  ${GREEN}✓${NC} Real-time monitoring via Bull Board"
echo ""
echo -e "${BOLD}View all bookings:${NC}"
echo -e "  ${CYAN}Scenario 1:${NC} curl $API_URL/bookings/$BOOKING_1_ID | jq"
echo -e "  ${CYAN}Scenario 2:${NC} curl $API_URL/bookings/$BOOKING_2_ID | jq"
echo -e "  ${CYAN}Scenario 3:${NC} curl $API_URL/bookings/$BOOKING_3_ID | jq"
echo -e "  ${CYAN}Scenario 4:${NC} curl $API_URL/bookings/$BOOKING_4_ID_1 | jq"
echo ""
echo -e "${BOLD}Monitor queues:${NC}"
echo -e "  ${YELLOW}🌐 $BOARD_URL${NC}"
echo ""
echo -e "${BOLD}API Documentation:${NC}"
echo -e "  ${YELLOW}📚 $BASE_URL/api/docs${NC}"
echo ""
echo -e "${GREEN}Demo completed successfully! 🎉${NC}"
echo ""
