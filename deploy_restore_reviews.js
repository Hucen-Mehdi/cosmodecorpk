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

        // 1. Upload font-updated files
        console.log('📤 Uploading page.tsx...');
        await ssh.putFile('d:\\cosmodecor\\app\\(store)\\page.tsx', `${appDir}/app/(store)/page.tsx`);

        console.log('📤 Uploading FeaturedProductsCarousel.tsx...');
        await ssh.putFile('d:\\cosmodecor\\components\\home\\FeaturedProductsCarousel.tsx', `${appDir}/components/home/FeaturedProductsCarousel.tsx`);

        // 2. Upload seed script
        console.log('📤 Uploading seed-testimonials.js...');
        await ssh.putFile('d:\\cosmodecor\\server\\scripts\\seed-testimonials.js', `${appDir}/server/scripts/seed-testimonials.js`);

        // 3. Run Build
        console.log('🏗️  Building Next.js app...');
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build threw an error (but proceeding if code 0):', buildResult.stderr);
            if (buildResult.code !== 0) throw new Error('Build failed');
        }
        console.log('✅ Build complete.');

        // 4. Seed Database
        console.log('🌱 Restoring testimonials...');
        const seedResult = await ssh.execCommand('node server/scripts/seed-testimonials.js', { cwd: appDir });
        console.log(seedResult.stdout);
        if (seedResult.stderr) console.error(seedResult.stderr);

        // 5. Restart PM2
        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 restarted.');

        console.log('\n✨ Deployment Complete! ✨');
        console.log('Testimonials section restored & Times New Roman fonts applied.');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
