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

        console.log('🏗️  Building Next.js app on VPS...');
        // We use 'npm run build' which runs 'next build' and 'tsc' for server
        const buildResult = await ssh.execCommand('npm run build', { cwd: appDir });
        console.log(buildResult.stdout);

        if (buildResult.stderr && !buildResult.stderr.includes('warn') && buildResult.code !== 0) {
            console.error('❌ Build Failed:', buildResult.stderr);
            // If build fails, DO NOT restart
            process.exit(1);
        }

        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ PM2 Restarted successfully.');

        console.log('\n✨ Deployment Live! ✨');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

run();
