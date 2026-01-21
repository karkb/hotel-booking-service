import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BookingStatus } from '../common/enums/booking-status.enum';
import { BookingAttempt } from './booking-attempt.entity';

@Entity('bookings')
@Index('idx_bookings_user_created_at', ['userId', 'createdAt'])
@Index('idx_bookings_status_created_at', ['status', 'createdAt'])
@Index('idx_bookings_idempotency_key', ['idempotencyKey'], { unique: true })
export class Booking {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ length: 10 })
  vendor!: string;

  @Column({ length: 100 })
  hotelId!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  hotelName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vendorHotelId!: string | null;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column({ type: 'varchar', length: 200, nullable: true })
  externalReference!: string | null;

  @Column({ length: 100 })
  idempotencyKey!: string;

  @Column({ type: 'date' })
  checkInDate!: string;

  @Column({ type: 'date' })
  checkOutDate!: string;

  @Column('int')
  guests!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: string;

  @Column({ length: 3, default: 'AED' })
  currency!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt!: Date | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  failoverUsed!: boolean | null; // Flag if failover happened

  @Column({ type: 'varchar', length: 10, nullable: true })
  originalVendor!: string | null; // Track original vendor if we failed over

  @OneToMany(() => BookingAttempt, (attempt) => attempt.booking, {
    eager: false,
    cascade: true,
  })
  attempts!: BookingAttempt[];
}
