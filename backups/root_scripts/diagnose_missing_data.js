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
        console.log('Connected!');

        // Check table counts
        const tablesRes = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -c "\\dt"');
        console.log('Tables:\n' + tablesRes.stdout);

        const countsQuery = `
      SELECT 'products' as table, count(*) FROM products
      UNION ALL
      SELECT 'categories' as table, count(*) FROM categories
      UNION ALL
      SELECT 'banners' as table, count(*) FROM banners;
    `;
        // Note: 'banners' might fail if it doesn't exist, so I'll wrap it or check first.

        const productsCount = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -t -c "SELECT count(*) FROM products"');
        console.log('Products Count:', productsCount.stdout.trim());

        const categoriesCount = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -t -c "SELECT count(*) FROM categories"');
        console.log('Categories Count:', categoriesCount.stdout.trim());

        // Check if banners table exists
        if (tablesRes.stdout.includes('banners')) {
            const bannersCount = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -t -c "SELECT count(*) FROM banners"');
            console.log('Banners Count:', bannersCount.stdout.trim());
        } else {
            console.log('Banners table does NOT exist.');
        }

        // Check PM2 logs for any errors during fetch
        const logs = await ssh.execCommand('pm2 logs cosmo-decor --lines 50 --nostream');
        console.log('PM2 Logs:\n' + logs.stdout);

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
