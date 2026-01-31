import { pool } from '../db/client';

export const wishlistRepository = {
    async getByUserId(userId: string): Promise<number[]> {
        const result = await pool.query(
            `SELECT product_id FROM wishlist_items WHERE user_id = $1`,
            [userId]
        );
        // Convert DB integers (or whatever stored) to what frontend expects.
        // Frontend expects array of integers? Or strings?
        // The products.json has id: 1 (int).
        return result.rows.map(r => r.product_id);
    },

    async addToWishlist(userId: string, productId: number) {
        await pool.query(
            `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, productId]
        );
    },

    async removeFromWishlist(userId: string, productId: number) {
        await pool.query(
            `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
    }
};
