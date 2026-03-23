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

        // 1. Fix VPS git state safely by stashing modifications and deleting the previously ad-hoc uploaded untracked files
        console.log('📥 Cleaning up previous loose SSH uploads on VPS working tree...');
        await ssh.execCommand('git stash', { cwd: appDir });
        await ssh.execCommand('rm -f components/admin/ImageUploader.tsx components/home/ReviewsCarousel.tsx server/src/routes/reviewRoutes.ts', { cwd: appDir });

        const gitPull = await ssh.execCommand('git pull origin main', { cwd: appDir });
        console.log(gitPull.stdout);
        if (gitPull.stderr) console.error(gitPull.stderr);

        // 2. Install dependencies (just in case)
        console.log('📦 Installing root dependencies...');
        await ssh.execCommand('npm ci', { cwd: appDir });
        await ssh.execCommand('npm ci', { cwd: `${appDir}/server` });

        // 3. Move images to the public folder to fix the issue on the live server
        console.log('📂 Migrating existing uploaded images to public/uploads (if any exist)...');
        await ssh.execCommand('mkdir -p public/uploads', { cwd: appDir });
        await ssh.execCommand('cp -R uploads/* public/uploads/ 2>/dev/null || true', { cwd: appDir });

        // 4. Build both frontend and backend
        console.log('🏗️  Building application...');
        const buildProcess = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log('Build Output:', buildProcess.stdout);
        if (buildProcess.stderr) {
            console.error('Build Error:', buildProcess.stderr);
        }

        // 5. Restart PM2 services
        console.log('🔄 Restarting PM2...');
        const pm2Restart = await ssh.execCommand('pm2 restart cosmo-frontend cosmo-server', { cwd: appDir });
        console.log(pm2Restart.stdout);

        console.log('\n✨ Deployment Complete! ✨');
        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

run();
