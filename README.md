# Etera Hotel Booking Service

A scalable hotel booking service with multi-vendor support, automatic failover, and async job processing.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start services
docker-compose up -d

# 3. Run migrations
npm run migration:run

# 4. Start app
npm run start:dev
```

## 🎬 Demo

### Prerequisites

Ensure the application is running:

```bash
# Start services (PostgreSQL + Redis)
docker-compose up -d

# Wait for services to be ready (~10 seconds)

# Run migrations (if not already run in Quick Start)
npm run migration:run

# Verify app is running
curl http://localhost:3000/health
```

### Running the Demo

The demo script showcases 4 key scenarios:

**Option 1: Normal Operation (All Vendors Available)**
```bash
./demo.sh
```

This demonstrates:
- ✅ Scenario 1: Primary vendor succeeds
- 🔄 Scenario 2: Failover mechanism (if primary fails)
- ❌ Scenario 3: All vendors fail (if all attempts exhausted)
- 🔑 Scenario 4: Idempotency protection

**Option 2: Force Failover (Vendor B Down)**
```bash
docker-compose down
VENDOR_B_DOWN=true docker-compose up -d
sleep 15  # Wait for app to be ready
./demo.sh
```

This guarantees Scenario 2 failover: Primary (B) fails → Failover to A succeeds

**Option 3: Force All Fail (All Vendors Down)**
```bash
docker-compose down
VENDOR_A_DOWN=true VENDOR_B_DOWN=true docker-compose up -d
sleep 15  # Wait for app to be ready
./demo.sh
```

This guarantees Scenario 3: All vendors exhausted → Booking marked FAILED

**Reset to Normal:**
```bash
docker-compose down && docker-compose up -d
```

### What the Demo Shows

1. **Async Processing**: Bookings return PENDING immediately
2. **Retry Logic**: 4 attempts with exponential backoff (2s, 4s, 8s)
3. **Failover**: Automatic switch to alternate vendor after retries
4. **Idempotency**: Duplicate prevention with same idempotency key
5. **Monitoring**: Real-time queue status in Bull Board

### Monitoring During Demo

- **Bull Board**: http://localhost:3000/admin/queues/ui
- **Swagger API**: http://localhost:3000/api/docs
- **Queue Metrics**: http://localhost:3000/admin/queues/metrics

## Features

- **Multi-Vendor Support**: Automatic vendor selection based on price/availability
- **Failover Logic**: Retries with exponential backoff + automatic failover to alternate vendors
- **Async Processing**: BullMQ queues for non-blocking bookings
- **Idempotency**: Prevent duplicate bookings with Redis caching
- **Monitoring**: BullBoard UI for real-time queue monitoring

## Tech Stack

- **NestJS** - Framework
- **PostgreSQL** - Database
- **Redis** - Caching & queues
- **BullMQ** - Job processing
- **TypeORM** - ORM

## API Endpoints

```
POST   /api/v1/bookings          # Create booking
GET    /api/v1/bookings/:id      # Get booking details
GET    /api/v1/bookings          # List bookings

# Monitoring
GET    /admin/queues/ui          # BullBoard dashboard
GET    /admin/queues/metrics     # Queue metrics
GET    /api/docs                 # Swagger docs
```

## How It Works

1. Client creates booking via API (returns PENDING immediately)
2. Job added to vendor-specific queue
3. Worker processes job with retries (4 attempts with exponential backoff)
4. If primary vendor fails after all retries, automatically tries alternate vendors
5. Booking status updated to CONFIRMED or FAILED
6. Client polls for status or checks Bull Board

## Vendor Architecture

The service uses SOLID principles for vendor integration:

- **Vendor A** (Modern REST API): Returns metadata with API version and region info, uses numeric IDs
- **Vendor B** (Legacy SOAP API): Returns transaction IDs, slower processing, uses alphanumeric IDs
- **Factory Pattern**: `VendorFactory` manages vendor instances
- **Adapter Pattern**: `VendorAdapterService` provides unified interface
- **Base Class**: `BaseVendorService` contains shared logic (delays, ID generation, env control)
- **Config-Driven**: `vendor.config.ts` defines vendor-specific settings

Each vendor has distinct behavior while following a common interface, making it easy to add new vendors.

## Assumptions

- **Authentication**: User ID extracted from JWT token via authentication middleware (assumed, not implemented in demo)
- **Vendor Selection**: System automatically selects vendors based on hotel availability and priority (price-based)
- **Vendor APIs**: Mock vendor service simulates external vendor APIs (can be controlled via environment variables)
- **Idempotency**: 24-hour cache window for duplicate prevention
- **Retry Strategy**: 4 attempts with exponential backoff (2s, 4s, 8s delays)
- **Failover**: Automatic failover to alternate vendors after primary exhausts all retries
- **Hotel Data**: In production, hotel data comes from search API; for demo, database is pre-seeded with 5 Dubai hotels
- **Booking Status**: Returns PENDING immediately; client polls for final status (CONFIRMED/FAILED)
- **Queue Management**: Failed jobs kept for 7 days, completed jobs for 24 hours

## Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=booking_user
DB_PASSWORD=booking_pass
DB_NAME=hotel_booking

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
PORT=3000

WORKER_CONCURRENCY=5

# Demo control (optional)
VENDOR_A_DOWN=false
VENDOR_B_DOWN=false
```

## Testing

```bash
npm test              # Run unit tests
npm run test:cov      # Run with coverage
```

## Database Migrations

```bash
npm run migration:generate -- <name>   # Generate migration
npm run migration:run                  # Run migrations
npm run migration:revert               # Revert last migration
```

## Monitoring

- **BullBoard**: http://localhost:3000/admin/queues/ui
- **Swagger**: http://localhost:3000/api/docs
- **Health**: http://localhost:3000/health

## Production Improvements

- **Redis Distributed Lock**: Replace optimistic locking with distributed locks to prevent race conditions in idempotency handling (eliminates failed database transactions)
- **Authentication**: JWT-based auth with role-based access control
- **Observability**: Distributed tracing, structured logging, and metrics
- **Rate Limiting**: Per-user/IP rate limiting
- **Circuit Breakers**: Fault tolerance for vendor API failures
- **Webhooks**: Real-time status updates instead of polling
- **Database Optimization**: Read replicas and connection pooling

## License

UNLICENSED
