const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = require('os').homedir() + '\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        console.log('🔌 Connecting to VPS...');
        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('✅ Connected!');

        const appDir = '/var/www/cosmodecorpk.com';

        // Ensure directories exist
        await ssh.execCommand('mkdir -p components/checkout', { cwd: appDir });

        console.log('📤 Uploading EidNotice.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\components\\checkout\\EidNotice.tsx',
            `${appDir}/components/checkout/EidNotice.tsx`
        );

        console.log('📤 Uploading CheckoutClient.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\app\\(store)\\checkout\\CheckoutClient.tsx',
            `${appDir}/app/(store)/checkout/CheckoutClient.tsx`
        );

        console.log('🏗️  Building Next.js app...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log('Next Build Output:', buildResult.stdout);

        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build threw an error:', buildResult.stderr);
        }

        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted.');

        console.log('\n✨ Deployment Complete! ✨');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
