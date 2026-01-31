import { pool } from '../db/client';

export interface Contact {
    id: number;
    name: string;
    email: string;
    subject?: string;
    message: string;
    created_at?: Date;
}

export const contactRepository = {
    async create(c: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
        const result = await pool.query(
            `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, message, created_at`,
            [c.name, c.email, c.subject, c.message]
        );
        return result.rows[0];
    },

    // For seeding
    async createWithId(c: any) {
        await pool.query(
            `INSERT INTO contacts (id, name, email, subject, message, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
            [c.id, c.name, c.email, c.subject, c.message, c.date ? new Date(c.date) : new Date()]
        );
    }
};
