#!/bin/bash

set -e

echo "🚀 Setting up Etera Hotel Booking Service..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
  else
    echo "⚠️  No .env.example found, creating default .env..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=booking_user
DB_PASSWORD=booking_pass
DB_NAME=hotel_booking

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Configuration
NODE_ENV=development
PORT=3000

# Queue Configuration
VENDOR_A_RATE_LIMIT=100
VENDOR_B_RATE_LIMIT=50
VENDOR_A_MAX_RETRIES=4
VENDOR_B_MAX_RETRIES=4

# Queue Cleanup Configuration
CLEANUP_COMPLETED_AGE_HOURS=24
CLEANUP_FAILED_AGE_HOURS=168
EOF
  fi
else
  echo "✅ .env file already exists"
fi
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Stop any running containers
echo "🛑 Stopping any existing containers..."
docker-compose down > /dev/null 2>&1 || true
echo ""

# Start infrastructure
echo "🐘 Starting PostgreSQL..."
echo "📦 Starting Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check PostgreSQL health
echo "🔍 Checking PostgreSQL connection..."
max_retries=30
retry_count=0
until docker-compose exec -T postgres pg_isready -U booking_user > /dev/null 2>&1; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -eq $max_retries ]; then
    echo "❌ PostgreSQL failed to start"
    exit 1
  fi
  echo "   Waiting for PostgreSQL... (attempt $retry_count/$max_retries)"
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Check Redis health
echo "🔍 Checking Redis connection..."
retry_count=0
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -eq $max_retries ]; then
    echo "❌ Redis failed to start"
    exit 1
  fi
  echo "   Waiting for Redis... (attempt $retry_count/$max_retries)"
  sleep 1
done
echo "✅ Redis is ready"
echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
else
  echo "✅ Dependencies already installed"
  echo ""
fi

# Build the application
echo "🔨 Building application..."
npm run build
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run migration:run
echo ""

# Start application
echo "🚀 Starting application in development mode..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 API Documentation:  http://localhost:3000/api/docs"
echo "📊 Queue Monitoring:   http://localhost:3000/admin/queues/ui"
echo "📈 Queue Metrics:      http://localhost:3000/admin/queues/metrics"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start the application, run:"
echo "  npm run start:dev"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
