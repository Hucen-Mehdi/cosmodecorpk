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
        console.log("🔍 Diagnosing Product Data Issues...");

        // 1. Find products with Price = 0
        const zeroPriceRes = await pool.query(`
            SELECT id, name, price, original_price 
            FROM products 
            WHERE price = 0
        `);

        console.log(`\n💰 Found ${zeroPriceRes.rows.length} products with Price = 0:`);
        zeroPriceRes.rows.forEach(p => {
            console.log(` - [${p.id}] ${p.name.substring(0, 50)}... | Orig: ${p.original_price}`);
        });

        // 2. Find products with Broken/Missing Images
        // (Checking for empty string, null, or placeholder)
        const badImageRes = await pool.query(`
            SELECT id, name, image_url 
            FROM products 
            WHERE image_url IS NULL 
               OR image_url = '' 
               OR image_url = '/placeholder.jpg'
        `);

        console.log(`\n🖼️ Found ${badImageRes.rows.length} products with Missing/Placeholder Images:`);
        badImageRes.rows.forEach(p => {
            console.log(` - [${p.id}] ${p.name.substring(0, 50)}... | Img: ${p.image_url}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
