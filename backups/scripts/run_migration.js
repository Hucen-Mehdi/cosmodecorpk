const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cosmodecorpk',
    ssl: false
});

async function run() {
    try {
        await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';");
        console.log("✅ Column 'additional_images' added successfully.");
    } catch (err) {
        console.error("❌ Failed to add column:", err);
    } finally {
        await pool.end();
    }
}

run();
