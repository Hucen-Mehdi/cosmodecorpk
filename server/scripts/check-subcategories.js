const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSubcategories() {
    try {
        console.log('🔍 Checking product subcategories...');

        // Get all products in the 'artificial-plants' category with their subcategories
        const res = await pool.query(`
      SELECT id, name, category_id, subcategory 
      FROM products 
      WHERE category_id = 'artificial-plants' OR 'artificial-plants' = ANY(category_ids)
    `);

        console.log(`Found ${res.rows.length} products in 'artificial-plants' category:\n`);

        res.rows.forEach(p => {
            console.log(`- [${p.id}] ${p.name}: Subcategory='${p.subcategory}'`);
        });

        // Check specific subcategories mentioned by user
        const under5k = res.rows.filter(p => p.subcategory === 'under-5k');
        const under10k = res.rows.filter(p => p.subcategory === 'under-10k');

        console.log(`\nStats:`);
        console.log(`- 'under-5k': ${under5k.length} products`);
        console.log(`- 'under-10k': ${under10k.length} products`);

    } catch (err) {
        console.error('❌ Error checking subcategories:', err);
    } finally {
        await pool.end();
    }
}

checkSubcategories();
