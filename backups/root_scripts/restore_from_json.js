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

    const appDir = '/var/www/cosmodecorpk.com';
    const jsonPath = 'd:\\cosmodecor\\backups\\final_pre_hosting\\full_backup_2026-02-10T18-12-22-048Z.json';
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // 1. Create missing tables and columns
    const fixSchemaSql = `
      CREATE TABLE IF NOT EXISTS hero_slides (
          id SERIAL PRIMARY KEY,
          title TEXT,
          subtitle TEXT,
          description TEXT,
          image_url TEXT,
          cta_text TEXT,
          link_url TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 1000;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_position INTEGER;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS last_ordered_at TIMESTAMPTZ;

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

      CREATE TABLE IF NOT EXISTS category_product_sorting (
          category_id TEXT NOT NULL,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          sort_order INTEGER DEFAULT 1000,
          PRIMARY KEY (category_id, product_id)
      );
    `;
    await ssh.execCommand(`sudo -u postgres psql -d cosmo_decor -c "${fixSchemaSql}"`);
    console.log('Schema fixed.');

    // 2. Restore data using a helper script on VPS for speed
    // I'll upload the JSON and a small node script to import it
    await ssh.putFile(jsonPath, `${appDir}/full_backup.json`);
    console.log('JSON backup uploaded.');

    const restoreJs = `
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgres://cosmo_user:CosmoDecor2026!@localhost:5432/cosmo_decor'
});

async function restore() {
  const data = JSON.parse(fs.readFileSync('full_backup.json', 'utf8'));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SET session_replication_role = "replica"');

    const tables = ['users', 'categories', 'products', 'reviews', 'testimonials', 'orders', 'order_items', 'addresses', 'notifications', 'hero_slides', 'category_product_sorting'];

    for (const table of tables) {
      if (!data[table]) continue;
      console.log(\`Restoring \${table}...\`);
      await client.query(\`DELETE FROM \${table}\`);
      
      const rows = data[table];
      if (rows.length === 0) continue;

      const keys = Object.keys(rows[0]);
      const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
      const query = \`INSERT INTO \${table} (\${keys.join(', ')}) VALUES (\${placeholders})\`;

      for (const row of rows) {
        const values = keys.map(k => {
          const val = row[k];
          if (k === 'variations') return JSON.stringify(val);
          return val;
        });
        await client.query(query, values);
      }
    }

    await client.query('SET session_replication_role = "origin"');
    await client.query('COMMIT');
    console.log('✅ Restore successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Restore failed:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

restore();
`;

    await ssh.execCommand(`cat << 'EOF' > ${appDir}/restore_json.js
${restoreJs}
EOF`);

    console.log('Running restore script on VPS...');
    const result = await ssh.execCommand('node restore_json.js', { cwd: appDir });
    console.log('STDOUT:', result.stdout);
    console.log('STDERR:', result.stderr);

    // Restart PM2
    await ssh.execCommand('pm2 restart cosmo-decor');
    console.log('PM2 restarted.');

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
