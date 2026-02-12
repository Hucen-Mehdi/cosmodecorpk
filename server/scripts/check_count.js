const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'cosmodecorpk',
    user: 'postgres',
    password: 'postgres'
});

async function run() {
    try {
        const res = await pool.query('SELECT count(*) FROM products');
        console.log('✅ Total Products in DB:', res.rows[0].count);

        // Also verify if any hidden filtering might happen (e.g. active=true?)
        // (Current schema doesn't have active column, but let's check basic stats)
        const catRes = await pool.query('SELECT category_id, COUNT(*) FROM products GROUP BY category_id');
        console.log('📊 By Category:', catRes.rows);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
