import { pool } from '../db/client';

export interface Category {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    hasSubMenu?: boolean;
    subcategories?: Subcategory[];
    productCount?: number;
    sampleImages?: string[];
    is_active?: boolean;
    deleted_at?: string | null;
}

export interface Subcategory {
    id: string;
    name: string;
    parentId?: string; // for internal use
}

export const categoryRepository = {
    async getAll(includeDeleted: boolean = false): Promise<Category[]> {
        // Fetch all collections with product counts and sample images
        let query = `
            SELECT 
                c.id, 
                c.name, 
                c.slug,
                c.description,
                c.icon, 
                c.image_url as image, 
                c.parent_id,
                c.is_active,
                c.deleted_at,
                COUNT(p.id) as product_count,
                (
                    SELECT array_agg(image_url) 
                    FROM (
                        SELECT image_url 
                        FROM products 
                        WHERE category_id = c.id 
                        LIMIT 4
                    ) as samples
                ) as sample_images
            FROM collections c
            LEFT JOIN products p ON c.id = p.category_id
            WHERE 1=1
        `;

        if (!includeDeleted) {
            query += ' AND c.deleted_at IS NULL AND c.is_active = true';
        }

        query += `
            GROUP BY c.id
            ORDER BY c.name ASC
        `;

        const result = await pool.query(query);

        const rows = result.rows;
        const categories: Category[] = [];
        const subcategoryMap = new Map<string, Subcategory[]>();

        // First pass: separate parents and children
        rows.forEach(row => {
            if (row.parent_id) {
                if (!subcategoryMap.has(row.parent_id)) {
                    subcategoryMap.set(row.parent_id, []);
                }
                subcategoryMap.get(row.parent_id)?.push({
                    id: row.id,
                    name: row.name
                });
            } else {
                categories.push({
                    id: row.id,
                    name: row.name,
                    slug: row.slug,
                    description: row.description,
                    icon: row.icon,
                    image: row.image,
                    is_active: row.is_active,
                    deleted_at: row.deleted_at,
                    productCount: parseInt(row.product_count || '0'),
                    sampleImages: row.sample_images || []
                });
            }
        });

        // Attach subcategories
        categories.forEach(cat => {
            const subs = subcategoryMap.get(cat.id);
            if (subs && subs.length > 0) {
                cat.subcategories = subs;
                cat.hasSubMenu = true; // infer this
            }
        });

        return categories;
    },

    async getById(id: string): Promise<Category | null> {
        const result = await pool.query(`
      SELECT id, name, slug, description, icon, image_url as image, parent_id, is_active, deleted_at
      FROM collections
      WHERE (id = $1 OR slug = $1) AND deleted_at IS NULL
    `, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            icon: row.icon,
            image: row.image,
            is_active: row.is_active,
            deleted_at: row.deleted_at
        };
    },

    async create(data: { id: string; name: string; slug?: string; description?: string; icon?: string; image?: string; parentId?: string }): Promise<Category> {
        const name = data.name.trim();
        const id = data.id.trim();
        // Generate slug from name if not provided
        let finalSlug = (data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();

        // Handle slug uniqueness check
        let slugToUse = finalSlug;
        let counter = 1;
        while (true) {
            const check = await pool.query('SELECT id FROM collections WHERE slug = $1', [slugToUse]);
            if (check.rows.length === 0) break;
            slugToUse = `${finalSlug}-${counter}`;
            counter++;
        }

        const result = await pool.query(`
      INSERT INTO collections (id, name, slug, description, icon, image_url, parent_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, name, slug, description, icon, image_url as image, parent_id, is_active
    `, [id, name, slugToUse, data.description, data.icon, data.image, data.parentId]);
        return result.rows[0];
    },

    async update(id: string, data: { name?: string; slug?: string; description?: string; icon?: string; image?: string }): Promise<Category> {
        const result = await pool.query(`
      UPDATE collections
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          icon = COALESCE($4, icon),
          image_url = COALESCE($5, image_url),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, slug, description, icon, image_url as image
    `, [data.name, data.slug, data.description, data.icon, data.image, id]);
        return result.rows[0];
    },

    async delete(id: string, hardDelete: boolean = true): Promise<void> {
        if (hardDelete) {
            // Transaction to clear everything
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // 1. Remove from product_collections junction table
                await client.query('DELETE FROM product_collections WHERE collection_id = $1', [id]);

                // 2. Remove from category_product_sorting
                await client.query('DELETE FROM category_product_sorting WHERE category_id = $1', [id]);

                // 3. Clear references in products table
                await client.query(`
                    UPDATE products 
                    SET category_id = NULL 
                    WHERE category_id = $1
                `, [id]);

                await client.query(`
                    UPDATE products 
                    SET category_ids = array_remove(category_ids, $1)
                    WHERE $1 = ANY(category_ids)
                `, [id]);

                // 4. Remove from collections
                const result = await client.query('DELETE FROM collections WHERE id = $1 RETURNING id, name', [id]);

                if (result.rows.length === 0) {
                    await client.query('ROLLBACK');
                    throw new Error(`Collection with ID "${id}" not found. It may have already been deleted or the ID is incorrect.`);
                }


                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } else {
            // Soft delete
            await pool.query(`
                UPDATE collections 
                SET deleted_at = NOW(), 
                    is_active = false,
                    slug = slug || '_deleted_' || EXTRACT(EPOCH FROM NOW())
                WHERE id = $1
            `, [id]);

            // Clear references in products table even for soft delete to prevent "slug reuse showing old products"
            await pool.query(`
                UPDATE products 
                SET category_id = NULL 
                WHERE category_id = $1
            `, [id]);

            await pool.query(`
                UPDATE products 
                SET category_ids = array_remove(category_ids, $1)
                WHERE $1 = ANY(category_ids)
            `, [id]);

            // Still clear associations if soft deleted to solve the "products showing up" issue
            await pool.query('DELETE FROM product_collections WHERE collection_id = $1', [id]);
        }
    }

};

