
import { pool } from '../client';

const runMigration = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        // 1. Make user_id nullable
        await client.query(`ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;`);
        console.log('✅ ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL');

        // 2. Add is_guest column
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;`);
        console.log('✅ ALTER TABLE orders ADD COLUMN is_guest');

        // 3. Add guest_email column
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;`);
        console.log('✅ ALTER TABLE orders ADD COLUMN guest_email');

        console.log('Migration completed successfully.');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

runMigration();
