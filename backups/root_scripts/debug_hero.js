const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    try {
        const privateKeyPath = 'C:\\Users\\ARC\\.ssh\\id_ed25519';
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

        await ssh.connect({
            host: '72.61.214.54',
            username: 'root',
            privateKey: privateKey,
        });
        console.log('Connected!');

        // 1. Check tables
        const tables = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -c "\\dt"');
        console.log('Tables:\n' + tables.stdout);

        // 2. Check hero_slides data
        const heroData = await ssh.execCommand('sudo -u postgres psql -d cosmo_decor -c "SELECT * FROM hero_slides"');
        console.log('Hero Slides Data:\n' + heroData.stdout);

        // 3. Test API locally on VPS
        const apiRes = await ssh.execCommand('curl -s http://localhost:5000/api/hero');
        console.log('API Response (/api/hero):\n' + apiRes.stdout);

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
