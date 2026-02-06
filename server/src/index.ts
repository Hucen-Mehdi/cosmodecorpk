// railway-trigger
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import { productRepository } from './repositories/productRepository';
import reviewRoutes from './routes/reviewRoutes';
import { testimonialRepository } from './repositories/testimonialRepository';
import { contactRepository } from './repositories/contactRepository';
import { categoryRepository } from './repositories/categoryRepository';
import { pool } from './db/client';
import { PORT } from './config';
import { createProxyMiddleware } from 'http-proxy-middleware';

console.log("🔥 ACTIVE ENTRY FILE: server/src/index.ts");

// 🛡️ Prevent Server Crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
});

const app = express();

// 🎯 SIMPLE PROXY: /api → backend, everything else → Next.js
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Go to backend API routes
  }
  return frontendProxy(req, res, next); // Everything else → Next.js
});

// Middleware
app.use(cors({
  origin: [
    'https://*.ngrok-free.dev',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

// ️ 2. NON-FATAL ASYNC DB CHECK
const checkDatabase = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ Database connectivity verified at:", res.rows[0].now);

    // 🛠️ AUTO-MIGRATION: Add variations column if missing
    try {
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'
      `);

      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}'
      `);

      await pool.query(`
        UPDATE products 
        SET category_ids = ARRAY[category_id] 
        WHERE category_id IS NOT NULL 
        AND (category_ids IS NULL OR array_length(category_ids, 1) IS NULL)
      `);

      await pool.query(`
        ALTER TABLE order_items 
        ADD COLUMN IF NOT EXISTS selected_variations JSONB DEFAULT '{}'
      `);
      console.log("✅ Migration: 'variations', 'category_ids', and 'selected_variations' columns verified/added.");
    } catch (migErr) {
      console.error("⚠️ Migration failed (non-critical):", migErr);
    }
  } catch (err: any) {
    console.error("❌ DATABASE DELAYED/FAILED:", err.message);
    console.warn("Server will remain active to provide logs and satisfy health checks.");
  }
};
checkDatabase();

// 🚀 Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Ngrok command: ngrok http ${PORT} --region eu`);
  console.log(`📢 After starting ngrok, share the https://*.ngrok-free.dev URL`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Search endpoint as requested
app.get('/api/products/search', async (req: Request, res: Response) => {
  try {
    const { q, category, sort } = req.query;
    const products = await productRepository.getAll({
      category: category ? String(category) : undefined,
      search: q ? String(q) : undefined
    });

    // Simple sorting logic if sort param is provided
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    }

    // Limit to matching the requirement
    const limitedResults = products.slice(0, 20);

    // Get unique categories for the filters
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
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, subcategory, search } = req.query;
    const products = await productRepository.getAll({
      category: category ? String(category) : undefined,
      subcategory: subcategory ? String(subcategory) : undefined,
      search: search ? String(search) : undefined
    });
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await productRepository.getById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
    if (!name || !email || !message) return res.status(400).json({ message: 'Required fields missing' });
    const newContact = await contactRepository.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully!', id: newContact.id });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Failed to save message' });
  }
});
