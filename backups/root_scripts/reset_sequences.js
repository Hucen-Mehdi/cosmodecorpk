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

        const sql = `
DO $$
DECLARE
    seq_name TEXT;
    table_name TEXT;
    column_name TEXT;
    max_id BIGINT;
BEGIN
    FOR seq_name, table_name, column_name IN
        SELECT s.relname, t.relname, c.column_name
        FROM information_schema.columns c
        JOIN pg_class t ON t.relname = c.table_name
        JOIN pg_namespace pgt ON pgt.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attname = c.column_name
        JOIN pg_attrdef ad ON ad.adrelid = t.oid AND ad.adnum = a.attnum
        JOIN pg_class s ON s.relname = substring(ad.adbin from 'nextval\\(''([^'']+)''::regclass\\)')::regclass::text
        WHERE c.column_default LIKE 'nextval%'
        AND t.relkind = 'r'
        AND pgt.schemaname = 'public'
    LOOP
        EXECUTE format('SELECT COALESCE(MAX(%I), 0) + 1 FROM %I', column_name, table_name) INTO max_id;
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH %s', seq_name, max_id);
    END LOOP;
END $$;
`;
        const res = await ssh.execCommand(`sudo -u postgres psql -d cosmo_decor -c "${sql.replace(/"/g, '\\"')}"`);
        console.log('Result:', res.stdout, res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
