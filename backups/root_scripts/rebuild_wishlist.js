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

        const appDir = '/var/www/cosmodecorpk.com';

        // 1. Clear test wishlist data
        console.log('Clearing test wishlist data...');
        await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -c "DELETE FROM wishlist_items"');
        console.log('✅ Wishlist cleared');

        // 2. Upload updated ProductCard
        console.log('Uploading updated ProductCard...');
        await ssh.putFile('d:\\cosmodecor\\src\\components\\ProductCard.tsx', `${appDir}/src/components/ProductCard.tsx`);
        console.log('✅ ProductCard uploaded');

        // 3. Rebuild frontend (required for client components)
        console.log('Rebuilding frontend... (this may take a minute)');
        const build = await ssh.execCommand('NODE_OPTIONS="--max-old-space-size=2048" npm run build', { cwd: appDir });
        console.log(build.stdout.substring(0, 500)); // Show first 500 chars
        if (build.code !== 0) {
            console.error('Build error:', build.stderr);
        }

        // 4. Restart PM2
        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted');

        console.log('\n🎉 Wishlist fully deployed with frontend rebuild!');
        console.log('Please wait 30 seconds for the site to fully restart.');
        console.log('Then try:');
        console.log('  1. Clear browser cache (Ctrl+Shift+R)');
        console.log('  2. Click the heart icon on any product');
        console.log('  3. Check /wishlist page');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
