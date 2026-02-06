import express from 'express';
import { pool } from '../db/client';

const router = express.Router();

// GET reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await pool.query(
            `SELECT * FROM reviews 
             WHERE product_id = $1 AND status = 'approved' 
             ORDER BY review_date DESC`,
            [productId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// POST a new review
router.post('/', async (req, res) => {
    try {
        const { product_id, rating, comment, reviewer_name, reviewer_email, picture_urls } = req.body;

        if (!product_id || !rating || !reviewer_name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await pool.query(`
            INSERT INTO reviews 
            (product_id, rating, comment, reviewer_name, reviewer_email, picture_urls, status, verified_purchase)
            VALUES ($1, $2, $3, $4, $5, $6, 'approved', false)
            RETURNING *
        `, [product_id, rating, comment, reviewer_name, reviewer_email, picture_urls || []]);

        // Update product stats
        await pool.query(`
            UPDATE products p
            SET 
                rating = (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id),
                reviews = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
            WHERE id = $1
        `, [product_id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

export default router;
