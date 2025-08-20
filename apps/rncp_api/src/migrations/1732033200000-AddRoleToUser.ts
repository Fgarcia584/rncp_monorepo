import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleToUser1732033200000 implements MigrationInterface {
    name = 'AddRoleToUser1732033200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE user_role_enum AS ENUM ('admin', 'delivery_person', 'merchant', 'logistics_technician');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Add role column to users table
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'role',
                type: 'enum',
                enum: [
                    'admin',
                    'delivery_person',
                    'merchant',
                    'logistics_technician',
                ],
                enumName: 'user_role_enum',
                default: "'delivery_person'",
                isNullable: false,
            }),
        );

        // Update existing users to have the default role
        await queryRunner.query(`
            UPDATE users SET role = 'delivery_person' WHERE role IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the role column
        await queryRunner.dropColumn('users', 'role');

        // Drop the enum type
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
    }
}
