import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

export class CreateOrdersTable1734617200000 implements MigrationInterface {
    name = 'CreateOrdersTable1734617200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create order status enum
        await queryRunner.query(`
            CREATE TYPE order_status_enum AS ENUM ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled');
        `);

        // Create order priority enum
        await queryRunner.query(`
            CREATE TYPE order_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
        `);

        // Create orders table
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'merchant_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'customer_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'customer_phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'delivery_address',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'scheduled_delivery_time',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            'pending',
                            'accepted',
                            'in_transit',
                            'delivered',
                            'cancelled',
                        ],
                        enumName: 'order_status_enum',
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'normal', 'high', 'urgent'],
                        enumName: 'order_priority_enum',
                        default: "'normal'",
                        isNullable: false,
                    },
                    {
                        name: 'delivery_person_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'estimated_delivery_duration',
                        type: 'int',
                        isNullable: true,
                        comment: 'Estimated delivery duration in minutes',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Create foreign key constraints
        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                columnNames: ['merchant_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                name: 'FK_orders_merchant',
            }),
        );

        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                columnNames: ['delivery_person_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
                name: 'FK_orders_delivery_person',
            }),
        );

        // Create indexes for better query performance
        await queryRunner.createIndex(
            'orders',
            new TableIndex({
                name: 'IDX_orders_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'orders',
            new TableIndex({
                name: 'IDX_orders_merchant_id',
                columnNames: ['merchant_id'],
            }),
        );

        await queryRunner.createIndex(
            'orders',
            new TableIndex({
                name: 'IDX_orders_delivery_person_id',
                columnNames: ['delivery_person_id'],
            }),
        );

        await queryRunner.createIndex(
            'orders',
            new TableIndex({
                name: 'IDX_orders_scheduled_delivery_time',
                columnNames: ['scheduled_delivery_time'],
            }),
        );

        await queryRunner.createIndex(
            'orders',
            new TableIndex({
                name: 'IDX_orders_status_delivery_person',
                columnNames: ['status', 'delivery_person_id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the table (this will automatically drop foreign keys and indexes)
        await queryRunner.dropTable('orders');

        // Drop the enum types
        await queryRunner.query(`DROP TYPE IF EXISTS order_status_enum;`);
        await queryRunner.query(`DROP TYPE IF EXISTS order_priority_enum;`);
    }
}
