const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = 'C:\\Users\\ARC\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        console.log('🔌 Connecting to VPS (72.61.214.54)...');
        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('✅ Connected!');

        const appDir = '/var/www/cosmodecorpk.com';

        // 1. Upload the updated CheckoutClient.tsx
        console.log('📤 Uploading updated CheckoutClient.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\app\\(store)\\checkout\\CheckoutClient.tsx',
            `${appDir}/app/(store)/checkout/CheckoutClient.tsx`
        );
        console.log('✅ CheckoutClient.tsx uploaded');

        // 2. Run Build
        console.log('🏗️  Building Next.js app on VPS (this may take a minute)...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log('Build Output:', buildResult.stdout);

        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build failed:', buildResult.stderr);
            throw new Error('Build failed');
        }
        console.log('✅ Build complete.');

        // 3. Restart PM2
        console.log('🔄 Restarting PM2...');
        // Based on previous deploy scripts, 'cosmo-decor' is the target process
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted.');

        console.log('\n✨ Deployment Complete! ✨');
        console.log('Payment methods updated effectively.');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
