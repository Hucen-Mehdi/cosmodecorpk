import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const DATA_DIR = path.join(process.cwd(), 'server', 'data');

const readJson = <T = any>(filename: string): T[] => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ ${filename} not found, skipping.`);
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const seed = async () => {
    console.log('🚀 Starting Robust Seed Process...');
    const client = await pool.connect();
    let exitCode = 0;

    try {
        await client.query('BEGIN');
        // 🔥 DEV RESET (safe delete to avoid FK locks)
        await client.query('DELETE FROM wishlist_items');
        await client.query('DELETE FROM addresses');
        await client.query('DELETE FROM order_items');
        await client.query('DELETE FROM orders');
        await client.query('DELETE FROM contacts');
        await client.query('DELETE FROM testimonials');
        await client.query('DELETE FROM products');
        await client.query('DELETE FROM categories');
        await client.query('DELETE FROM users');


        const categories = readJson<any>('categories.json');
        const products = readJson<any>('products.json');
        const users = readJson<any>('users.json');
        const testimonials = readJson<any>('testimonials.json');
        const contacts = readJson<any>('contacts.json');
        const orders = readJson<any>('orders.json');
        const addresses = readJson<any>('addresses.json');
        const wishlists = readJson<any>('wishlists.json');

        // 1️⃣ Categories (TWO-PASS to avoid FK locks)
        console.log(`📁 Seeding ${categories.length} Categories...`);
        const validCategoryIds = new Set<string>();

        // PASS 1: Insert parent categories ONLY
        for (const cat of categories) {
            await client.query(
                `
    INSERT INTO categories (id, name, icon, image_url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO NOTHING
    `,
                [cat.id, cat.name, cat.icon ?? null, cat.image ?? null]
            );

            validCategoryIds.add(cat.id);
        }

        // PASS 2: Insert subcategories AFTER parents exist
        for (const cat of categories) {
            if (!Array.isArray(cat.subcategories)) continue;

            for (const sub of cat.subcategories) {
                const subId =
                    sub.id || sub.name.toLowerCase().replace(/\s+/g, '-');

                await client.query(
                    `
      INSERT INTO categories (id, name, parent_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
      `,
                    [subId, sub.name, cat.id]
                );

                validCategoryIds.add(subId);
            }
        }


        // 2️⃣ Products
        console.log(`📦 Seeding ${products.length} Products...`);

        for (const p of products) {
            let categoryId: string | null = p.category ?? null;

            if (categoryId && !validCategoryIds.has(categoryId)) {
                console.warn(
                    `⚠️ Product ${p.id} references missing category "${categoryId}". Creating it.`
                );

                await client.query(
                    `
          INSERT INTO categories (id, name)
          VALUES ($1, $2)
          ON CONFLICT (id) DO NOTHING
          `,
                    [categoryId, categoryId]
                );

                validCategoryIds.add(categoryId);
            }

            await client.query(
                `
        INSERT INTO products
          (id, name, price, original_price, image_url, category_id,
           subcategory, rating, reviews, badge, description, stock)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            price = EXCLUDED.price,
            original_price = EXCLUDED.original_price,
            image_url = EXCLUDED.image_url,
            category_id = EXCLUDED.category_id,
            subcategory = EXCLUDED.subcategory,
            rating = EXCLUDED.rating,
            reviews = EXCLUDED.reviews,
            badge = EXCLUDED.badge,
            description = EXCLUDED.description,
            stock = EXCLUDED.stock
        `,
                [
                    p.id,
                    p.name,
                    p.price,
                    p.originalPrice ?? null,
                    p.image ?? null,
                    categoryId,
                    p.subcategory ?? null,
                    p.rating ?? 0,
                    p.reviews ?? 0,
                    p.badge ?? null,
                    p.description ?? null,
                    p.stock ?? 100, // Default to 100 if not specified
                ]
            );
        }

        // 3️⃣ Users
        console.log(`👤 Seeding ${users.length} Users...`);
        const validUserIds = new Set<string>();

        for (const u of users) {
            await client.query(
                `
        INSERT INTO users
          (id, name, email, password_hash, role, first_name, phone)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role
        `,
                [
                    u.id,
                    u.name,
                    u.email,
                    u.passwordHash,
                    u.role,
                    u.firstName ?? null,
                    u.phone ?? null,
                ]
            );

            validUserIds.add(u.id);
        }

        // 4️⃣ Testimonials
        console.log(`💬 Seeding ${testimonials.length} Testimonials...`);
        for (const t of testimonials) {
            await client.query(
                `
        INSERT INTO testimonials
          (id, name, location, image_url, rating, message)
        VALUES
          ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            message = EXCLUDED.message
        `,
                [t.id, t.name, t.location ?? null, t.image ?? null, t.rating ?? 5, t.text]
            );
        }

        // 5️⃣ Contacts
        console.log(`📨 Seeding ${contacts.length} Contacts...`);
        for (const c of contacts) {
            await client.query(
                `
        INSERT INTO contacts
          (id, name, email, subject, message, created_at)
        VALUES
          ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO NOTHING
        `,
                [
                    c.id,
                    c.name,
                    c.email,
                    c.subject,
                    c.message,
                    c.date ? new Date(c.date) : new Date(),
                ]
            );
        }

        // 6️⃣ Orders + Items
        console.log(`🧾 Seeding ${orders.length} Orders...`);
        for (const o of orders) {
            if (!validUserIds.has(o.userId)) continue;

            await client.query(
                `
        INSERT INTO orders
          (id, order_number, user_id, date, status, items_count, subtotal, shipping, total)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
        `,
                [
                    o.id,
                    o.orderNumber,
                    o.userId,
                    o.date,
                    o.status,
                    o.itemsCount,
                    o.subtotal,
                    o.shipping,
                    o.total,
                ]
            );

            await client.query('DELETE FROM order_items WHERE order_id = $1', [
                o.id,
            ]);

            for (const item of o.items ?? []) {
                await client.query(
                    `
          INSERT INTO order_items
            (order_id, product_id, name, price, quantity, image_url)
          VALUES
            ($1,$2,$3,$4,$5,$6)
          `,
                    [
                        o.id,
                        Number(item.productId),
                        item.name,
                        item.price,
                        item.quantity,
                        item.image ?? null,
                    ]
                );
            }
        }

        // 7️⃣ Addresses
        console.log(`🏠 Seeding ${addresses.length} Addresses...`);
        for (const a of addresses) {
            if (!validUserIds.has(a.userId)) continue;

            await client.query(
                `
        INSERT INTO addresses
          (id, user_id, label, line1, line2, city, region, postal_code, country, is_default)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE
        SET line1 = EXCLUDED.line1,
            city = EXCLUDED.city
        `,
                [
                    a.id,
                    a.userId,
                    a.label,
                    a.line1,
                    a.line2 ?? null,
                    a.city,
                    a.region,
                    a.postalCode,
                    a.country,
                    a.isDefault ?? false,
                ]
            );
        }

        // 8️⃣ Wishlists
        console.log(`❤️ Seeding Wishlists...`);
        for (const w of wishlists) {
            if (!validUserIds.has(w.userId)) continue;

            for (const productId of w.items ?? []) {
                await client.query(
                    `
          INSERT INTO wishlist_items (user_id, product_id)
          VALUES ($1,$2)
          ON CONFLICT DO NOTHING
          `,
                    [w.userId, Number(productId)]
                );
            }
        }

        await client.query('COMMIT');
        console.log('✅ Seeding completed successfully!');
    } catch (err) {
        exitCode = 1;
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        await pool.end();
        process.exit(exitCode);
    }
};

seed().catch((err) => {
    console.error('❌ Fatal seed error:', err);
    process.exit(1);
});
