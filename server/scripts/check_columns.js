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
        const res = await pool.query('SELECT * FROM products LIMIT 1');
        if (res.rows.length > 0) {
            console.log('Columns:', Object.keys(res.rows[0]));
        } else {
            console.log('No products found to check columns.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

run();
