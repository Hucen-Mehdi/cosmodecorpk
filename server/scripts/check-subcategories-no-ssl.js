const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Disable SSL
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
            // Only print if subcategory is set
            if (p.subcategory) {
                console.log(`- [${p.id}] ${p.name}: Subcategory='${p.subcategory}'`);
            }
        });

        console.log(`\nStats:`);
        // Count by subcategory
        const counts = res.rows.reduce((acc, p) => {
            const sub = p.subcategory || 'NONE';
            acc[sub] = (acc[sub] || 0) + 1;
            return acc;
        }, {});

        console.log(counts);

    } catch (err) {
        console.error('❌ Error checking subcategories:', err);
    } finally {
        await pool.end();
    }
}

checkSubcategories();
