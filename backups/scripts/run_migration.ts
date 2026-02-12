import { pool } from '../../server/src/db/client';

async function run() {
    try {
        console.log('Running migration...');
        // Add migration logic here
        console.log('Migration complete');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

run();
