const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: 'localhost',
        port: 5432,
        database: 'cosmodecorpk',
        user: 'postgres',
        password: 'postgres'
    });

async function resetAdmin() {
    try {
        const email = 'admin@cosmodecor.pk';
        const newPassword = 'admin';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await pool.query(
            `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email`,
            [hashedPassword, email]
        );

        if (res.rowCount > 0) {
            console.log(`✅ Admin password reset successfully for ${email}`);
            console.log(`🔑 New Password: ${newPassword}`);
        } else {
            console.log(`⚠️ Admin user ${email} not found. Creating one...`);
            await pool.query(`
                INSERT INTO users (id, name, email, password_hash, role, first_name)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                Date.now().toString(),
                'Admin User',
                email,
                hashedPassword,
                'admin',
                'Admin'
            ]);
            console.log(`✅ Admin user created: ${email} / ${newPassword}`);
        }
    } catch (err) {
        console.error('❌ Error resetting admin:', err);
    } finally {
        await pool.end();
    }
}

resetAdmin();
