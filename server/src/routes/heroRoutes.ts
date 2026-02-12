import express from 'express';
import { heroRepository } from '../repositories/heroRepository';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const slides = await heroRepository.getAll();
        res.json(slides);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch hero slides', error: error.message });
    }
});

export default router;
