-- 1. Enable RLS on all tables (Safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (Fixes "policy already exists" error)
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users Read Own Data" ON users;
DROP POLICY IF EXISTS "Users Update Own Data" ON users;
DROP POLICY IF EXISTS "Users Read Own Addresses" ON addresses;
DROP POLICY IF EXISTS "Users Manage Own Addresses" ON addresses;
DROP POLICY IF EXISTS "Users Read Own Orders" ON orders;
DROP POLICY IF EXISTS "Users Create Orders" ON orders;
DROP POLICY IF EXISTS "Users Read Own Order Items" ON order_items;
DROP POLICY IF EXISTS "Users Create Order Items" ON order_items;
DROP POLICY IF EXISTS "Users Read Own Notifications" ON notifications;
DROP POLICY IF EXISTS "Users Manage Wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Public Insert Contact" ON contacts;

-- 3. RE-CREATE POLICIES

-- Public Read Policies
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);

-- Authenticated User Policies
-- Users table
CREATE POLICY "Users Read Own Data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users Update Own Data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Addresses
CREATE POLICY "Users Read Own Addresses" ON addresses FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users Manage Own Addresses" ON addresses FOR ALL USING (auth.uid()::text = user_id);

-- Orders
CREATE POLICY "Users Read Own Orders" ON orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users Create Orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Order Items
CREATE POLICY "Users Read Own Order Items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
);
CREATE POLICY "Users Create Order Items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
);

-- Notifications
CREATE POLICY "Users Read Own Notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id);

-- Wishlists
CREATE POLICY "Users Manage Wishlist" ON wishlist_items FOR ALL USING (auth.uid()::text = user_id);

-- Contacts
CREATE POLICY "Public Insert Contact" ON contacts FOR INSERT WITH CHECK (true);
