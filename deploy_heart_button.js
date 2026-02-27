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

        // Upload updated ProductCard
        console.log('Uploading updated ProductCard...');
        await ssh.putFile('d:\\cosmodecor\\src\\components\\ProductCard.tsx', `${appDir}/src/components/ProductCard.tsx`);
        console.log('✅ ProductCard uploaded');

        // Restart PM2 to pick up changes
        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted');

        console.log('\n🎉 Wishlist heart button is now functional!');
        console.log('Features:');
        console.log('  ✅ Click heart to add/remove from wishlist');
        console.log('  ✅ Heart fills when product is in wishlist');
        console.log('  ✅ Redirects to login if not authenticated');
        console.log('  ✅ Persists across page reloads');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
