import { pool } from '../src/db/client';
import bcrypt from 'bcryptjs';

const seed = async () => {
    console.log('🌱 Starting seed...');

    try {
        // 1. Clean up existing data (optional, be careful in prod)
        // await pool.query('TRUNCATE TABLE users, products, categories, orders CASCADE');

        // 2. Create Admin User
        const adminEmail = 'admin@cosmodecor.pk';
        const adminPassword = 'admin'; // Simple for now
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Check if exists
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (userRes.rows.length === 0) {
            await pool.query(`
                INSERT INTO users (id, name, email, password_hash, role, first_name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                Date.now().toString(), // unique string ID
                'Admin User',
                adminEmail,
                hashedPassword,
                'admin',
                'Admin'
            ]);
            console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log('ℹ️ Admin already exists');
        }

        // 3. Create Categories
        const categories = [
            { name: 'Living Room', icon: 'sofa', description: 'Comfortable living room furniture' },
            { name: 'Bedroom', icon: 'bed', description: 'Cozy bedroom sets' },
            { name: 'Decor', icon: 'star', description: 'Home decoration items' },
            { name: 'Lighting', icon: 'lamp', description: 'Brighten up your home' }
        ];

        const categoryIds: Record<string, string> = {};

        for (const cat of categories) {
            const catId = cat.name.toLowerCase().replace(/\s+/g, '-');
            const res = await pool.query(`
                INSERT INTO categories (id, name, icon, description, slug)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `, [catId, cat.name, cat.icon, cat.description, catId]);
            categoryIds[cat.name] = res.rows[0].id;
            console.log(`✅ Category created: ${cat.name}`);
        }

        // 4. Create Products
        const products = [
            {
                name: 'Modern Sofa',
                price: 45000,
                original_price: 50000,
                image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                category_id: categoryIds['Living Room'],
                description: 'A beautiful modern sofa for your living room.',
                stock: 10,
                rating: 4.5,
                reviews: 12
            },
            {
                name: 'Table Lamp',
                price: 2500,
                original_price: 3000,
                image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
                category_id: categoryIds['Lighting'],
                description: 'Elegant table lamp.',
                stock: 25,
                rating: 4.8,
                reviews: 8
            },
            {
                name: 'Wall Art',
                price: 1500,
                original_price: 2000,
                image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                category_id: categoryIds['Decor'],
                description: 'Abstract wall art.',
                stock: 50,
                rating: 4.2,
                reviews: 5
            }
        ];

        for (const prod of products) {
            // Check if product exists (by name to avoid duplicates during re-seed)
            const check = await pool.query('SELECT id FROM products WHERE name = $1', [prod.name]);
            if (check.rows.length === 0) {
                await pool.query(`
                   INSERT INTO products (
                       name, price, original_price, image_url, category_id, category_ids,
                       description, stock, rating, reviews, variations
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               `, [
                    prod.name, prod.price, prod.original_price, prod.image_url,
                    prod.category_id, [prod.category_id],
                    prod.description, prod.stock, prod.rating, prod.reviews,
                    JSON.stringify([]) // variations default
                ]);
                console.log(`✅ Product created: ${prod.name}`);
            } else {
                console.log(`ℹ️ Product already exists: ${prod.name}`);
            }
        }

        console.log('🎉 Seed completed successfully!');
    } catch (err) {
        console.error('❌ Seed failed:', err);
    } finally {
        await pool.end();
    }
};

seed();
