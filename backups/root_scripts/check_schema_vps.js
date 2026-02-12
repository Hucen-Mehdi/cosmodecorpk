const { Pool } = require('pg');
require('dotenv').config({ path: '/var/www/cosmodecorpk.com/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
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

checkSchema();
