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

        // Upload new files
        console.log('Uploading wishlist files...');
        await ssh.putFile('d:\\cosmodecor\\server\\src\\routes\\wishlistRoutes.ts', `${appDir}/server/src/routes/wishlistRoutes.ts`);
        await ssh.putFile('d:\\cosmodecor\\server\\src\\repositories\\wishlistRepository.ts', `${appDir}/server/src/repositories/wishlistRepository.ts`);
        await ssh.putFile('d:\\cosmodecor\\server\\src\\index.ts', `${appDir}/server/src/index.ts`);
        await ssh.putFile('d:\\cosmodecor\\src\\api\\wishlist.ts', `${appDir}/src/api/wishlist.ts`);
        await ssh.putFile('d:\\cosmodecor\\app\\(store)\\wishlist\\WishlistClient.tsx', `${appDir}/app/(store)/wishlist/WishlistClient.tsx`);
        console.log('✅ Files uploaded');

        // Rebuild server
        console.log('Rebuilding server...');
        const build = await ssh.execCommand('npm run build:server', { cwd: appDir });
        console.log(build.stdout);
        if (build.stderr) console.error(build.stderr);

        // Restart PM2
        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted');

        console.log('\n🎉 Wishlist functionality deployed successfully!');
        console.log('Users can now:');
        console.log('  - View their wishlist at /wishlist');
        console.log('  - Add/remove items from wishlist');
        console.log('  - Wishlist persists across sessions');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
