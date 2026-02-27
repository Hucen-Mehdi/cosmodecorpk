-- Migration 012: Fix Whitespace in IDs and Slugs
-- 1. Update Foreign Keys to support Cascading Updates (Crucial for renaming IDs)

-- product_collections
ALTER TABLE product_collections DROP CONSTRAINT IF EXISTS product_collections_collection_id_fkey;
ALTER TABLE product_collections 
    ADD CONSTRAINT product_collections_collection_id_fkey 
    FOREIGN KEY (collection_id) REFERENCES collections(id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- products (legacy column)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES collections(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- category_product_sorting
ALTER TABLE category_product_sorting DROP CONSTRAINT IF EXISTS category_product_sorting_category_id_fkey;
ALTER TABLE category_product_sorting 
    ADD CONSTRAINT category_product_sorting_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES collections(id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Clean Data (Trim Whitespace)
-- This will automatically update referencing tables due to ON UPDATE CASCADE
UPDATE collections 
SET id = TRIM(id), 
    slug = TRIM(slug), 
    name = TRIM(name)
WHERE id <> TRIM(id) 
   OR slug <> TRIM(slug) 
   OR name <> TRIM(name);

-- 3. Clean Array Columns (No Cascade support for arrays, do manually)
UPDATE products 
SET category_ids = (
    SELECT array_agg(TRIM(cid)) 
    FROM unnest(category_ids) cid
)
WHERE category_ids IS NOT NULL;
