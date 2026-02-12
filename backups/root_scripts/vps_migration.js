const { Pool } = require('pg');
require('dotenv').config({ path: '/var/www/cosmodecorpk.com/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('🔄 Running Review System Migrations...');

        // 1. Orders table
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Added is_delivered to orders');

        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
        `);
        console.log('✅ Added delivered_at to orders');

        // 2. Order Items table
        await pool.query(`
            ALTER TABLE order_items 
            ADD COLUMN IF NOT EXISTS review_submitted BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Added review_submitted to order_items');

        await pool.query(`
            ALTER TABLE order_items 
            ADD COLUMN IF NOT EXISTS review_token TEXT UNIQUE;
        `);
        console.log('✅ Added review_token to order_items');

        console.log('✨ Migrations Complete!');
    } catch (err) {
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
