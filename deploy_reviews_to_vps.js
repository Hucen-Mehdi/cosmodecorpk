const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = 'C:\\Users\\ARC\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        console.log('🔌 Connecting to VPS...');
        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('✅ Connected!');

        const appDir = '/var/www/cosmodecorpk.com';

        // 1. Upload the updated files
        console.log('📤 Uploading ProductDetailClient.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\app\\(store)\\product\\[id]\\ProductDetailClient.tsx',
            `${appDir}/app/(store)/product/[id]/ProductDetailClient.tsx`
        );

        console.log('📤 Uploading reviewRoutes.ts...');
        await ssh.putFile(
            'd:\\cosmodecor\\server\\src\\routes\\reviewRoutes.ts',
            `${appDir}/server/src/routes/reviewRoutes.ts`
        );

        console.log('📤 Uploading adminRoutes.ts...');
        await ssh.putFile(
            'd:\\cosmodecor\\server\\src\\routes\\adminRoutes.ts',
            `${appDir}/server/src/routes/adminRoutes.ts`
        );

        // 2. Transpile Backend code using tsc if necessary? Wait we'll check pm2 config. We probably need to run npm run build inside server dir too.
        console.log('🏗️  Compiling backend... (if applicable)');
        const serverBuild = await ssh.execCommand('npm run build', { cwd: `${appDir}/server` });
        console.log('Server Build Output:', serverBuild.stdout);

        console.log('🏗️  Building Next.js app...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log('Next Build Output:', buildResult.stdout);

        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build threw an error:', buildResult.stderr);
        }

        // 3. Restart PM2
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
