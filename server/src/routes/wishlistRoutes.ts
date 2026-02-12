import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { wishlistRepository } from '../repositories/wishlistRepository';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const items = await wishlistRepository.getByUserId(userId);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
    }
});

// Add item to wishlist
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const item = await wishlistRepository.add(userId, productId);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
    }
});

// Remove item from wishlist
router.delete('/:productId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const productId = parseInt(req.params.productId as string);

        await wishlistRepository.remove(userId, productId);
        res.json({ message: 'Item removed from wishlist' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
    }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const productId = parseInt(req.params.productId as string);

        const exists = await wishlistRepository.exists(userId, productId);
        res.json({ inWishlist: exists });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to check wishlist', error: error.message });
    }
});

export default router;
