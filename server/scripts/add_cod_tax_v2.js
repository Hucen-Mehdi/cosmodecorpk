const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Try to find .env file in server root or project root
const serverEnvPath = path.resolve(__dirname, '../.env');
const projectEnvPath = path.resolve(__dirname, '../../.env');

let envPath = null;
if (fs.existsSync(serverEnvPath)) {
    envPath = serverEnvPath;
} else if (fs.existsSync(projectEnvPath)) {
    envPath = projectEnvPath;
}

if (envPath) {
    console.log('Loading .env from:', envPath);
    require('dotenv').config({ path: envPath });
} else {
    console.error('.env file not found in server or project root!');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Adding cod_tax column to orders table...');
        await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cod_tax DECIMAL(10, 2) DEFAULT 0;
    `);
        console.log('Successfully added cod_tax column.');

        // Verify
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='orders' AND column_name='cod_tax';
    `);

        if (res.rows.length > 0) {
            console.log('Verification: cod_tax column exists.');
        } else {
            console.error('Verification failed: cod_tax column not found.');
        }

    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await pool.end();
    }
}

main();
