const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const config = {
    connectionString: process.env.DATABASE_URL
};

// Remove SSL if not supported (local dev usually uses none)
// Or use default localhost creds without SSL
if (process.env.DATABASE_URL.includes('localhost')) {
    delete config.ssl;
} else {
    config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

async function checkReviews() {
    try {
        console.log('Checking reviews table...');

        // Count total reviews
        const countRes = await pool.query('SELECT COUNT(*) FROM reviews');
        console.log(`Total reviews in DB: ${countRes.rows[0].count}`);

        // Get first 5 reviews
        const res = await pool.query(`
            SELECT r.*, p.name as product_name 
            FROM reviews r 
            LEFT JOIN products p ON r.product_id = p.id 
            LIMIT 5
        `);

        console.log('Sample reviews:', JSON.stringify(res.rows, null, 2));

        // Check if there are reviews without products
        const orphaned = await pool.query('SELECT COUNT(*) FROM reviews WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM products)');
        console.log(`Orphaned reviews (invalid product_id): ${orphaned.rows[0].count}`);

    } catch (err) {
        console.error('Error checking reviews:', err);
    } finally {
        await pool.end();
    }
}

checkReviews();
