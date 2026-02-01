import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    // Warn but don't crash immediately to allow build steps? 
    // Code says "throw Error".
    console.warn("WARNING: DATABASE_URL is not set. Database features will fail.");
}

export const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
