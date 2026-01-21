import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Booking } from './booking.entity';

@Entity('booking_attempts')
@Index('idx_booking_attempts_booking_attempt', ['bookingId', 'attemptNumber'])
export class BookingAttempt {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id!: string;

  @Column('uuid')
  bookingId!: string;

  @Column('int')
  attemptNumber!: number;

  @Column({ length: 10 })
  vendor!: string;

  @Column({ type: 'jsonb' })
  requestPayload!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  responsePayload!: Record<string, unknown> | null;

  @Column('int', { nullable: true })
  durationMs!: number | null;

  @Column('int', { nullable: true })
  statusCode!: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'boolean', default: false })
  isFailover!: boolean; // Flag if this was a failover attempt

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => Booking, (booking) => booking.attempts)
  @JoinColumn({ name: 'bookingId' })
  booking!: Booking;
}
