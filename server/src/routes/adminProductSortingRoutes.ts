
import express from 'express';
import { productRepository } from '../repositories/productRepository';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Apply admin auth to all routes in this router
router.use(authenticateToken, requireAdmin);

// Bulk update positions
router.put('/sort-order', async (req, res) => {
    try {
        const { items, categoryId } = req.body; // Expecting { id: number, position: number }[], optional categoryId
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Items array is required' });
        }
        await productRepository.updateSortOrder(items, categoryId ? String(categoryId) : undefined);
        res.json({ message: 'Sort order updated successfully' });
    } catch (error: any) {
        console.error('Error updating sort order:', error);
        res.status(500).json({ message: 'Failed to update sort order', details: error.message });
    }
});

// Toggle featured status
router.put('/:id/feature', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { isFeatured } = req.body;

        if (isNaN(id) || typeof isFeatured !== 'boolean') {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        const updatedProduct = await productRepository.toggleFeatured(id, isFeatured);
        res.json(updatedProduct);
    } catch (error: any) {
        console.error('Error toggling featured status:', error);
        res.status(500).json({ message: 'Failed to update featured status', details: error.message });
    }
});

// Get products for sorting UI (alias to getAll with specific sort)
router.get('/sorting-queue', async (req, res) => {
    try {
        const { category } = req.query;
        // Fetch all products, sorted by current sort_order
        const products = await productRepository.getAll({
            category: category ? String(category) : undefined,
            sortBy: 'manual'
        });
        res.json(products);
    } catch (error: any) {
        console.error('Error fetching sorting queue:', error);
        res.status(500).json({ message: 'Failed to fetch sorting queue', details: error.message });
    }
});

export default router;
