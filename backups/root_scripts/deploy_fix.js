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

        console.log('📤 Uploading fixed adminRoutes.ts...');
        await ssh.putFile('d:\\cosmodecor\\server\\src\\routes\\adminRoutes.ts', '/var/www/cosmodecorpk.com/server/src/routes/adminRoutes.ts');

        console.log('🏗️  Rebuilding backend...');
        await ssh.execCommand('npm run build:server', { cwd: '/var/www/cosmodecorpk.com' });

        console.log('🔄 Restarting PM2...');
        await ssh.execCommand('pm2 restart cosmo-decor');
        console.log('✅ Fixed & Live!');

        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

run();
