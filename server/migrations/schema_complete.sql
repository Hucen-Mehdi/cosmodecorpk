-- Full Reset Schema for Local/VPS Deployment
-- WARNING: This drops all tables!

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  badge TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  delivery_charge NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  rating INTEGER,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Processing',
  items_count INTEGER DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method TEXT,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT,
  delivery_charge NUMERIC DEFAULT 0
);

-- Addresses
CREATE TABLE addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  region TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlist_items (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
