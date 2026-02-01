import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { productRepository } from '../repositories/productRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { orderRepository } from '../repositories/orderRepository';
import { notificationRepository } from '../repositories/notificationRepository';

const router = express.Router();

// All routes here require admin access
router.use(authenticateToken);
router.use(requireAdmin);

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

// Categories
router.post('/categories', async (req, res) => {
    try {
        const category = await categoryRepository.create(req.body);
        res.status(201).json(category);
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const category = await categoryRepository.update(req.params.id, req.body);
        res.json(category);
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await categoryRepository.delete(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Products
router.post('/products', async (req, res) => {
    try {
        const product = await productRepository.create(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const product = await productRepository.update(parseInt(req.params.id), req.body);
        res.json(product);
    } catch (error: any) {
        console.warn('Delete category failed:', error.message);
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

export default router;
