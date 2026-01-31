import { pool } from '../db/client';

export interface Testimonial {
    id: number;
    name: string;
    location?: string;
    image: string;
    rating: number;
    text: string; // "message" in DB, "text" in JSON/Frontend
}

export const testimonialRepository = {
    async getAll(): Promise<Testimonial[]> {
        const result = await pool.query(`
      SELECT id, name, location, image_url as image, rating, message as text
      FROM testimonials
      ORDER BY id
    `);
        return result.rows;
    },

    async create(t: any) {
        await pool.query(
            `INSERT INTO testimonials (id, name, location, image_url, rating, message) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
            [t.id, t.name, t.location, t.image, t.rating, t.text]
        );
    }
};
