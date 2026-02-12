const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        // Use the same key path as seen in other scripts
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

        // Helper to upload file with correct logging
        const upload = async (localPath, remotePath) => {
            console.log(`📤 Uploading ${path.basename(localPath)}...`);
            await ssh.putFile(localPath, remotePath);
        };

        // 1. Ensure remote directory exists
        console.log('📂 Creating remote directories...');
        await ssh.execCommand(`mkdir -p ${appDir}/app/admin/reviews`);

        // 2. Upload files
        await upload('d:\\cosmodecor\\src\\components\\Navbar.tsx', `${appDir}/src/components/Navbar.tsx`);
        await upload('d:\\cosmodecor\\server\\src\\routes\\adminRoutes.ts', `${appDir}/server/src/routes/adminRoutes.ts`);
        await upload('d:\\cosmodecor\\server\\src\\routes\\accountRoutes.ts', `${appDir}/server/src/routes/accountRoutes.ts`);
        await upload('d:\\cosmodecor\\src\\api\\admin.ts', `${appDir}/src/api/admin.ts`);
        await upload('d:\\cosmodecor\\app\\admin\\reviews\\page.tsx', `${appDir}/app/admin/reviews/page.tsx`);
        await upload('d:\\cosmodecor\\app\\admin\\layout.tsx', `${appDir}/app/admin/layout.tsx`);

        // 3. Run Build
        console.log('🏗️  Building Next.js app...');
        // We run build to ensure everything is correct
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log('Build output:', buildResult.stdout);
        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build threw an error:', buildResult.stderr);
            // We might want to stop here if build fails, but for "asap" maybe we restart anyway? 
            // Better to fail if build fails.
            throw new Error('Build failed');
        }
        console.log('✅ Build complete.');

        // 4. Restart PM2
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
