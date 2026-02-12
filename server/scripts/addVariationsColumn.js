
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function migrate() {
    console.log('🔌 Connecting to DB...');
    try {
        // Check if column exists
        const checkRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='variations';
    `);

        if (checkRes.rows.length === 0) {
            console.log('✨ Adding "variations" column to "products" table...');
            await pool.query(`
        ALTER TABLE products 
        ADD COLUMN variations JSONB DEFAULT '[]';
      `);
            console.log('✅ Column added successfully.');
        } else {
            console.log('ℹ️ Column "variations" already exists.');
        }
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
