import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';

// Load env if not loaded (client.ts does it too, but safe here)
dotenv.config();

// Import repositories
import { productRepository } from './repositories/productRepository';
import { categoryRepository } from './repositories/categoryRepository';
import { testimonialRepository } from './repositories/testimonialRepository';
import { contactRepository } from './repositories/contactRepository';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in development to support mobile testing via IP
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Product Routes
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const { category, subcategory, search } = req.query;
        const products = await productRepository.getAll({
            category: category ? String(category) : undefined,
            subcategory: subcategory ? String(subcategory) : undefined,
            search: search ? String(search) : undefined
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const product = await productRepository.getById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/categories', async (req: Request, res: Response) => {
    try {
        const categories = await categoryRepository.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/testimonials', async (req: Request, res: Response) => {
    try {
        const testimonials = await testimonialRepository.getAll();
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/contact', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }

        const newContact = await contactRepository.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({ message: 'Message sent successfully!', id: newContact.id });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Failed to save message' });
    }
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
