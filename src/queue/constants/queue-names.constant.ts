/**
 * General queue names for the application
 */
export const QUEUE_NAMES = {
  POST_BOOKING_TASKS: 'post-booking-tasks',
} as const;

/**
 * Queue provider tokens for dependency injection
 */
export const QUEUE_TOKENS = {
  POST_BOOKING_QUEUE: 'POST_BOOKING_QUEUE',
} as const;
