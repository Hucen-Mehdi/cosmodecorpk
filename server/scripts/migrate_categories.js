const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to database");

        console.log("Checking columns...");
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
        const columns = res.rows.map(r => r.column_name);
        console.log("Existing columns:", columns);

        if (!columns.includes('category_ids')) {
            console.log("Adding category_ids column...");
            await client.query('ALTER TABLE products ADD COLUMN category_ids TEXT[] DEFAULT \'{}\'');
            console.log("Column added.");
        } else {
            console.log("category_ids column already exists.");
        }

        console.log("Populating category_ids from category_id...");
        await client.query('UPDATE products SET category_ids = ARRAY[category_id] WHERE category_id IS NOT NULL AND (category_ids IS NULL OR array_length(category_ids, 1) IS NULL)');
        console.log("Data populated.");

        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
