"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddHotelVendorOptions1737501234567 = void 0;
const typeorm_1 = require("typeorm");
class AddHotelVendorOptions1737501234567 {
    constructor() {
        this.name = 'AddHotelVendorOptions1737501234567';
    }
    async up(queryRunner) {
        // Create hotel_vendor_options table
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'hotel_vendor_options',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'gen_random_uuid()',
                },
                {
                    name: 'hotel_id',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'hotel_name',
                    type: 'varchar',
                    length: '200',
                },
                {
                    name: 'vendor',
                    type: 'varchar',
                    length: '10',
                },
                {
                    name: 'vendor_hotel_id',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'currency',
                    type: 'varchar',
                    length: '3',
                    default: "'AED'",
                },
                {
                    name: 'available',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'priority',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
        // Create indexes
        await queryRunner.createIndex('hotel_vendor_options', new typeorm_1.TableIndex({
            name: 'IDX_hotel_vendor_options_hotel_id',
            columnNames: ['hotel_id'],
        }));
        await queryRunner.createIndex('hotel_vendor_options', new typeorm_1.TableIndex({
            name: 'IDX_hotel_vendor_options_composite',
            columnNames: ['hotel_id', 'available', 'priority'],
        }));
        await queryRunner.createIndex('hotel_vendor_options', new typeorm_1.TableIndex({
            name: 'IDX_hotel_vendor_options_unique',
            columnNames: ['hotel_id', 'vendor'],
            isUnique: true,
        }));
        // Seed sample data
        await queryRunner.query(`
      INSERT INTO hotel_vendor_options (hotel_id, hotel_name, vendor, vendor_hotel_id, price, priority) VALUES
      -- Grand Hyatt: Available from BOTH vendors (different prices)
      ('hotel-dubai-001', 'Grand Hyatt Dubai', 'B', 'grand-hyatt', 4800, 1),
      ('hotel-dubai-001', 'Grand Hyatt Dubai', 'A', 'hyatt-001', 5000, 2),
      
      -- Atlantis: Only from Vendor A
      ('hotel-dubai-002', 'Atlantis The Palm', 'A', 'atlantis-001', 8000, 1),
      
      -- Burj Al Arab: Only from Vendor B
      ('hotel-dubai-003', 'Burj Al Arab', 'B', 'burj-001', 12000, 1),
      
      -- Armani Hotel: Available from BOTH vendors
      ('hotel-dubai-004', 'Armani Hotel', 'A', 'armani-001', 6500, 1),
      ('hotel-dubai-004', 'Armani Hotel', 'B', 'armani-downtown', 6200, 2),
      
      -- JW Marriott: Only from Vendor A
      ('hotel-dubai-005', 'JW Marriott Marquis', 'A', 'marriott-001', 4500, 1);
    `);
    }
    async down(queryRunner) {
        // Drop indexes
        await queryRunner.dropIndex('hotel_vendor_options', 'IDX_hotel_vendor_options_unique');
        await queryRunner.dropIndex('hotel_vendor_options', 'IDX_hotel_vendor_options_composite');
        await queryRunner.dropIndex('hotel_vendor_options', 'IDX_hotel_vendor_options_hotel_id');
        // Drop table
        await queryRunner.dropTable('hotel_vendor_options');
    }
}
exports.AddHotelVendorOptions1737501234567 = AddHotelVendorOptions1737501234567;
//# sourceMappingURL=1737501234567-AddHotelVendorOptions.js.map