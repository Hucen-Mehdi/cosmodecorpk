const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = 'C:\\Users\\ARC\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('Connected to VPS!');

        // Reset all sequences to max ID + 1
        const tables = [
            { table: 'users', column: 'id', sequence: 'users_id_seq' },
            { table: 'products', column: 'id', sequence: 'products_id_seq' },
            { table: 'categories', column: 'id', sequence: 'categories_id_seq' },
            { table: 'orders', column: 'id', sequence: 'orders_id_seq' },
            { table: 'order_items', column: 'id', sequence: 'order_items_id_seq' },
            { table: 'reviews', column: 'id', sequence: 'reviews_id_seq' },
            { table: 'addresses', column: 'id', sequence: 'addresses_id_seq' },
            { table: 'notifications', column: 'id', sequence: 'notifications_id_seq' },
            { table: 'hero_slides', column: 'id', sequence: 'hero_slides_id_seq' },
            { table: 'testimonials', column: 'id', sequence: 'testimonials_id_seq' },
            { table: 'wishlist_items', column: 'id', sequence: 'wishlist_items_id_seq' },
        ];

        for (const { table, column, sequence } of tables) {
            const sql = `SELECT setval('${sequence}', COALESCE((SELECT MAX(${column}) FROM ${table}), 0) + 1, false);`;
            const result = await ssh.execCommand(`sudo -u postgres psql -d cosmo_decor -c "${sql}"`);
            console.log(`✅ Reset ${sequence}: ${result.stdout.trim()}`);
        }

        console.log('\n🎉 All sequences reset successfully!');
        console.log('You can now place orders without errors.');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
