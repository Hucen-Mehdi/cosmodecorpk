const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const path = require('path');

// Database connection
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: 'localhost',
        port: 5432,
        database: 'cosmodecorpk',
        user: 'postgres',
        password: 'postgres'
    });

// Category Mapping Rules
function mapCategory(type, category, tags, title) {
    const fullText = `${type || ''} ${category || ''} ${tags || ''} ${title || ''}`.toLowerCase();
    const catStr = (category || '').toLowerCase();

    // 1. Lighting (User Rule: "Home & Garden > Lighting" -> "lighting")
    if (catStr.includes('lighting') || fullText.includes('lamp')) {
        return 'lighting';
    }

    // 2. Plants (User Rule: "Home & Garden > Lawn & Garden" -> "artificial-plants")
    if (catStr.includes('lawn & garden') || fullText.includes('plant') || fullText.includes('flora') || fullText.includes('flower')) {
        return 'artificial-plants';
    }

    // 3. Wall Decor (User Rule: "Home & Garden > Decor" -> "wall-decor")
    // We prioritize explicit wall items (Mirrors, Art, Clocks)
    if (fullText.includes('mirror') || fullText.includes('wall') || fullText.includes('clock') || fullText.includes('painting') || fullText.includes('frame')) {
        return 'wall-decor';
    }

    // 4. General Decor Exceptions (Items that are Decor but NOT Wall Decor)
    // Vases, Fragrance, Candles usually sit on tables => home-decor or specific? 
    // User said "Others -> home-decor".
    if (fullText.includes('vase') || fullText.includes('candle') || fullText.includes('incense') || fullText.includes('burner') || fullText.includes('pot') || fullText.includes('table')) {
        return 'home-decor';
    }

    // 5. Default "Decor" mapping if not caught above
    if (catStr.includes('decor')) {
        return 'wall-decor'; // Strictly following user instruction
    }

    // 6. Fallback (User Rule: "Others" -> "home-decor")
    return 'home-decor';
}

let categoryCache = new Map();
let nextCategoryId = 1;

async function initCategories() {
    const res = await pool.query('SELECT id, slug FROM categories');
    res.rows.forEach(r => categoryCache.set(r.slug, r.id));

    // Find max integer ID to initialize counter correctly
    let maxId = 0;
    res.rows.forEach(r => {
        const id = parseInt(r.id);
        if (!isNaN(id) && id > maxId) maxId = id;
    });

    // Start from valid max + 1. If max is small, maybe jump to 1000 to avoid conflicts with static IDs
    nextCategoryId = Math.max(maxId + 1, 50);

    console.log(`📂 Loaded ${categoryCache.size} categories. Next ID: ${nextCategoryId}`);
}

async function getCategoryId(slug) {
    if (categoryCache.has(slug)) return categoryCache.get(slug);

    // Create if missing
    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    try {
        const newId = nextCategoryId++;

        // We specify ID explicitly
        await pool.query(
            "INSERT INTO categories (id, name, slug, description, image_url) VALUES ($1, $2, $3, 'Imported category', '/placeholder.jpg')",
            [newId, name, slug]
        );

        categoryCache.set(slug, newId);
        console.log(`✨ Created new category: ${name} (${slug}) ID: ${newId}`);
        return newId;
    } catch (e) {
        // If unique constraint fails in race condition (or slug exists but we missed it?)
        if (e.code === '23505') {
            const res = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
            if (res.rows.length > 0) return res.rows[0].id;
        }
        console.error(`Error creating category ${slug}:`, e.message);
        // Do not crash, maybe fallback
        return null;
    }
}

function cleanHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1000);
}

function processVariations(rows) {
    const variationMap = new Map();

    rows.forEach(row => {
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
        const options = Array.from(values);
        variations.push({
            name: name,
            options: options,
            required: true,
            priceAdjustments: options.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {})
        });
    });

    return variations;
}

async function fixSequence() {
    try {
        await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
        console.log("🔧 Fixed products_id_seq");
    } catch (e) {
        console.log("⚠️ Sequence fix skipped:", e.message);
    }
}

async function run() {
    try {
        await initCategories();
        await fixSequence();

        const csvPath = path.join(__dirname, 'shopify_import_data.tsv');
        const productsMap = new Map();

        console.log(`📖 Reading TSV from: ${csvPath}`);

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv({ separator: '\t' }))
                .on('data', (row) => {
                    // Critical fix: Skip bad rows (e.g. repeated headers)
                    if (!row.Handle || row.Handle === 'Handle') return;

                    if (!productsMap.has(row.Handle)) {
                        productsMap.set(row.Handle, []);
                    }
                    productsMap.get(row.Handle).push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📦 Found ${productsMap.size} unique products in file.`);

        let imported = 0;
        let skipped = 0;

        for (const [handle, rows] of productsMap) {
            const main = rows[0];
            const name = main.Title?.trim();
            if (!name) continue;

            const check = await pool.query('SELECT id FROM products WHERE name = $1', [name]);
            if (check.rows.length > 0) {
                skipped++;
                process.stdout.write('.');
                continue;
            }

            const description = cleanHtml(main['Body (HTML)']);
            const price = parseFloat(main['Variant Price'] || '0');
            const originalPrice = main['Variant Compare At Price'] ? parseFloat(main['Variant Compare At Price']) : null;

            let stock = 0;
            rows.forEach(r => {
                const qty = parseInt(r['Variant Inventory Qty'] || '0');
                if (!isNaN(qty)) stock += qty;
            });

            const imageRow = rows.find(r => r['Image Src']) || rows[0];
            let imageUrl = imageRow['Image Src'] || '';
            if (imageUrl) imageUrl = imageUrl.split('?')[0];
            if (!imageUrl || !imageUrl.startsWith('http')) imageUrl = '/placeholder.jpg';

            const categorySlug = mapCategory(main.Type, main['Product Category'], main.Tags, main.Title);
            const categoryId = await getCategoryId(categorySlug);

            if (!categoryId) {
                console.log(`⚠️ Skip ${name}: No Category ID`);
                continue;
            }

            const variations = processVariations(rows);

            let deliveryCharge = 200;
            if (price > 8000) deliveryCharge = 500;
            else if (price > 3000) deliveryCharge = 200;

            const product = {
                name,
                description,
                price,
                originalPrice,
                imageUrl,
                categoryId,
                subcategory: main.Type || 'Decor',
                rating: (Math.random() * (4.8 - 4.0) + 4.0).toFixed(1),
                reviews: Math.floor(Math.random() * 45) + 5,
                badge: (main.Tags || '').toLowerCase().includes('bestseller') ? 'Bestseller' : null,
                stock,
                deliveryCharge,
                variations
            };

            await pool.query(`
                INSERT INTO products (
                    name, description, price, original_price, image_url, 
                    category_id, subcategory, rating, reviews, badge, 
                    stock, delivery_charge, created_at, variations
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
            `, [
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
            ]);

            imported++;
            process.stdout.write('✅');
        }

        console.log(`\n\n🎉 Done! Imported: ${imported}, Skipped: ${skipped}`);

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        pool.end();
    }
}

run();
