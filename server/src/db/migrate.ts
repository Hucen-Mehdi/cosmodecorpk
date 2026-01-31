import fs from 'fs';
import path from 'path';
import { pool } from './client';

const runMigrations = async () => {
    console.log('Running migrations...');
    const migrationsDir = path.join(process.cwd(), 'server', 'migrations');

    try {
        const files = fs.readdirSync(migrationsDir).sort();

        // Ensure we are connected
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            for (const file of files) {
                if (file.endsWith('.sql')) {
                    console.log(`Executing migration: ${file}`);
                    const filePath = path.join(migrationsDir, file);
                    const sql = fs.readFileSync(filePath, 'utf-8');
                    await client.query(sql);
                }
            }

            await client.query('COMMIT');
            console.log('Migrations completed successfully.');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Migration failed, rolled back.', err);
            process.exit(1);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error reading migrations directory:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

runMigrations();
