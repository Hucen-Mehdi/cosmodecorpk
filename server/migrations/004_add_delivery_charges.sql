-- Add delivery charge to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;

-- Add delivery charge to order items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;
