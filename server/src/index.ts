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
import productRoutes from './routes/productRoutes';
import adminProductSortingRoutes from './routes/adminProductSortingRoutes';
import adminHeroRoutes from './routes/adminHeroRoutes';
import heroRoutes from './routes/heroRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import { testimonialRepository } from './repositories/testimonialRepository';
import { contactRepository } from './repositories/contactRepository';
import { categoryRepository } from './repositories/categoryRepository';
import { pool } from './db/client';
import { PORT } from './config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';

console.log("🔥 ACTIVE ENTRY FILE: server/src/index.ts");

// 💾 AUTO-BACKUP LOGIC
const runDailyBackup = async () => {
  try {
    const backupDir = path.join(process.cwd(), 'server', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const today = new Date().toISOString().split('T')[0];
    const dailyBackupFile = path.join(backupDir, `auto_backup_${today}.json`);

    if (!fs.existsSync(dailyBackupFile)) {
      console.log(`💾 Starting automatic daily backup for ${today}...`);
      const tables = ['users', 'categories', 'products', 'reviews', 'testimonials', 'orders', 'order_items', 'addresses', 'notifications'];
      const fullData: any = {};

      for (const table of tables) {
        const { rows } = await pool.query(`SELECT * FROM ${table}`);
        fullData[table] = rows;
      }

      fs.writeFileSync(dailyBackupFile, JSON.stringify(fullData, null, 2));
      console.log(`✅ Auto-backup completed: ${dailyBackupFile}`);
    }
  } catch (err) {
    console.error("⚠️ Auto-backup failed:", err);
  }
};

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
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

// ️ 2. NON-FATAL ASYNC DB CHECK
const checkDatabase = async () => {
  await runDailyBackup(); // Run auto-backup on startup
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

});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/product-sorting', adminProductSortingRoutes);
app.use('/api/admin/hero', adminHeroRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);

app.get('/api', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
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
