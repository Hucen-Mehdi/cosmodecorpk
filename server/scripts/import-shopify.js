const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const path = require('path');

// Database connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'cosmodecorpk',
    user: 'postgres',
    password: 'postgres'
});

const CATEGORY_MAP = {
    'artificial-plants': ['garden', 'plant', 'flower', 'orchid', 'pot', 'planter', 'lawn'],
    'wall-decor': ['decor', 'art', 'wall', 'clock', 'painting', 'canvas'],
    'lighting': ['light', 'lamp', 'led', 'chandelier'],
    'home-decor': ['home', 'gift', 'candle', 'diffuser', 'incense', 'resin', 'bakhoor']
};

async function fixSequence() {
    try {
        await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
        console.log("🔧 Fixed products_id_seq");
    } catch (e) {
        console.log("⚠️ Sequence fix skipped:", e.message);
    }
}

function cleanHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000);
}

function mapCategory(type, category, tags) {
    const searchStr = `${type} ${category} ${tags}`.toLowerCase();

    for (const [mainCat, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => searchStr.includes(k))) {
            return mainCat;
        }
    }
    return 'home-decor'; // Fallback
}

function calculateDelivery(price) {
    if (price <= 3000) return 200;
    if (price <= 8000) return 500;
    return 250;
}

function processVariations(rows) {
    const variationMap = new Map();
    const prices = [];

    rows.forEach(row => {
        const price = parseFloat(row['Variant Price'] || 0);
        if (price) prices.push(price);

        // Check Option1, Option2, Option3
        ['Option1', 'Option2', 'Option3'].forEach(opt => {
            const name = row[`${opt} Name`];
            const value = row[`${opt} Value`];

            if (name && value && name !== 'Title' && value !== 'Default Title') {
                if (!variationMap.has(name)) {
                    variationMap.set(name, new Set());
                }
                variationMap.get(name).add(value);
            }
        });
    });

    const variations = [];
    variationMap.forEach((values, name) => {
        variations.push({
            name: name,
            options: Array.from(values),
            required: true,
            priceAdjustments: {} // Placeholder as requested
        });
    });

    return variations;
}

async function importShopifyData() {
    await fixSequence();

    const csvPath = path.join(__dirname, 'shopify_import_data.tsv');
    const productsMap = new Map();

    console.log('📖 Reading TSV...');

    fs.createReadStream(csvPath)
        .pipe(csv({ separator: '\t' })) // Shopify copy-pastes are often TSV
        .on('data', (row) => {
            if (!row.Handle) return;
            if (!productsMap.has(row.Handle)) {
                productsMap.set(row.Handle, []);
            }
            productsMap.get(row.Handle).push(row);
        })
        .on('end', async () => {
            console.log(`📦 Grouped into ${productsMap.size} unique products`);

            let success = 0;

            for (const [handle, rows] of productsMap) {
                const main = rows[0]; // Logic: First row has main details

                // 1. Basic Fields
                const name = main.Title.trim();
                const description = cleanHtml(main['Body (HTML)']);
                // Parse price from ALL rows to find proper base price (usually min or max? Default to first)
                const price = parseFloat(main['Variant Price'] || 0);
                const originalPriceStr = main['Variant Compare At Price'];
                const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : null;

                // 2. Category
                const categoryId = mapCategory(main.Type || '', main['Product Category'] || '', main.Tags || '');

                // 3. Image (First available)
                // Find row with Image Src, else Variant Image
                const imageRow = rows.find(r => r['Image Src']) || rows.find(r => r['Variant Image']);
                const imageUrl = imageRow ? (imageRow['Image Src'] || imageRow['Variant Image']) : '';

                // 4. Stock (Sum of all variants?) or just main? 
                // Usually stock is sum of variants
                const stock = rows.reduce((sum, r) => sum + (parseInt(r['Variant Inventory Qty'] || 0)), 0);

                // 5. Variations
                const variations = processVariations(rows);

                // 6. Delivery
                const deliveryCharge = calculateDelivery(price);

                const product = {
                    name, description, price, originalPrice, imageUrl, categoryId,
                    subcategory: main.Type || 'Decor',
                    rating: 4.5,
                    reviews: Math.floor(Math.random() * 10) + 1,
                    badge: (main.Tags || '').toLowerCase().includes('bestseller') ? 'Bestseller' : null,
                    stock,
                    deliveryCharge,
                    variations
                };

                // DB Operations
                try {
                    // Check existence
                    const check = await pool.query('SELECT id FROM products WHERE name = $1', [name]);
                    if (check.rows.length > 0) {
                        console.log(`⚠️ Skiping ${name} (Exists)`);
                        continue;
                    }

                    const query = `
                INSERT INTO products (
                    name, description, price, original_price, image_url, 
                    category_id, subcategory, rating, reviews, badge, 
                    stock, delivery_charge, created_at, variations
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
                RETURNING id;
            `;

                    const values = [
                        product.name,
                        product.description,
                        product.price,
                        product.originalPrice,
                        product.imageUrl,
                        product.categoryId,
                        product.subcategory,
                        product.rating,
                        product.reviews,
                        product.badge,
                        product.stock,
                        product.deliveryCharge,
                        JSON.stringify(product.variations)
                    ];

                    const res = await pool.query(query, values);
                    console.log(`✅ Imported: ${product.name} (ID: ${res.rows[0].id})`);

                    // SHOW SQL (User Request)
                    if (success === 0) {
                        console.log('\n🔍 --- DEBUG: EXACT SQL INSERT ---');
                        console.log(query.replace(/\s+/g, ' ').trim());
                        console.log('Values:', JSON.stringify(values, null, 2));
                        console.log('----------------------------------\n');
                    }
                    success++;

                } catch (err) {
                    console.error(`❌ Error importing ${name}:`, err.message);
                }
            }

            console.log(`\n🎉 Completed. Imported ${success} products.`);
            pool.end();
        });
}

importShopifyData().catch(e => console.error(e));
