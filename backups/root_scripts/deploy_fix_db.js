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

        // Upload server/scripts/clear-testimonials.js
        console.log('📤 Uploading updated clear-testimonials.js...');
        await ssh.putFile(
            'd:\\cosmodecor\\server\\scripts\\clear-testimonials.js',
            `${appDir}/server/scripts/clear-testimonials.js`
        );

        // Run clear script
        console.log('🧹 Clearing dummy testimonials...');
        const clearResult = await ssh.execCommand('node server/scripts/clear-testimonials.js', { cwd: appDir });

        console.log('Output from clearing script:');
        console.log(clearResult.stdout);

        if (clearResult.code !== 0) {
            console.error('❌ Failed to clear testimonials:', clearResult.stderr);
        } else {
            console.log('✅ Testimonials cleared successfully.');
        }

        ssh.dispose();
    } catch (err) {
        console.error('❌ Deployment fix failed:', err);
        process.exit(1);
    }
}

run();
