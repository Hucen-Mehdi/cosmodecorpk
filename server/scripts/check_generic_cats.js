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
        console.log("🔍 Checking Contents of Generic Categories...");

        // Check Category '1' (Home Decor)
        const cat1 = await pool.query("SELECT id, name FROM products WHERE category_id = '1'");
        console.log(`\n🏠 ID '1' (Home Decor) contains ${cat1.rows.length} items:`);
        cat1.rows.forEach(p => console.log(` - ${p.name}`));

        // Check Category '2' (Lighting)
        const cat2 = await pool.query("SELECT id, name FROM products WHERE category_id = '2'");
        console.log(`\n💡 ID '2' (Lighting) contains ${cat2.rows.length} items:`);
        cat2.rows.forEach(p => console.log(` - ${p.name}`));

        // Check Category 'wall-decor'
        const wall = await pool.query("SELECT id, name FROM products WHERE category_id = 'wall-decor'");
        console.log(`\n🖼️ ID 'wall-decor' contains ${wall.rows.length} items:`);
        wall.rows.forEach(p => console.log(` - ${p.name}`));

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
