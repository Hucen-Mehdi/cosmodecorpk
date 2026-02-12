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
        console.log("🛠️ Reclassifying Products...");

        // 1. Move everything from '2' (Lighting) to 'lighting-lamps'
        const moveLighting = await pool.query(`
            UPDATE products 
            SET category_id = 'lighting-lamps' 
            WHERE category_id = '2'
        `);
        console.log(`✅ Moved ${moveLighting.rowCount} items from '2' to 'lighting-lamps'`);

        // 2. Classify items from '1' (Home Decor)
        const cat1Items = await pool.query("SELECT id, name FROM products WHERE category_id = '1'");

        for (const p of cat1Items.rows) {
            const name = p.name.toLowerCase();
            let newCat = 'table-decor'; // Default fallback

            if (name.includes('vase')) newCat = 'vases';
            else if (name.includes('candle') || name.includes('bakhoor')) newCat = 'candle-holders'; // Wait, do we have this?
            else if (name.includes('mirror')) newCat = 'wall-mirrors';
            else if (name.includes('table') && name.includes('coffee')) newCat = 'furniture'; // Create if needed
            else if (name.includes('sculpture') || name.includes('statue') || name.includes('figurine')) newCat = 'statement-decor';
            else if (name.includes('divider')) newCat = 'furniture';

            // Check if target category exists, if not, create it?
            // "furniture" and "candle-holders" don't exist in my previous list manually.
            // Let's stick to existing:

            if (name.includes('candle') || name.includes('bakhoor')) newCat = 'table-decor';
            if (name.includes('coffee table') || name.includes('divider')) newCat = 'statement-decor'; // Close enough

            console.log(` -> Moving '${p.name.substring(0, 30)}...' to '${newCat}'`);

            await pool.query("UPDATE products SET category_id = $1 WHERE id = $2", [newCat, p.id]);
        }

        // 3. Fix miscategorized Wall Decor items (like Figurines)
        const wallItems = await pool.query("SELECT id, name FROM products WHERE category_id = 'wall-decor'");
        for (const p of wallItems.rows) {
            const name = p.name.toLowerCase();
            if (name.includes('figurine') || name.includes('sculpture')) {
                console.log(` -> Moving '${p.name.substring(0, 30)}...' from wall-decor to statement-decor`);
                await pool.query("UPDATE products SET category_id = 'statement-decor' WHERE id = $1", [p.id]);
            }
            if (name.includes('mirror')) {
                console.log(` -> Moving '${p.name.substring(0, 30)}...' from wall-decor to wall-mirrors`);
                await pool.query("UPDATE products SET category_id = 'wall-mirrors' WHERE id = $1", [p.id]);
            }
        }

        // 4. Cleanup Empty Categories
        await pool.query("DELETE FROM categories WHERE id IN ('1', '2')");
        console.log("✅ Deleted generic categories '1' and '2'");

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
