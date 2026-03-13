import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 📂 Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prod-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// All routes require admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * 🔍 GET /api/migration/status
 * Returns a list of products that still have Cloudinary URLs
 */
router.get('/status', async (req, res) => {
    try {
        // Products
        const { rows } = await pool.query(`
            SELECT id, name, image_url as "imageUrl", additional_images as "additionalImages"
            FROM products
            WHERE (image_url IS NOT NULL AND image_url !~ '^/(uploads|api)')
               OR (additional_images::text LIKE '%http%')
            ORDER BY id ASC
        `);

        // Collections
        const categoriesResult = await pool.query(`
            SELECT id::text, name, image_url as "imageUrl"
            FROM collections
            WHERE image_url IS NOT NULL AND image_url !~ '^/(uploads|api)'
            ORDER BY name ASC
        `);

        // Hero Slides
        const heroResult = await pool.query(`
            SELECT id::text, title as name, image_url as "imageUrl"
            FROM hero_slides
            WHERE image_url IS NOT NULL AND image_url !~ '^/(uploads|api)'
            ORDER BY id ASC
        `);

        res.json({
            count: rows.length + categoriesResult.rows.length + heroResult.rows.length,
            products: rows,
            categories: categoriesResult.rows,
            heroSlides: heroResult.rows
        });
    } catch (error: any) {
        console.error('Migration status error:', error);
        res.status(500).json({ message: 'Error fetching migration status', error: error.message });
    }
});

/**
 * 📤 POST /api/migration/upload
 * Uploads a replacement image and updates the database
 */
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { productId, field, index, type = 'product' } = req.body;
        const file = req.file;

        if (!productId || !field || !file) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newUrl = `/uploads/products/${file.filename}`;

        if (type === 'category') {
            await pool.query('UPDATE collections SET image_url = $1 WHERE id = $2', [newUrl, productId]);
        } else if (type === 'hero') {
            await pool.query('UPDATE hero_slides SET image_url = $1 WHERE id = $2', [newUrl, parseInt(productId)]);
        } else {
            // Handle product
            if (field === 'imageUrl') {
                await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [newUrl, productId]);
            } else if (field === 'additionalImages') {
                const idx = parseInt(index);
                const { rows } = await pool.query('SELECT additional_images FROM products WHERE id = $1', [productId]);
                const currentImages = rows[0]?.additional_images || [];
                
                if (isNaN(idx)) {
                    // Append if index not provided
                    currentImages.push(newUrl);
                } else {
                    currentImages[idx] = newUrl;
                }

                await pool.query('UPDATE products SET additional_images = $1 WHERE id = $2', [currentImages, productId]);
            }
        }

        res.json({
            message: 'Image updated successfully',
            newUrl,
            productId,
            field
        });
    } catch (error: any) {
        console.error('Migration upload error:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

/**
 * 🗑️ POST /api/migration/bulk-update-urls
 * Helper to replace all occurrences of a string in URLs (if they were partially migrated)
 */
router.post('/bulk-fix', async (req, res) => {
    try {
        const { search, replace } = req.body;
        if (!search || !replace) return res.status(400).json({ message: 'Search and replace strings required' });

        await pool.query(`
            UPDATE products 
            SET image_url = REPLACE(image_url, $1, $2)
            WHERE image_url LIKE $3
        `, [search, replace, `%${search}%`]);

        // Note: Replacing inside JSONB array is harder, but this is a start
        
        res.json({ message: 'Bulk update triggered' });
    } catch (error: any) {
        res.status(500).json({ message: 'Bulk update failed', error: error.message });
    }
});

export default router;
