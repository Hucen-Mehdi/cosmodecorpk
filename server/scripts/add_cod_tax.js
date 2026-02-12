require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Adjust SSL based on if it's production/remote vs local. usually check if url contains ssl/remote host
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function main() {
    try {
        console.log('Adding cod_tax column to orders table...');
        await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cod_tax DECIMAL(10, 2) DEFAULT 0;
    `);
        console.log('Successfully added cod_tax column.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await pool.end();
    }
}

main();
