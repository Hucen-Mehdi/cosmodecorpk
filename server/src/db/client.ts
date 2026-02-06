import { Pool } from "pg";
import { DATABASE_URL } from '../config';

console.log(`🔌 Connecting to DB: ${DATABASE_URL ? 'URL Found' : 'Missing URL'}`);

export const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false // Explicitly disable SSL for local development
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});
