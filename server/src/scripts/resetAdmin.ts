import { pool } from '../db/client';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
    console.log('🔄 Starting Admin Reset...');

    try {
        const client = await pool.connect();

        // 1. Define Admin Credentials
        const email = 'admin@cosmodecor.pk';
        const password = 'admin123';
        const name = 'Admin User';

        // 2. Hash Password
        console.log('🔒 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Upsert Admin User
        console.log('👤 Updating Admin User in Database...');

        // Check if exists first (for debugging)
        const checkRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('Found existing admin, updating...');
        } else {
            console.log('Creating new admin user...');
        }

        const query = `
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES ('1', $1, $2, $3, 'admin')
            ON CONFLICT (email) DO UPDATE 
            SET name = $1,
                password_hash = $3,
                role = 'admin'
            RETURNING id, email, role;
        `;

        const res = await client.query(query, [name, email, passwordHash]);

        console.log('✅ Admin Reset Successful:', res.rows[0]);

        // 4. Verify Immediate Login (Simulate)
        console.log('🧪 Verifying login capability...');
        const verifyRes = await client.query('SELECT password_hash FROM users WHERE email = $1', [email]);
        const storedHash = verifyRes.rows[0].password_hash;
        const isMatch = await bcrypt.compare(password, storedHash);

        if (isMatch) {
            console.log('🎉 Verification PASSED: Password matches hash.');
        } else {
            console.error('❌ Verification FAILED: Password does not match hash!');
        }

        client.release();
    } catch (error) {
        console.error('❌ Admin Reset Failed:', error);
    } finally {
        pool.end();
    }
};

resetAdmin();
