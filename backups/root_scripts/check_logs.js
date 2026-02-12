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

        console.log('📄 Reading PM2 Logs...');
        const outLog = await ssh.execCommand('tail -n 100 /root/.pm2/logs/cosmo-decor-out.log');
        const errLog = await ssh.execCommand('tail -n 100 /root/.pm2/logs/cosmo-decor-error.log');

        console.log('\n--- OUT LOG ---');
        console.log(outLog.stdout);

        console.log('\n--- ERROR LOG ---');
        console.log(errLog.stdout);
        console.log(errLog.stderr);

        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

run();
