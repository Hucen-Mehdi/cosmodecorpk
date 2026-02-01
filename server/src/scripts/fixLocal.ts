import { pool } from '../db/client';
import bcrypt from 'bcryptjs';

const fixLocal = async () => {
    try {
        console.log('🔧 Fixing Local Database...');

        await pool.query('BEGIN');

        // 1. Clear Default Products (User wanted them gone)
        console.log('🗑️ Clearing all products...');
        await pool.query('DELETE FROM products');

        // 2. Fix Admin User
        console.log('👤 Resetting Admin User...');
        const email = 'admin@cosmodecor.pk';
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        await pool.query(`
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES ('admin-001', 'Admin', $1, $2, 'admin')
            ON CONFLICT (email) DO UPDATE 
            SET role = 'admin', password_hash = $2
        `, [email, hash]);

        await pool.query('COMMIT');
        console.log('✅ Local Database Fixed!');
        console.log('👉 Products cleared (Ready for you to add your own)');
        console.log(`👉 Admin User: ${email}`);
        console.log(`👉 Password: ${password}`);

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('❌ Error fixing local DB:', err);
    } finally {
        await pool.end();
    }
};

fixLocal();
