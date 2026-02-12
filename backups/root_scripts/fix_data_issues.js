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

        // 1. Check Featured Products
        const featured = await ssh.execCommand('curl -s "http://localhost:5000/api/products?featured=true"');
        console.log('Featured Products API:\n' + featured.stdout);

        // 2. Check All Products
        const all = await ssh.execCommand('curl -s "http://localhost:5000/api/products?limit=5"');
        console.log('All Products API (limit 5):\n' + all.stdout);

        // 3. Reset Sequences (Correct way)
        console.log('Resetting sequences...');
        const sequenceSql = `
DO $$
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN 
        SELECT s.relname AS seqname, t.relname AS tablename, c.column_name AS colname
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON t.oid = d.refobjid
        JOIN pg_attribute c ON c.attrelid = t.oid AND c.attnum = d.refobjsubid
        WHERE s.relkind = 'S' AND t.relkind = 'r'
    LOOP
        EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 0) + 1, false)', seq.seqname, seq.colname, seq.tablename);
    END LOOP;
END $$;
`;
        await ssh.execCommand(`sudo -u postgres psql -d cosmo_decor -c ${JSON.stringify(sequenceSql)}`);
        console.log('Sequences reset.');

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
