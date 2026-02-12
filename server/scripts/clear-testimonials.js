const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: 'localhost',
        port: 5432,
        database: 'cosmodecorpk',
        user: 'postgres',
        password: 'postgres'
    });

async function clearTestimonials() {
    try {
        console.log('🧹 Clearing dummy testimonials...');
        await pool.query('DELETE FROM testimonials');
        console.log('✅ Testimonials table cleared.');
    } catch (err) {
        console.error('❌ Failed to clear testimonials:', err);
    } finally {
        await pool.end();
    }
}

clearTestimonials();
