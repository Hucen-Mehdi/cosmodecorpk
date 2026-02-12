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

        // 1. Upload updated app/(store)/page.tsx (Reduced padding)
        console.log('📤 Uploading page.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\app\\(store)\\page.tsx',
            `${appDir}/app/(store)/page.tsx`
        );

        // 2. Upload updated components/home/HeroSlider.tsx (Slightly larger banner)
        console.log('📤 Uploading HeroSlider.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\components\\home\\HeroSlider.tsx',
            `${appDir}/components/home/HeroSlider.tsx`
        );

        // 3. Upload updated components/home/HomeProducts.tsx (Font change)
        console.log('📤 Uploading HomeProducts.tsx...');
        await ssh.putFile(
            'd:\\cosmodecor\\components\\home\\HomeProducts.tsx',
            `${appDir}/components/home/HomeProducts.tsx`
        );

        // 4. Run Build
        console.log('🏗️  Building Next.js app...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build threw an error (but proceeding if code 0):', buildResult.stderr);
            if (buildResult.code !== 0) throw new Error('Build failed');
        }
        console.log(buildResult.stdout);
        console.log('✅ Build complete.');

        // 5. Restart PM2
        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted.');

        console.log('\n✨ Deployment Complete! ✨');
        console.log('Changes live at https://www.cosmodecorpk.com');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
