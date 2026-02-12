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

        console.log('📤 Uploading schema check script...');
        await ssh.putFile('d:\\cosmodecor\\check_schema_vps.js', '/var/www/cosmodecorpk.com/check_schema_vps.js');

        console.log('🔎 Running check on VPS...');
        const result = await ssh.execCommand('node check_schema_vps.js', { cwd: '/var/www/cosmodecorpk.com' });
        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);

        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

run();
