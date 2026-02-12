const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const config = {
    connectionString: process.env.DATABASE_URL
};

if (process.env.DATABASE_URL.includes('localhost')) {
    delete config.ssl;
} else {
    config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

async function checkProductsSchema() {
    try {
        console.log('Checking products table columns...');
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        `);
        console.log('Columns:', res.rows.map(r => r.column_name).sort());
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkProductsSchema();
