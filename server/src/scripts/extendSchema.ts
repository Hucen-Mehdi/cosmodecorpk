import { pool } from '../db/client';

async function updateSchema() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Updating products table...');
        await client.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 10;
        `);

        console.log('Creating notifications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
                is_read BOOLEAN DEFAULT FALSE,
                order_id TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        await client.query('COMMIT');
        console.log('Schema updated successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error updating schema:', e);
    } finally {
        client.release();
        process.exit();
    }
}

updateSchema();
