const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to database");

        // 1. Add payment_method to orders
        console.log("Checking orders table...");
        const orderColsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
        const orderCols = orderColsRes.rows.map(r => r.column_name);

        if (!orderCols.includes('payment_method')) {
            console.log("Adding payment_method to orders...");
            await client.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'advance'");
            // Add check constraint
            await client.query("ALTER TABLE orders ADD CONSTRAINT payment_method_check CHECK (payment_method IN ('advance', 'cod'))");
        }

        // 2. Add delivery_charge to products
        console.log("Checking products table...");
        const productColsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
        const productCols = productColsRes.rows.map(r => r.column_name);

        if (!productCols.includes('delivery_charge')) {
            console.log("Adding delivery_charge to products...");
            await client.query("ALTER TABLE products ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 200.00");
        }

        // 3. Add item_delivery_charge to order_items
        console.log("Checking order_items table...");
        const orderItemColsRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'");
        const orderItemCols = orderItemColsRes.rows.map(r => r.column_name);

        if (!orderItemCols.includes('item_delivery_charge')) {
            console.log("Adding item_delivery_charge to order_items...");
            await client.query("ALTER TABLE order_items ADD COLUMN item_delivery_charge DECIMAL(10,2) DEFAULT 200.00");
        }

        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
