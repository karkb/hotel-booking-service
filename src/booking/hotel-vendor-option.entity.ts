import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hotel_vendor_options')
@Index(['hotelId', 'available', 'priority'])
@Index(['hotelId', 'vendor'], { unique: true })
export class HotelVendorOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hotel_id', length: 100 })
  @Index()
  hotelId!: string; // NOT unique - one hotel can have multiple vendors

  @Column({ name: 'hotel_name', length: 200 })
  hotelName!: string;

  @Column({ length: 10 })
  vendor!: string;

  @Column({ name: 'vendor_hotel_id', length: 100 })
  vendorHotelId!: string; // Vendor's internal hotel ID

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ length: 3, default: 'AED' })
  currency!: string;

  @Column({ default: true })
  available!: boolean;

  @Column({ type: 'int', default: 0 })
  priority!: number; // Lower = higher priority (try first)

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
