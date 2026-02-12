
const { Pool } = require('pg');
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'cosmodecorpk',
    user: 'postgres',
    password: 'postgres'
});

async function enableCascade() {
    try {
        console.log('🔄 Setting up ON DELETE CASCADE...');

        // 1. Products -> Category
        // Drop existing constraint
        await pool.query(`
            ALTER TABLE products 
            DROP CONSTRAINT IF EXISTS products_category_id_fkey;
        `);
        // Add new constraint with CASCADE
        await pool.query(`
            ALTER TABLE products 
            ADD CONSTRAINT products_category_id_fkey 
            FOREIGN KEY (category_id) 
            REFERENCES categories(id) 
            ON DELETE CASCADE;
        `);
        console.log('✅ Enabled CASCADE for: Products -> Category');

        // 2. Categories -> Parent Category (Subcategories)
        // Drop existing constraint
        await pool.query(`
            ALTER TABLE categories 
            DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
        `);
        // Add new constraint with CASCADE
        await pool.query(`
            ALTER TABLE categories 
            ADD CONSTRAINT categories_parent_id_fkey 
            FOREIGN KEY (parent_id) 
            REFERENCES categories(id) 
            ON DELETE CASCADE;
        `);
        console.log('✅ Enabled CASCADE for: Subcategories -> Parent Category');

        // 3. Order Items -> Products (Optional: Usually we don't want to delete order history if a product is deleted, 
        //    we usually want SET NULL or keep individual record. But user asked for "Permanent deletion".
        //    However, deleting ordered products breaks order history. 
        //    I will keep OrderItems as is or SET NULL to be safe, but typically e-commerces don't cascade delete here.
        //    I will NOT cascade delete orders. If a product is deleted, the order item should probably persist 
        //    or have product_id set to NULL but name/price kept.
        //    Standard practice: Order items table stores snapshot of data (name, price) so FK can be nullable.)

        // Let's modify OrderItems to allow NULL product_id if not already
        await pool.query(`
            ALTER TABLE order_items 
            ALTER COLUMN product_id DROP NOT NULL;
        `);

        await pool.query(`
            ALTER TABLE order_items 
            DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
        `);

        await pool.query(`
            ALTER TABLE order_items 
            ADD CONSTRAINT order_items_product_id_fkey 
            FOREIGN KEY (product_id) 
            REFERENCES products(id) 
            ON DELETE SET NULL;
        `);
        console.log('✅ Updated Order Items: Set Product ID to NULL on delete (Preserves Order History)');

    } catch (err) {
        console.error('❌ Error enabling cascade:', err.message);
    } finally {
        pool.end();
    }
}

enableCascade();
