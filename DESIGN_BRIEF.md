Etera Hotel Booking Service - Design Brief

This is a hotel booking backend that integrates with two external vendors (A and B) with different APIs. The system handles the full booking lifecycle while managing vendor failures, slow responses, and temporary unavailability.

Core Flow

When a booking request comes in, the API Gateway routes it to the booking service. The service first checks Redis to see if this exact request was already processed (idempotency check). If it's new, it queries PostgreSQL to find which vendors can handle this hotel and picks the best one based on priority.

Instead of waiting for the vendor to confirm, the service creates a booking record with status PENDING and adds a job to the appropriate queue (Vendor A or B). This lets us respond to the client immediately while the actual vendor call happens in the background.

Background workers pick up these jobs and use adapter classes to call the vendor APIs. Vendor A uses a modern REST interface while Vendor B uses a legacy SOAP interface, but the adapters hide these differences. Circuit breakers and rate limiters keep things stable if a vendor starts having issues.

Reliability

If a vendor fails, we retry 4 times with increasing delays (2s, 4s, 8s). After that, we automatically try an alternate vendor if one's available. Every attempt gets logged so we can see exactly what happened. To prevent duplicate bookings, we use Redis caching plus a database constraint on the idempotency key.

Data & Scale

The database has three tables: bookings track status, booking_attempts store the retry history, and hotel_vendor_options map which vendors serve which hotels. For search, we query both vendors at once, remove any duplicate records, transform the data into a unified format, then cache the results in Elasticsearch.

The system scales horizontally since the APIs are stateless and workers can scale independently. Built with NestJS, TypeORM for the database, and BullMQ for job queues.

Personalization Extension

The personalization service learns from each user's booking patterns to make smarter decisions over time. 

Say a user keeps booking 5-star beachfront hotels around $250 per night. Next time they search Dubai hotels, places like Grand Hyatt and Burj Al Arab show up higher in their results since those match what they usually go for.

On the vendor side, the system might notice that for weekend bookings at beach resorts, Vendor A fails 60% of the time (sold out) while Vendor B succeeds 90% of the time. So when this user books a weekend beach property, it'll skip Vendor A and go straight to Vendor B, avoiding those failed attempts. The preference data lives in Redis and improves as more bookings complete.
