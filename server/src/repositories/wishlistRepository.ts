import { pool } from '../db/client';
import { Product } from './productRepository';

export const wishlistRepository = {
    async getByUserId(userId: string): Promise<Product[]> {
        const result = await pool.query(`
            SELECT p.id, p.name, p.price, p.original_price as "originalPrice", 
                   p.image_url as image, p.category_id as category, 
                   p.category_ids as "categoryIds", p.subcategory, p.rating, 
                   p.reviews, p.badge, p.description, p.stock, 
                   p.delivery_charge as "deliveryCharge", p.variations, 
                   p.additional_images as "additionalImages",
                   p.sort_order as "sortOrder", p.is_featured as "isFeatured", 
                   p.sales_count as "salesCount"
            FROM wishlist_items w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
        `, [userId]);

        return result.rows.map(row => ({
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0),
            additionalImages: row.additionalImages || [],
            categoryIds: row.categoryIds || [row.category].filter(Boolean)
        }));
    },

    async add(userId: string, productId: number) {
        const result = await pool.query(`
            INSERT INTO wishlist_items (user_id, product_id, created_at) 
            VALUES ($1, $2, NOW()) 
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `, [userId, productId]);
        return result.rows[0];
    },

    async remove(userId: string, productId: number) {
        await pool.query(
            `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
    },

    async exists(userId: string, productId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
        return result.rows.length > 0;
    }
};
