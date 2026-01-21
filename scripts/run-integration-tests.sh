#!/bin/bash

# Integration Test Runner with Live Queue Monitoring
# Runs tests with real services and Bull Board UI

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🧪  Integration Test Runner with Live Queue Monitoring${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Docker is not running${NC}"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Function to cleanup
cleanup() {
  echo ""
  echo -e "${YELLOW}🧹 Cleaning up...${NC}"
  
  if [ "$KEEP_SERVICES" != "true" ]; then
    echo "   Stopping services..."
    docker-compose down > /dev/null 2>&1 || true
    echo -e "${GREEN}   ✓ Services stopped${NC}"
  else
    echo -e "${CYAN}   ℹ Keeping services running (use --keep-services to preserve)${NC}"
  fi
}

# Parse arguments
KEEP_SERVICES=false
SCENARIO=""
WATCH=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -k|--keep-services)
      KEEP_SERVICES=true
      shift
      ;;
    -s1|--scenario-1)
      SCENARIO="Primary Vendor Succeeds"
      shift
      ;;
    -s2|--scenario-2)
      SCENARIO="Primary Fails"
      shift
      ;;
    -s3|--scenario-3)
      SCENARIO="All Vendors Fail"
      shift
      ;;
    -w|--watch)
      WATCH=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./scripts/run-integration-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  -k,  --keep-services   Keep services running after tests"
      echo "  -s1, --scenario-1      Run only Scenario 1"
      echo "  -s2, --scenario-2      Run only Scenario 2"
      echo "  -s3, --scenario-3      Run only Scenario 3"
      echo "  -w,  --watch           Watch mode (keep services running)"
      echo "  -h,  --help            Show this help"
      echo ""
      echo "Examples:"
      echo "  ./scripts/run-integration-tests.sh           # Run all scenarios"
      echo "  ./scripts/run-integration-tests.sh -k        # Keep services running"
      echo "  ./scripts/run-integration-tests.sh -s1 -k   # Run scenario 1, keep services"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage"
      exit 1
      ;;
  esac
done

if [ "$WATCH" = true ]; then
  KEEP_SERVICES=true
fi

# Trap cleanup on exit
if [ "$KEEP_SERVICES" != "true" ]; then
  trap cleanup EXIT
fi

echo -e "${CYAN}📦 Step 1: Starting Required Services${NC}"
echo ""

# Start PostgreSQL and Redis
echo "   Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

echo "   Waiting for services to be healthy..."
sleep 3

# Wait for PostgreSQL
echo -n "   PostgreSQL: "
for i in {1..30}; do
  if docker-compose exec -T postgres pg_isready -U booking_user -d hotel_booking > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Timeout${NC}"
    exit 1
  fi
  sleep 1
done

# Wait for Redis
echo -n "   Redis:      "
for i in {1..30}; do
  if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Timeout${NC}"
    exit 1
  fi
  sleep 1
done

echo ""
echo -e "${CYAN}🔧 Step 2: Setting Up Test Environment${NC}"
echo ""

# Set test environment variables
export DB_HOST=localhost
export DB_PORT=5433
export DB_USERNAME=booking_user
export DB_PASSWORD=booking_pass
export DB_NAME=hotel_booking
export REDIS_HOST=localhost
export REDIS_PORT=6379
export NODE_ENV=test
export PORT=3000
export WORKER_CONCURRENCY=2

echo -e "   ${GREEN}✓ Test environment configured${NC}"

# Run migrations
echo "   Running database migrations..."
npm run migration:run > /dev/null 2>&1 || true
echo -e "   ${GREEN}✓ Migrations complete${NC}"

echo ""
echo -e "${CYAN}🚀 Step 3: Starting Application${NC}"
echo ""

# Start app in background
echo "   Starting NestJS application..."
npm run start:dev > /tmp/nest-app.log 2>&1 &
APP_PID=$!

# Wait for app to start
echo -n "   Waiting for app to be ready"
for i in {1..60}; do
  if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo -e " ${GREEN}✓ Ready${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e " ${RED}✗ Timeout${NC}"
    echo "   App logs:"
    tail -20 /tmp/nest-app.log
    kill $APP_PID 2>/dev/null || true
    exit 1
  fi
  echo -n "."
  sleep 1
done

# Additional wait to ensure workers are initialized
sleep 3

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All Services Running!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📊 Monitor Queue Activity:${NC}"
echo -e "   ${YELLOW}🌐 http://localhost:3000/admin/queues/ui/${NC}"
echo ""
echo -e "${CYAN}📝 Available Queues:${NC}"
echo "   • vendor-bookings-A (Vendor A jobs)"
echo "   • vendor-bookings-B (Vendor B jobs)"  
echo "   • post-booking (Confirmation emails)"
echo ""
echo -e "${CYAN}💡 Open the URL above in your browser NOW to watch tests run!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Wait a moment for user to open browser
echo -e "${YELLOW}⏳ Giving you 10 seconds to open the Bull Board UI...${NC}"
for i in {10..1}; do
  echo -n "$i... "
  sleep 1
done
echo ""
echo ""

echo -e "${CYAN}🧪 Step 4: Running Integration Tests${NC}"
echo ""

# Build test command
TEST_CMD="npm run test:e2e -- vendor-failover-integration.e2e-spec.ts --runInBand --forceExit"

if [ -n "$SCENARIO" ]; then
  echo -e "${BLUE}Running specific scenario:${NC} $SCENARIO"
  TEST_CMD="$TEST_CMD -t \"$SCENARIO\""
else
  echo -e "${BLUE}Running all failover scenarios...${NC}"
fi

echo ""

# Run tests
if eval $TEST_CMD; then
  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ All Tests Passed!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
  TEST_RESULT=0
else
  echo ""
  echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}❌ Some Tests Failed${NC}"
  echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
  TEST_RESULT=1
fi

echo ""

if [ "$KEEP_SERVICES" = true ]; then
  echo -e "${CYAN}🔄 Services Still Running${NC}"
  echo ""
  echo -e "${YELLOW}📊 Bull Board UI: http://localhost:3000/admin/queues/ui/${NC}"
  echo -e "${YELLOW}🗄️  PostgreSQL:     localhost:5433${NC}"
  echo -e "${YELLOW}📮 Redis:          localhost:6379${NC}"
  echo ""
  echo -e "${CYAN}To stop services:${NC}"
  echo "   docker-compose down"
  echo "   kill $APP_PID"
  echo ""
  echo -e "${GREEN}Press Ctrl+C to exit (services will keep running)${NC}"
  
  if [ "$WATCH" = true ]; then
    echo ""
    echo -e "${CYAN}Watch mode: Keeping app running...${NC}"
    wait $APP_PID
  fi
else
  # Stop app
  kill $APP_PID 2>/dev/null || true
  wait $APP_PID 2>/dev/null || true
fi

exit $TEST_RESULT
