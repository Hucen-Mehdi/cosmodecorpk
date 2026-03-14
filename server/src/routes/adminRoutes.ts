import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { productRepository } from '../repositories/productRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { orderRepository } from '../repositories/orderRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { pool } from '../db/client';

const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { folder = 'general' } = req.body;
        const uploadPath = path.join(__dirname, '../../..', 'public', 'uploads', folder);
        
        // Ensure folder exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only images (jpg, png, webp) are allowed'));
    }
});

// All routes here require admin access 
router.use(authenticateToken);
router.use(requireAdmin);

// Upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const folder = req.body.folder || 'general';
        const fileUrl = `/uploads/${folder}/${req.file.filename}`;
        
        res.json({ 
            url: fileUrl,
            message: 'File uploaded successfully'
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const products = await productRepository.getAll({});
        const categories = await categoryRepository.getAll();
        const orders = await orderRepository.getAll();

        const totalRevenue = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        const statusCounts = orders.reduce((acc: any, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        const recentOrders = orders.slice(0, 10);

        res.json({
            productCount: products.length,
            categoryCount: categories.length,
            orderCount: orders.length,
            totalRevenue,
            statusCounts,
            recentOrders
        });
    } catch (error: any) {
        console.error('Stats error details:', error);
        res.status(500).json({ message: 'Error fetching stats', details: error.message, stack: error.stack });
    }
});

// Collections (Admin)
router.get('/collections', async (req, res) => {
    try {
        const includeDeleted = req.query.include_deleted === 'true';
        const collections = await categoryRepository.getAll(includeDeleted);
        res.json(collections);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching collections' });
    }
});

router.post('/collections', async (req, res) => {
    try {
        const collection = await categoryRepository.create(req.body);
        res.status(201).json(collection);
    } catch (error: any) {
        console.warn('Create collection failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put('/collections/:id', async (req, res) => {
    try {
        const collection = await categoryRepository.update(req.params.id, req.body);
        res.json(collection);
    } catch (error: any) {
        console.warn('Update collection failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/collections/:id', async (req, res) => {
    try {
        const hardDelete = req.query.permanent === 'true' || true;
        await categoryRepository.delete(req.params.id, hardDelete);
        res.status(204).send();
    } catch (error: any) {
        console.warn('Delete collection failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put('/collections/:id/products', async (req, res) => {
    try {
        const { productIds } = req.body;
        const collectionId = req.params.id;
        await productRepository.updateCategoryProducts(collectionId, productIds || []);
        res.json({ message: 'Collection products updated successfully' });
    } catch (error: any) {
        console.error('Update collection products failed:', error);
        res.status(500).json({ message: error.message });
    }
});

// Aliases for backward compatibility
router.get('/categories', (req, res) => res.redirect(301, '/api/admin/collections'));
router.post('/categories', (req, res) => res.redirect(307, '/api/admin/collections'));
router.put('/categories/:id', (req, res) => res.redirect(307, `/api/admin/collections/${req.params.id}`));
router.delete('/categories/:id', (req, res) => res.redirect(307, `/api/admin/collections/${req.params.id}`));
router.put('/categories/:id/products', (req, res) => res.redirect(307, `/api/admin/collections/${req.params.id}/products`));


// Products
router.post('/products', async (req, res) => {
    try {
        const product = await productRepository.create(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        console.warn('Create product failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle category_id mapping as requested
        if (updateData.category_id) {
            // Validate category exists
            const categoryExists = await categoryRepository.getById(updateData.category_id);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category_id: Category does not exist' });
            }
            updateData.category = updateData.category_id;
            // We keep category_id or delete it? repo uses 'category'.
        }

        const product = await productRepository.update(parseInt(req.params.id), updateData);
        res.json(product);
    } catch (error: any) {
        console.warn('Update product failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await productRepository.delete(parseInt(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await orderRepository.getAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });

        await orderRepository.updateStatus(req.params.id, status);
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        await orderRepository.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

// Notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await notificationRepository.getAdminNotifications();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

router.post('/notifications/:id/read', async (req, res) => {
    try {
        await notificationRepository.markAsRead(parseInt(req.params.id));
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

// Reviews
router.get('/reviews', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, p.name as product_name, p.image_url as product_image
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.review_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

router.delete('/reviews/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;

        // delete review and get product_id to update stats
        const deleteResult = await pool.query(
            'DELETE FROM reviews WHERE id = $1 RETURNING product_id',
            [reviewId]
        );

        if (deleteResult.rows.length > 0) {
            const productId = deleteResult.rows[0].product_id;

            // Recalculate stats for the product
            await pool.query(`
                UPDATE products p
                SET 
                    rating = COALESCE((SELECT AVG(rating)::numeric(3,1) FROM reviews r WHERE r.product_id = p.id AND status = 'approved'), 0),
                    reviews = (SELECT COUNT(*)::int FROM reviews r WHERE r.product_id = p.id AND status = 'approved')
                WHERE id = $1
            `, [productId]);
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Error deleting review' });
    }
});

export default router;
