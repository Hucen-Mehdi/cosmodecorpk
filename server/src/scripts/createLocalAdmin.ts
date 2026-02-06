import { pool } from '../db/client';
import bcrypt from 'bcryptjs';

const createLocalAdmin = async () => {
    console.log('👤 Creating Local Admin...');
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await pool.query(`
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $4, role = 'admin'
        `, ['1', 'Local Admin', 'admin@cosmodecor.pk', hashedPassword, 'admin']);

        console.log('✅ Local Admin Created: admin@cosmodecor.pk / admin123');
    } catch (err) {
        console.error('❌ Admin Creation Failed:', err);
    } finally {
        await pool.end();
    }
};

createLocalAdmin();
