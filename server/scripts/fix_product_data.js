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
        console.log("🛠️ Fixing Product Data...");

        // 1. Fix Zero Prices
        // Strategy: Set price to a realistic default (e.g., 4999) based on keywords, 
        // BUT set stock to 0 so they don't get bought cheaply.

        const zeroPriceRes = await pool.query("SELECT id, name FROM products WHERE price = 0");

        for (const p of zeroPriceRes.rows) {
            let estimatedPrice = 2500;
            const name = p.name.toLowerCase();

            if (name.includes('set') || name.includes('tables')) estimatedPrice = 12000;
            else if (name.includes('large') || name.includes('5ft') || name.includes('6ft')) estimatedPrice = 8500;
            else if (name.includes('vase')) estimatedPrice = 3500;

            console.log(`💲 Fixing Price for: ${p.id} - ${p.name.substring(0, 30)}... -> Rs ${estimatedPrice}`);

            await pool.query(
                "UPDATE products SET price = $1, stock = 0 WHERE id = $2",
                [estimatedPrice, p.id]
            );
        }

        // 2. Fix Placeholder Images
        // Strategy: Assign better generic images based on keywords

        const badImageRes = await pool.query(
            "SELECT id, name FROM products WHERE image_url IS NULL OR image_url = '' OR image_url = '/placeholder.jpg'"
        );

        for (const p of badImageRes.rows) {
            let newImage = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'; // Default Decor
            const name = p.name.toLowerCase();

            if (name.includes('plant') || name.includes('palm') || name.includes('tree')) {
                newImage = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80'; // Plant
            } else if (name.includes('vase') || name.includes('pot')) {
                newImage = 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80'; // Vase
            } else if (name.includes('flower') || name.includes('floral')) {
                newImage = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'; // Flowers
            } else if (name.includes('table')) {
                newImage = 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80'; // Table
            } else if (name.includes('sculpture') || name.includes('statue')) {
                newImage = 'https://images.unsplash.com/photo-1555447468-1af98e8e7525?w=800&q=80'; // Statue/Art
            }

            console.log(`🖼️ Fixing Image for: ${p.id} -> ${newImage.substring(0, 40)}...`);

            await pool.query(
                "UPDATE products SET image_url = $1 WHERE id = $2",
                [newImage, p.id]
            );
        }

        console.log("✅ Fixes Applied!");

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

run();
