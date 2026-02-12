const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');

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

        // Helper to upload
        const upload = async (localPath, remotePath) => {
            console.log(`📤 Uploading ${path.basename(localPath)}...`);
            await ssh.putFile(localPath, remotePath);
        };

        // 1. Ensure Directories
        console.log('📂 Creating directories...');
        await ssh.execCommand(`mkdir -p ${appDir}/app/\\(store\\)/review/\\[token\\]`);
        await ssh.execCommand(`mkdir -p ${appDir}/app/admin/reviews`); // From before

        // 2. Upload Files
        // Product Page (Review Form Removed)
        await upload('d:\\cosmodecor\\app\\(store)\\product\\[id]\\ProductDetailClient.tsx', `${appDir}/app/(store)/product/[id]/ProductDetailClient.tsx`);
        // New Review Page
        await upload('d:\\cosmodecor\\app\\(store)\\review\\[token]\\page.tsx', `${appDir}/app/(store)/review/[token]/page.tsx`);
        // Backend Route
        await upload('d:\\cosmodecor\\server\\src\\routes\\reviewRoutes.ts', `${appDir}/server/src/routes/reviewRoutes.ts`);
        // Migration Script
        await upload('d:\\cosmodecor\\vps_migration.js', `${appDir}/vps_migration.js`);

        // 3. Run Migration
        console.log('🏗️  Running Database Migration...');
        const migrationResult = await ssh.execCommand('node vps_migration.js', { cwd: appDir });
        console.log(migrationResult.stdout);
        if (migrationResult.stderr && !migrationResult.stderr.includes('warn') && migrationResult.code !== 0) {
            console.error('❌ Migration error:', migrationResult.stderr);
        }

        console.log('\n✨ Upload and Migration Complete! ✨');
        console.log('⚠️  NOT RESTARTING PM2 YET. SCHEDULED FOR 2AM UTC OR UPON CONFIRMATION. ⚠️');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
