-- 1. Ensure category_product_sorting has proper foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'category_product_sorting_category_id_fkey') THEN
        ALTER TABLE category_product_sorting 
        ADD CONSTRAINT category_product_sorting_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES collections(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Clean up products that reference non-existent categories
UPDATE products 
SET category_id = NULL 
WHERE category_id IS NOT NULL 
AND category_id NOT IN (SELECT id FROM collections);

-- 3. Sync product_collections with legacy columns
-- Make sure every product's category_id and category_ids are in product_collections
INSERT INTO product_collections (product_id, collection_id)
SELECT id, category_id 
FROM products 
WHERE category_id IS NOT NULL 
AND category_id IN (SELECT id FROM collections)
ON CONFLICT DO NOTHING;

INSERT INTO product_collections (product_id, collection_id)
SELECT DISTINCT p.id, c.id
FROM products p, unnest(p.category_ids) cid
JOIN collections c ON c.id = cid
ON CONFLICT DO NOTHING;

-- 4. Correct any slug vs id confusion in products table
-- If category_id matches a slug but not an id, update it to the id
UPDATE products p
SET category_id = c.id
FROM collections c
WHERE p.category_id = c.slug 
AND p.category_id != c.id;


-- Same for category_ids array (this is harder in plain SQL, but let's try)
UPDATE products p
SET category_ids = (
    SELECT array_agg(DISTINCT COALESCE(c.id, cid))
    FROM unnest(p.category_ids) cid
    LEFT JOIN collections c ON cid = c.slug
)
WHERE EXISTS (
    SELECT 1 FROM unnest(p.category_ids) cid JOIN collections c ON cid = c.slug WHERE cid != c.id
);

-- 5. Force Hard Delete for any collections already tagged for deletion
DELETE FROM product_collections WHERE collection_id IN (SELECT id FROM collections WHERE deleted_at IS NOT NULL);
DELETE FROM collections WHERE deleted_at IS NOT NULL;
