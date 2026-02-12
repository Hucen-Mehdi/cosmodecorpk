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
        console.log("🔍 analyzing Categories & Products...");

        const cats = await pool.query('SELECT * FROM categories');
        console.log('\n📂 CATEGORIES TABLE:');
        console.table(cats.rows.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

        const prodSample = await pool.query('SELECT id, name, category_id FROM products LIMIT 5');
        // console.log('\n📦 PRODUCTS SAMPLE:');
        // console.table(prodSample.rows);

        // CHECK MISMATCHES
        // Find products where category_id is NOT in the categories table IDs
        console.log('\n🚨 CHECKING FOR ORPHANED PRODUCTS (Invalid category_id)...');

        // We need to cast category_id to text because it seems to be mixed types in my previous output?
        // Wait, if the column is VARCHAR, then '1' !== 1. 
        // Let's check the column type of products.category_id first.

        const schema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'category_id';
        `);
        console.log('Product category_id Type:', schema.rows[0].data_type);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
