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

async function resetUserPassword() {
    try {
        const email = 'hussainmehdi311@gmail.com';
        const newPassword = 'admin';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await pool.query(
            `UPDATE users SET password_hash = $1, role = 'admin' WHERE email = $2 RETURNING id, name, email, role`,
            [hashedPassword, email]
        );

        if (res.rowCount > 0) {
            console.log(`✅ Password reset successfully for ${email}`);
            console.log(`🔑 New Password: ${newPassword}`);
            console.log(`👑 Role set to: ${res.rows[0].role}`);
        } else {
            console.log(`⚠️ User ${email} not found.`);
        }
    } catch (err) {
        console.error('❌ Error resetting password:', err);
    } finally {
        await pool.end();
    }
}

resetUserPassword();
