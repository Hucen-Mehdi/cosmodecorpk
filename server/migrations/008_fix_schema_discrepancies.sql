-- Align schema with database_backup.sql

-- 1. Update categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Update products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';

-- 3. Update orders table (ensure it matches backup)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_email TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_notes TEXT;

-- 4. Update order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS selected_variations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS item_delivery_charge NUMERIC(10,2) DEFAULT 200.00;

-- 5. Reviews table (if not exists)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(100),
    review_date TIMESTAMP DEFAULT NOW(),
    picture_urls TEXT[],
    verified_purchase BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT NOW()
);
