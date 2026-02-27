-- Migration 009: Collection Management Fix
-- Based on user request to properly handle deletion, slugs, and associations.

-- 1. Rename categories to collections if exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') AND 
       NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'collections') THEN
        ALTER TABLE categories RENAME TO collections;
    END IF;
END $$;

-- 2. Add columns if not exist
ALTER TABLE collections ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Initialize slug from ID if null
UPDATE collections SET slug = id WHERE slug IS NULL;

-- 4. Add unique constraint on slug
-- First, ensure no duplicates exist by appending timestamp to duplicates (just in case)
-- But ID is primary key, so it should be unique.
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_slug_unique;
ALTER TABLE collections ADD CONSTRAINT collections_slug_unique UNIQUE (slug);

-- 5. Junction table for product-collection associations
CREATE TABLE IF NOT EXISTS product_collections (
    product_id INTEGER NOT NULL,
    collection_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (product_id, collection_id),
    CONSTRAINT product_collections_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT product_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- 6. Migrate data from products table if product_collections is empty
-- 6. Migrate data from products table if product_collections is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM product_collections LIMIT 1) THEN
        -- From category_id
        INSERT INTO product_collections (product_id, collection_id)
        SELECT id, category_id 
        FROM products 
        WHERE category_id IS NOT NULL 
        AND category_id IN (SELECT id FROM collections)
        ON CONFLICT DO NOTHING;
        
        -- From category_ids array with safer unnest
        INSERT INTO product_collections (product_id, collection_id)
        SELECT DISTINCT p.id, c.id
        FROM products p, unnest(p.category_ids) cid
        JOIN collections c ON c.id = cid
        WHERE p.category_ids IS NOT NULL 
        AND array_length(p.category_ids, 1) > 0
        ON CONFLICT DO NOTHING;
    END IF;
END $$;


-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_deleted_at ON collections(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);

-- 8. Fix old category_id references in products table if they point to deleted collections
-- (Optional: We'll keep them for now but repositories will use product_collections)

-- 9. Update existing constraints to CASCADE if they didn't
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'products_category_id_fkey') THEN
        ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;
        ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES collections(id) ON DELETE SET NULL;
    END IF;
END $$;
