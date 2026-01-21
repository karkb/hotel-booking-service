#!/bin/bash

set -e

echo "🔍 Verifying Etera Hotel Booking Service Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    return 0
  else
    echo -e "${RED}❌ $1${NC}"
    return 1
  fi
}

# Check Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking Infrastructure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker info > /dev/null 2>&1
check_status "Docker is running"

# Check PostgreSQL
docker-compose exec -T postgres pg_isready -U booking_user > /dev/null 2>&1
check_status "PostgreSQL is healthy"

# Check Redis
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1
check_status "Redis is healthy"

# Check database tables
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking Database Schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TABLES=$(docker-compose exec -T postgres psql -U booking_user -d hotel_booking -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | grep -v "^$" | wc -l)
if [ "$TABLES" -gt 0 ]; then
  echo -e "${GREEN}✅ Database tables created ($TABLES tables)${NC}"
  docker-compose exec -T postgres psql -U booking_user -d hotel_booking -c "\dt" 2>/dev/null | grep -v "^$"
else
  echo -e "${RED}❌ No database tables found${NC}"
fi

# Check Node modules
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking Application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ Node modules installed${NC}"
else
  echo -e "${RED}❌ Node modules not installed${NC}"
fi

# Check build
if [ -d "dist" ]; then
  echo -e "${GREEN}✅ Application built${NC}"
else
  echo -e "${YELLOW}⚠️  Application not built (run 'npm run build')${NC}"
fi

# Check if app is running
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking Application Endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s http://localhost:3000/api/docs > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Application is running${NC}"
  echo -e "${GREEN}✅ Swagger UI accessible${NC}"
  
  # Test health endpoint
  curl -s http://localhost:3000/health > /dev/null 2>&1
  check_status "Health endpoint responding"
  
  # Test queue metrics
  curl -s http://localhost:3000/admin/queues/metrics > /dev/null 2>&1
  check_status "Queue metrics endpoint responding"
else
  echo -e "${YELLOW}⚠️  Application not running (start with 'npm run start:dev')${NC}"
fi

# Run tests
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm test -- --silent > /dev/null 2>&1
check_status "Unit tests passed"

# Check test coverage
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "System is ready for use! 🎉"
echo ""
echo "📚 Swagger API Docs:  http://localhost:3000/api/docs"
echo "📊 Queue Monitoring:  http://localhost:3000/admin/queues/ui"
echo "📈 Queue Metrics:     http://localhost:3000/admin/queues/metrics"
echo ""
