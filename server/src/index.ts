import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';

import { productRepository } from './repositories/productRepository';
import { categoryRepository } from './repositories/categoryRepository';
import { testimonialRepository } from './repositories/testimonialRepository';
import { contactRepository } from './repositories/contactRepository';
import { pool } from './db/client';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

console.log("�️ Starting Backend Diagnostics...");
console.log("📂 Working Directory:", process.cwd());
console.log("🔑 Checking Environment Variables:");
console.log("   - DATABASE_URL:", process.env.DATABASE_URL ? "✅ Present" : "❌ MISSING");
console.log("   - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Present" : "❌ MISSING (Using fallback if not set)");
console.log("   - PORT:", process.env.PORT || "5000 (Default)");

// 🛑 Test DB connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("❌ DATABASE ERROR:", err.message);
        console.error("Please verify your DATABASE_URL and ensure your IP is whitelisted if using external Postgres.");
        // We DON'T exit(1) immediately here anymore so the server can at least 
        // answer Railway's health check and provide logs.
    } else {
        console.log("✅ Database connectivity verified at:", res.rows[0].now);
    }
});



// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// 🩺 HEALTH CHECK (For Railway Deployment)
app.get('/', (_req: Request, res: Response) => {
    res.status(200).send('🚀 Backend is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Products
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
        const id = Number(req.params.id);
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

// Categories
app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
        const categories = await categoryRepository.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Testimonials
app.get('/api/testimonials', async (_req: Request, res: Response) => {
    try {
        const testimonials = await testimonialRepository.getAll();
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Contact
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

// 🚀 START SERVER (Railway-safe)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
