const fs = require('fs');
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: 'localhost',
        port: 5432,
        database: 'cosmodecorpk',
        user: 'postgres',
        password: 'postgres'
    });

// Columns known to be JSON (so we don't treat them as Arrays even if they start with {)
const JSON_COLUMNS = ['variations', 'selected_variations', 'metadata', 'options'];

async function restoreFromBackup() {
    try {
        console.log('📖 Reading database_backup.sql...');
        const sql = fs.readFileSync('database_backup.sql', 'utf8');

        // Disable FK constraints
        await pool.query('SET session_replication_role = "replica"');

        async function restoreTable(tableName, columns) {
            console.log(`⏳ Restoring table: ${tableName}...`);
            const marker = `COPY public.${tableName} (${columns.join(', ')}) FROM stdin;`;
            const startIdx = sql.indexOf(marker);
            if (startIdx === -1) {
                console.log(`⚠️ Could not find ${tableName} in backup.`);
                return;
            }

            const dataStart = startIdx + marker.length;
            const endIdx = sql.indexOf('\n\\.', dataStart);
            if (endIdx === -1) {
                console.log(`⚠️ Could not find end of ${tableName} data.`);
                return;
            }

            const rows = sql.substring(dataStart, endIdx).split('\n');
            console.log(`📦 Found ${rows.length} rows for ${tableName}. (Cleaning...)`);

            // Clear existing
            await pool.query(`DELETE FROM ${tableName} CASCADE`);

            let success = 0;
            for (const row of rows) {
                if (!row.trim()) continue;

                // Split by tab, but we need to match columns index
                const rawValues = row.split('\t');

                if (rawValues.length !== columns.length) {
                    continue;
                }

                const values = rawValues.map((v, i) => {
                    v = v.trim();
                    if (v === '\\N' || v === '') return null;

                    const colName = columns[i];

                    // If it's a known JSON column, return as string (Postgres will parse it)
                    if (JSON_COLUMNS.includes(colName)) {
                        return v;
                    }

                    // If it looks like a Postgres Array AND is NOT a JSON column
                    if (v.startsWith('{') && v.endsWith('}')) {
                        const inner = v.substring(1, v.length - 1).trim();
                        if (!inner) return [];
                        // Split PG array items
                        return inner.split(',').map(item => item.trim().replace(/^"(.*)"$/, '$1'));
                    }

                    return v;
                });

                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

                try {
                    await pool.query(query, values);
                    success++;
                } catch (e) {
                    console.error(`❌ Error inserting into ${tableName}:`, e.message);
                }
            }
            console.log(`✅ ${tableName} restored (${success}/${rows.length} rows).`);
        }

        // 0. Users
        await restoreTable('users', ['id', 'name', 'email', 'password_hash', 'role', 'first_name', 'phone', 'created_at']);

        // 1. Categories
        await restoreTable('categories', ['id', 'name', 'icon', 'image_url', 'parent_id', 'slug', 'description']);

        // 2. Products
        await restoreTable('products', [
            'id', 'name', 'price', 'original_price', 'image_url', 'category_id',
            'subcategory', 'rating', 'reviews', 'badge', 'description', 'stock',
            'delivery_charge', 'created_at', 'variations', 'additional_images', 'category_ids'
        ]);

        // 3. Reviews
        await restoreTable('reviews', [
            'id', 'product_id', 'rating', 'comment', 'reviewer_name', 'reviewer_email',
            'review_date', 'picture_urls', 'verified_purchase', 'status', 'created_at'
        ]);

        // 4. Testimonials
        await restoreTable('testimonials', ['id', 'name', 'location', 'image_url', 'rating', 'message', 'created_at']);

        // 5. Orders & Related
        await restoreTable('orders', [
            'id', 'order_number', 'user_id', 'date', 'status', 'items_count', 'subtotal', 'shipping', 'total',
            'payment_method', 'shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_postal_code', 'shipping_notes', 'created_at'
        ]);
        await restoreTable('order_items', [
            'id', 'order_id', 'product_id', 'name', 'price', 'quantity', 'image_url',
            'delivery_charge', 'selected_variations', 'item_delivery_charge'
        ]);
        await restoreTable('addresses', ['id', 'user_id', 'label', 'line1', 'line2', 'city', 'region', 'postal_code', 'country', 'is_default', 'created_at']);
        await restoreTable('notifications', ['id', 'user_id', 'title', 'message', 'type', 'order_id', 'is_read', 'created_at']);

        // Re-enable FK constraints
        await pool.query('SET session_replication_role = "origin"');

        // 6. Fix Sequences
        await pool.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
        await pool.query("SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews))");
        await pool.query("SELECT setval('testimonials_id_seq', (SELECT MAX(id) FROM testimonials))");
        await pool.query("SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications))");
        await pool.query("SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items))");

        console.log('🎉 Full restore from backup completed (including Users and Orders)!');

    } catch (err) {
        console.error('❌ Restore failed:', err);
    } finally {
        await pool.end();
    }
}

restoreFromBackup();
