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

        // Fix the accountRoutes file
        console.log('Fixing accountRoutes...');
        const fixCmd = `
cd ${appDir}
sed -i 's/wishlistRepository.addToWishlist/wishlistRepository.add/g' server/src/routes/accountRoutes.ts
sed -i 's/wishlistRepository.removeFromWishlist/wishlistRepository.remove/g' server/src/routes/accountRoutes.ts
`;
        await ssh.execCommand(fixCmd);
        console.log('✅ Fixed method names');

        // Rebuild server
        console.log('Rebuilding server...');
        const build = await ssh.execCommand('npm run build:server', { cwd: appDir });
        console.log(build.stdout);
        if (build.stderr && !build.stderr.includes('npm warn')) console.error(build.stderr);

        // Restart PM2
        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted');

        console.log('\n🎉 Wishlist fixed and deployed!');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
