const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const path = require('path');

// Database connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'cosmodecorpk', // Corrected from 'cosmodecorkp'
    user: 'postgres',
    password: 'postgres'
});

// FIX SEQUENCE
async function fixSequence() {
    try {
        await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
        console.log("🔧 Fixed ID sequence");
    } catch (e) {
        console.log("⚠️ Could not fix sequence (might be fine):", e.message);
    }
}

console.log('🧪 TEST IMPORT: 5 Shopify Products → CosmoDecor');
console.log('=============================================\n');

// Category mapping based on existing products
const CATEGORY_MAP = {
    'wall-decor': ['Decor', 'Wall', 'Art', 'Canvas', 'Clock', 'Painting'],
    'lighting': ['Light', 'Lamp', 'LED', 'Chandelier'],
    'artificial-plants': ['Plant', 'Garden', 'Flower', 'Orchid', 'Fern']
};

async function importTestProducts() {
    await fixSequence();
    const csvPath = path.join(__dirname, 'shopify_5_test.csv');
    console.log(`📖 Reading Shopify CSV from: ${csvPath}`);

    const products = [];
    let processed = new Set(); // Track unique products

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ Error: CSV file not found at ${csvPath}`);
        console.error('Please ensure "shopify_5_test.csv" is in the server/scripts directory.');
        pool.end();
        return;
    }
    console.log('✅ CSV file found. Starting stream...');

    // Read CSV
    const stream = fs.createReadStream(csvPath);
    stream.on('error', (err) => {
        console.error('❌ Stream Error:', err);
        pool.end();
    });

    stream.pipe(csv())
        .on('data', (row) => {
            console.log('🔹 Row received:', row['Title']);
            const handle = row['Handle'];
            if (!handle || processed.has(handle)) return;
            processed.add(handle);

            // EXTRACT DATA FROM SHOPIFY
            const title = row['Title']?.trim() || 'Untitled Product';
            const shopifyCategory = row['Product Category']?.trim() || '';
            const priceStr = row['Variant Price'] || '0';
            const comparePrice = row['Variant Compare At Price'];

            // 1. MAP CATEGORY
            let categoryId = 'uncategorized';
            const lowerCat = shopifyCategory.toLowerCase();

            if (lowerCat.includes('plant') || lowerCat.includes('garden')) {
                categoryId = 'artificial-plants';
            } else if (lowerCat.includes('decor') || lowerCat.includes('art')) {
                categoryId = 'wall-decor';
            } else if (lowerCat.includes('light') || lowerCat.includes('lamp')) {
                categoryId = 'lighting';
            }

            // 2. PARSE PRICES
            const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, '')) || 1000;
            let originalPrice = null;

            if (comparePrice && comparePrice.trim()) {
                const compare = parseFloat(comparePrice.replace(/[^0-9.-]+/g, ''));
                if (compare > price) originalPrice = compare;
            }

            // 3. CREATE PRODUCT MATCHING YOUR DATABASE
            const product = {
                name: title.substring(0, 200),
                description: cleanHtml(row['Body (HTML)'] || 'Premium home decor item'),
                price: price,
                original_price: originalPrice,
                image_url: row['Image Src']?.trim() || '',
                category_id: categoryId,
                subcategory: row['Type']?.trim() || '',
                rating: 4.5, // Default for testing
                reviews: Math.floor(Math.random() * 20) + 5, // Random 5-25 reviews
                badge: Math.random() > 0.7 ? 'Bestseller' : null, // 30% chance
                stock: parseInt(row['Variant Inventory Qty'] || '15'),
                delivery_charge: price <= 3000 ? 200 : 500,
                created_at: new Date(),
                variations: createVariations(row)
            };

            products.push(product);
            console.log(`📦 Found: ${product.name} | Rs ${product.price} | ${product.category_id}`);
        })
        .on('end', async () => {
            console.log(`\n✅ Found ${products.length} unique products`);
            console.log('🔄 Importing to database...\n');

            if (products.length === 0) {
                console.log('❌ No products found in CSV! Check file content.');
                pool.end();
                return;
            }

            let success = 0;
            const errors = [];

            for (const product of products) {
                try {
                    // Check if exists
                    const exists = await pool.query(
                        'SELECT id FROM products WHERE name = $1',
                        [product.name]
                    );

                    if (exists.rows.length > 0) {
                        console.log(`⚠️ Already exists: ${product.name}`);
                        continue;
                    }

                    // INSERT
                    const result = await pool.query(`
            INSERT INTO products (
              name, description, price, original_price, 
              image_url, category_id, subcategory, 
              rating, reviews, badge, stock, 
              delivery_charge, created_at, variations
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
          `, [
                        product.name,
                        product.description,
                        product.price,
                        product.original_price,
                        product.image_url,
                        product.category_id,
                        product.subcategory,
                        product.rating,
                        product.reviews,
                        product.badge,
                        product.stock,
                        product.delivery_charge,
                        product.created_at,
                        product.variations ? JSON.stringify(product.variations) : JSON.stringify([])
                    ]);

                    console.log(`✅ Imported #${result.rows[0].id}: ${product.name}`);
                    success++;

                } catch (error) {
                    console.error(`❌ Failed: ${product.name} - ${error.message}`);
                    errors.push({ product: product.name, error: error.message });
                }
            }

            // TEST RESULTS
            console.log('\n' + '='.repeat(50));
            console.log('🧪 TEST RESULTS');
            console.log('='.repeat(50));
            console.log(`Total in CSV: ${products.length}`);
            console.log(`✅ Imported: ${success}`);
            console.log(`❌ Failed: ${errors.length}`);

            if (errors.length > 0) {
                console.log('\nErrors:');
                errors.slice(0, 3).forEach(err => {
                    console.log(`  • ${err.product}: ${err.error}`);
                });
            }

            pool.end();
        });
}

function cleanHtml(html) {
    if (!html) return 'Premium home decor item for modern living spaces.';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1000);
}

function createVariations(row) {
    const variations = [];

    if (row['Option1 Name'] && row['Option1 Value']) {
        variations.push({
            name: row['Option1 Name'],
            options: [row['Option1 Value']],
            required: false,
            priceAdjustments: {}
        });
    }

    return variations.length > 0 ? variations : [];
}

// CALL THE FUNCTION
importTestProducts().catch(err => {
    console.error('🔥 Startup error:', err.message);
    process.exit(1);
});
