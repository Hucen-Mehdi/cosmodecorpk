import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { heroRepository } from '../repositories/heroRepository';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', async (req, res) => {
    try {
        const slides = await heroRepository.getAll();
        res.json(slides);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch hero slides', error: error.message });
    }
});

router.put('/order', async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ message: 'Items array required' });
        await heroRepository.updateOrder(items);
        res.json({ message: 'Order updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const slide = await heroRepository.update(parseInt(req.params.id), req.body);
        res.json(slide);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update slide', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const slide = await heroRepository.create(req.body);
        res.status(201).json(slide);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create slide', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await heroRepository.delete(parseInt(req.params.id));
        res.json({ message: 'Slide deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete slide', error: error.message });
    }
});

export default router;
