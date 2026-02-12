import { pool } from '../db/client';

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image_url: string;
    cta_text: string;
    link_url: string;
    order_index: number;
    created_at?: string;
}

export const heroRepository = {
    async getAll(): Promise<HeroSlide[]> {
        const result = await pool.query(`
            SELECT * FROM hero_slides 
            ORDER BY order_index ASC, id ASC
        `);
        return result.rows;
    },

    async update(id: number, data: Partial<HeroSlide>): Promise<HeroSlide> {
        const { title, subtitle, description, image_url, cta_text, link_url, order_index } = data;
        const result = await pool.query(`
            UPDATE hero_slides
            SET title = COALESCE($1, title),
                subtitle = COALESCE($2, subtitle),
                description = COALESCE($3, description),
                image_url = COALESCE($4, image_url),
                cta_text = COALESCE($5, cta_text),
                link_url = COALESCE($6, link_url),
                order_index = COALESCE($7, order_index)
            WHERE id = $8
            RETURNING *
        `, [title, subtitle, description, image_url, cta_text, link_url, order_index, id]);

        if (result.rows.length === 0) throw new Error('Slide not found');
        return result.rows[0];
    },

    async create(data: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
        const { title, subtitle, description, image_url, cta_text, link_url, order_index } = data;
        const result = await pool.query(`
            INSERT INTO hero_slides (title, subtitle, description, image_url, cta_text, link_url, order_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [title, subtitle, description, image_url, cta_text, link_url, order_index]);
        return result.rows[0];
    },

    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM hero_slides WHERE id = $1', [id]);
    },

    async updateOrder(items: { id: number; order_index: number }[]): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const item of items) {
                await client.query('UPDATE hero_slides SET order_index = $1 WHERE id = $2', [item.order_index, item.id]);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};
