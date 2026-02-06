import { pool } from '../db/client';
import fs from 'fs';
import path from 'path';

const resetDb = async () => {
    console.log('🔄 Resetting Local Database...');
    try {
        const schemaPath = path.join(process.cwd(), 'server', 'migrations', 'schema_complete.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('📄 Executing schema_complete.sql...');
        await pool.query(schemaSql);

        console.log('✅ Database Schema Reset Successfully!');
    } catch (err) {
        console.error('❌ DB Reset Failed:', err);
    } finally {
        await pool.end();
    }
};

resetDb();
