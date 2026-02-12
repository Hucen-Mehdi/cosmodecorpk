import express from 'express';
import { authenticateToken, AuthRequest, optionalAuth } from '../middleware/auth';
import { orderRepository } from '../repositories/orderRepository';
import { pool } from '../db/client'; // for counting?

const router = express.Router();

// GET /api/orders/track
router.get('/track', async (req: any, res) => {
    const { orderNumber, email } = req.query;

    if (!orderNumber || !email) {
        return res.status(400).json({ message: 'Order number and email are required' });
    }

    try {
        const order = await orderRepository.findByOrderNumberAndEmail(String(orderNumber), String(email));
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({ message: 'Failed to track order' });
    }
});

// GET /api/orders/my
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const orders = await orderRepository.findByUserId(req.user.id);
        res.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// POST /api/orders
router.post('/', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const {
            items, subtotal, shipping, total,
            paymentMethod, shippingName, shippingEmail, shippingPhone,
            shippingAddress, shippingCity, shippingPostalCode, shippingNotes
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }

        const userId = req.user?.id || null;
        const isGuest = !userId;

        // Generate Order Number
        const countRes = await pool.query('SELECT COUNT(*) FROM orders');
        const count = parseInt(countRes.rows[0].count, 10);
        const nextNum = (count + 1).toString().padStart(4, '0');
        const orderNumber = `ORD-${new Date().getFullYear()}${nextNum}`;

        const newOrder = await orderRepository.create({
            id: Date.now().toString(),
            orderNumber,
            userId: userId as string, // Type assertion, repo needs update to allow null
            isGuest,
            guestEmail: isGuest ? shippingEmail : undefined,
            date: new Date().toISOString(),
            status: paymentMethod === 'cod' ? "Confirmed" : "Processing",
            items: items.map((i: any) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image,
                deliveryCharge: i.deliveryCharge,
                selectedVariations: i.selectedVariations || {}
            })),
            itemsCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
            subtotal,
            shipping,
            total,
            paymentMethod,
            shippingName,
            shippingEmail,
            shippingPhone,
            shippingAddress,
            shippingCity,
            shippingPostalCode,
            shippingNotes
        });

        res.status(201).json(newOrder);
    } catch (error: any) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to place order', details: error.message });
    }
});

export default router;
