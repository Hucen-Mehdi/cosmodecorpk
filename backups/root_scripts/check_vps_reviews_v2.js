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

        // Script to check reviews in VPS DB using .env
        const checkScript = `
        const { Pool } = require('pg');
        require('dotenv').config({ path: '/var/www/cosmodecorpk.com/.env' });
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        async function check() {
            try {
                console.log('DB URL:', process.env.DATABASE_URL);
                const res = await pool.query('SELECT COUNT(*) FROM reviews');
                console.log('Total Reviews:', res.rows[0].count);
                if (res.rows[0].count > 0) {
                    const sample = await pool.query('SELECT * FROM reviews LIMIT 1');
                    console.log('Sample:', sample.rows[0]);
                }
            } catch(e) { console.error(e); }
            finally { pool.end(); }
        }
        check();
        `;

        await ssh.execCommand('cat > /var/www/cosmodecorpk.com/check_vps_reviews_env.js <<EOF\n' + checkScript + '\nEOF');

        console.log('🔎 Running check on VPS...');
        const result = await ssh.execCommand('node check_vps_reviews_env.js', { cwd: '/var/www/cosmodecorpk.com' });
        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);

        ssh.dispose();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

run();
