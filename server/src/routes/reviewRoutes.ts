import express from 'express';
import { pool } from '../db/client';

const router = express.Router();

// GET reviews for a product (existing)
router.get('/product/:productId', async (req, res) => {
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

// GET review token info
router.get('/token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Check if token exists in order_items and is not submitted
        const result = await pool.query(`
            SELECT oi.id, oi.product_id, oi.review_submitted, o.user_id, u.name as customer_name, p.name as product_name, p.image_url as product_image
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN products p ON oi.product_id = p.id
            WHERE oi.review_token = $1
        `, [token]);

        if (result.rows.length === 0) {
            return res.json({ valid: false, message: 'Invalid token' });
        }

        const item = result.rows[0];

        if (item.review_submitted) {
            return res.json({ valid: false, message: 'Review already submitted' });
        }

        res.json({
            valid: true,
            product: {
                id: item.product_id,
                name: item.product_name,
                image: item.product_image
            },
            reviewer_name: item.customer_name
        });

    } catch (error) {
        console.error('Check token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST submit review via token
router.post('/submit/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { rating, comment, picture_urls } = req.body;

        // 1. Verify token again
        const check = await pool.query(`
            SELECT oi.id, oi.product_id, oi.order_id, oi.review_submitted, o.user_id, u.name as customer_name, u.email as customer_email
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.user_id = u.id
            WHERE oi.review_token = $1
        `, [token]);

        if (check.rows.length === 0) return res.status(404).json({ message: 'Invalid token' });

        const item = check.rows[0];
        if (item.review_submitted) return res.status(400).json({ message: 'Already submitted' });

        // 2. Insert Review
        await pool.query('BEGIN');

        const reviewRes = await pool.query(`
            INSERT INTO reviews 
            (product_id, rating, comment, reviewer_name, reviewer_email, picture_urls, status, verified_purchase, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'approved', true, NOW())
            RETURNING *
        `, [item.product_id, rating, comment, item.customer_name, item.customer_email, picture_urls || []]);

        // 3. Mark token as used
        await pool.query(`
            UPDATE order_items 
            SET review_submitted = true 
            WHERE id = $1
        `, [item.id]);

        // 4. Update Product Stats
        await pool.query(`
            UPDATE products p
            SET 
                rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id),
                reviews = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
            WHERE id = $1
        `, [item.product_id]);

        await pool.query('COMMIT');

        res.json(reviewRes.rows[0]);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});

// Legacy POST (keep for potential backward compatibility or manual submission if needed, 
// but typically we are disabling manual submission. 
// However, existing non-token POST route should probably remain OR be disabled if user insists STRICTLY.
// User said: "REMOVE review form from product page". 
// Backend validation: "Prevent duplicate reviews". 
// I will keep the legacy route but maybe secure it? 
// Actually, I'll update the existing 'get' route to match the new path structure if needed.
// The frontend calls `fetchReviews` which hits `${API_BASE_URL}/reviews/${id}`. 
// My new code above uses `/product/${id}` for GET.
// I should make sure I don't break existing GET.

router.get('/:productId', async (req, res) => {
    // This handles GET /reviews/:id
    try {
        const { productId } = req.params;
        // Check if productId is a number (to avoid conflict with 'token' or other paths if generic)
        // But here it is /:productId.

        const result = await pool.query(
            `SELECT * FROM reviews 
             WHERE product_id = $1 AND status = 'approved' 
             ORDER BY review_date DESC`,
            [productId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});


export default router;
