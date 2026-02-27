const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        console.log('--- DATABASE CHECK ---');

        const productsCount = await pool.query('SELECT COUNT(*) FROM products');
        console.log(`Products count: ${productsCount.rows[0].count}`);

        const collectionsCount = await pool.query('SELECT COUNT(*) FROM collections');
        console.log(`Collections count: ${collectionsCount.rows[0].count}`);

        const productCollectionsCount = await pool.query('SELECT COUNT(*) FROM product_collections');
        console.log(`Product Collections count: ${productCollectionsCount.rows[0].count}`);

        const sampleProduct = await pool.query('SELECT id, name, category_id, category_ids FROM products LIMIT 1');
        console.log('Sample Product:', JSON.stringify(sampleProduct.rows[0], null, 2));

        const sampleCollection = await pool.query('SELECT id, name, slug FROM collections LIMIT 1');
        console.log('Sample Collection:', JSON.stringify(sampleCollection.rows[0], null, 2));

        const sampleAssoc = await pool.query('SELECT * FROM product_collections LIMIT 5');
        console.log('Sample Associations:', JSON.stringify(sampleAssoc.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
