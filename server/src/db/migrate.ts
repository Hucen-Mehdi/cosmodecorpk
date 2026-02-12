import fs from 'fs';
import path from 'path';
import { pool } from './client';

const runMigrations = async () => {
    console.log('🔌 Connecting to DB...');
    const migrationsDir = path.join(process.cwd(), 'server', 'migrations');

    try {
        const files = fs.readdirSync(migrationsDir).sort();
        const client = await pool.connect();

        try {
            // 1. Create tracking table if not exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS _migrations_tracking (
                    id SERIAL PRIMARY KEY,
                    file_name TEXT UNIQUE NOT NULL,
                    executed_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);

            // 2. Get already executed migrations
            const { rows } = await client.query('SELECT file_name FROM _migrations_tracking');
            const executedFiles = new Set(rows.map(r => r.file_name));

            await client.query('BEGIN');

            let runCount = 0;
            for (const file of files) {
                if (file.endsWith('.sql') && !executedFiles.has(file)) {
                    console.log(`🚀 Executing migration: ${file}`);
                    const filePath = path.join(migrationsDir, file);
                    const sql = fs.readFileSync(filePath, 'utf-8');

                    await client.query(sql);
                    await client.query('INSERT INTO _migrations_tracking (file_name) VALUES ($1)', [file]);
                    runCount++;
                }
            }

            await client.query('COMMIT');
            if (runCount === 0) {
                console.log('✅ Database is already up to date.');
            } else {
                console.log(`🎉 ${runCount} migrations completed successfully.`);
            }
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Migration failed, rolled back.', err);
            process.exit(1);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

runMigrations();
