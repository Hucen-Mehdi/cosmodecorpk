import { pool } from '../db/client';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash?: string; // Optional because we might not select it, or map it from password_hash
    role: string;
    firstName?: string;
    phone?: string;
}

export const userRepository = {
    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT id, name, email, password_hash as "passwordHash", role, first_name as "firstName", phone FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    },

    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT id, name, email, password_hash as "passwordHash", role, first_name as "firstName", phone FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create(user: { id?: string; name: string; email: string; passwordHash: string; role?: string; firstName?: string; phone?: string }): Promise<User> {
        // If id is provided (e.g. seed), use it, else let DB generate UUID if we used UUID. 
        // But we defined ID as TEXT without default gen_random_uuid() in standard postgres unless pgcrypto is on.
        // The prompt says "id (primary key, UUID or serial/int)". 
        // In my migration I used: id TEXT PRIMARY KEY.
        // So I MUST provide an ID or change schema to default gen_random_uuid().
        // I'll generate a UUID here or use Date.now().toString() as the legacy code did for some things, but UUID is better.
        // However, for consistency with migration, I'll generate one if not provided.
        // The existing code used `Date.now()` string for users (e.g. "1769708521384").
        // I'll stick to that if not provided, or better, use crypto.randomUUID() if available (Node 19+ or import).

        // Simplest: use Date.now().toString() if not passed, to match legacy style, 
        // OR just use a random string.

        const id = user.id || Date.now().toString();
        const role = user.role || 'user';

        const result = await pool.query(
            `INSERT INTO users (id, name, email, password_hash, role, first_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, password_hash as "passwordHash", role, first_name as "firstName", phone`,
            [id, user.name, user.email, user.passwordHash, role, user.firstName, user.phone]
        );
        return result.rows[0];
    }
};
