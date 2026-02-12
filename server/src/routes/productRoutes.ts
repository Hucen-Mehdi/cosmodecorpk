
import express from 'express';
import { productRepository } from '../repositories/productRepository';
import { categoryRepository } from '../repositories/categoryRepository';

const router = express.Router();

// Search endpoint
router.get('/search', async (req, res) => {
    try {
        const { q, category, sort } = req.query;
        // Use the new getAll with sort param directly if possible, or keep existing logic
        // The repository now supports sortBy in getAll options.
        const products = await productRepository.getAll({
            category: category ? String(category) : undefined,
            search: q ? String(q) : undefined,
            sortBy: sort ? String(sort) : undefined
        });

        const limitedResults = products.slice(0, 20);
        const allCategories = await categoryRepository.getAll();
        const categoriesNames = allCategories.map(c => c.name);

        res.json({
            products: limitedResults,
            total: products.length,
            categories: categoriesNames
        });
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search temporarily unavailable', details: error.message });
    }
});

// General products endpoint
router.get('/', async (req, res) => {
    try {
        const { category, subcategory, search, sort, featured, limit } = req.query;
        const products = await productRepository.getAll({
            category: category ? String(category) : undefined,
            subcategory: subcategory ? String(subcategory) : undefined,
            search: search ? String(search) : undefined,
            sortBy: sort ? String(sort) : undefined,
            featured: featured === 'true',
            limit: limit ? Number(limit) : undefined
        });
        res.json(products);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

        const product = await productRepository.getById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
