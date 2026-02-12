const { Pool } = require('pg');
const pool = new Pool({
    host: 'localhost',
    database: 'cosmodecorpk',
    user: 'postgres',
    password: 'postgres'
});

async function check() {
    try {
        const res = await pool.query('SELECT * FROM categories LIMIT 1');
        console.log('Columns:', res.fields.map(f => f.name));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
