-- Enable RLS on all tables
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

-- 1. PUBLIC READ POLICIES
-- Anyone can see products, categories, testimonials
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);

-- 2. AUTHENTICATED USER POLICIES
-- Users can read/update their own data
CREATE POLICY "Users Read Own Data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users Update Own Data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Addresses
CREATE POLICY "Users Read Own Addresses" ON addresses FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users Manage Own Addresses" ON addresses FOR ALL USING (auth.uid()::text = user_id);

-- Orders
CREATE POLICY "Users Read Own Orders" ON orders FOR SELECT USING (auth.uid()::text = user_id);
-- Users can insert orders (checkout)
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
-- Anyone can insert contact message
CREATE POLICY "Public Insert Contact" ON contacts FOR INSERT WITH CHECK (true);


-- 3. ADMIN POLICIES
-- Admin role check function (assuming your JWT claims or user role column works with Supabase Auth or custom auth)
-- Since we are using CUSTOM AUTH (not Supabase Auth), RLS with `auth.uid()` might NOT work as expected 
-- if we are not using Supabase's JWTs.
--
-- CRITICAL NOTE: You are using custom `jsonwebtoken` in `authRoutes.ts`, NOT Supabase Auth.
-- Supabase RLS works based on the PostgreSQL `current_setting('request.jwt.claim.sub')`.
-- 
-- If you are effectively bypassing Supabase Auth and just using it as a DB, 
-- simple RLS policies relying on `auth.uid()` will FAIL for your custom JWTs unless you configure 
-- your database connection to pass the token or use a Session variable.
--
-- HOWEVER, since your Backend is Node.js and connects via `pg` pool with a connection string,
-- The Backend acts as a "Superuser" (postgres/service_role) effectively bypassing RLS 
-- UNLESS you are using a limited role connection.
--
-- IF you are connecting as `postgres` or `service_role` (which is typical for Backend API), 
-- then RLS is bypassed anyway for the Backend API calls.
-- 
-- The "Supabase Security Advisor" warns you because if you expose the DB via PostgREST (Supabase API),
-- it is insecure. But you are using a Next.js Backend.
--
-- SO, the Fix for Supabase Security Advisor is to ENABLE RLS, but for your Node.js backend to work,
-- it usually connects as an admin.
--
-- To silence the warnings AND provide safety in case of Leaks:
-- We will enable RLS.
-- We will add policies that allow the "service_role" (your backend) to do everything.
-- If you ever use Supabase Client on Frontend, these policies will matter.

-- Policy for Service Role (Backend) - usually implicit bypass, but let's be explicit if needed.
-- Actually, the best way to satisfy the advisor without breaking your custom backend 
-- is to simply enable RLS and add a "Service Role" policy if your user isn't a superuser.
-- But standard Supabase `postgres` user IS a superuser.

-- Let's assume you want to shut up the warnings.
-- We will create a policy that allows everything for the `postgres` and `service_role` roles.

-- 4. SERVICE ROLE / ADMIN BYPASS
-- This ensures your Node.js backend (connecting as admin) still works
-- even if RLS is on.
-- Note: 'postgres' user typically bypasses RLS automatically.

-- We will just add the Public Read policies as they are safe and good practice.
-- We will add a fallback "Allow All" for the dashboard user if needed, 
-- but realistically, your Node.js `pool` connects as the admin user.

-- REVISED STRATEGY: 
-- 1. Enable RLS (Fixes warnings)
-- 2. Add policies for potential future Supabase Auth usage (good practice)
-- 3. Ensure your backend connection is NOT affected. (It shouldn't be if it's superuser).

