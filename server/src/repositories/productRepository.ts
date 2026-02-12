import { pool } from '../db/client';


export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    categoryIds?: string[];
    subcategory?: string;
    rating: number;
    reviews: number;
    badge?: string;
    description?: string;
    stock: number;
    deliveryCharge?: number;
    variations?: Variation[];
    additionalImages?: string[];
    sortOrder?: number;
    isFeatured?: boolean;
    featuredPosition?: number;
    salesCount?: number;
}

export interface Variation {
    name: string;
    options: string[];
    required: boolean;
    priceAdjustments: { [key: string]: number };
}

export const productRepository = {
    async getAll(filters: { category?: string; subcategory?: string; search?: string; sortBy?: string; limit?: number; featured?: boolean }): Promise<Product[]> {
        let query = `
      SELECT p.id, p.name, p.price, p.original_price as "originalPrice", p.image_url as image, 
             p.category_id as category, p.category_ids as "categoryIds", p.subcategory, p.rating, p.reviews, p.badge, p.description, p.stock, p.delivery_charge as "deliveryCharge",
             p.variations, p.additional_images as "additionalImages",
             p.is_featured as "isFeatured", p.sales_count as "salesCount",
             COALESCE(cps.sort_order, p.sort_order) as "sortOrder"
      FROM products p
      LEFT JOIN category_product_sorting cps ON p.id = cps.product_id AND cps.category_id = $1
      WHERE 1=1
    `;
        const params: any[] = [filters.category || 'GLOBAL'];
        let paramIndex = 2; // Start from 2 because $1 is reserved for category join

        if (filters.category) {
            query += ` AND (p.category_id = $${paramIndex} OR $${paramIndex} = ANY(p.category_ids))`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.subcategory) {
            query += ` AND p.subcategory = $${paramIndex}`;
            params.push(filters.subcategory);
            paramIndex++;
        }

        if (filters.featured) {
            query += ` AND p.is_featured = true`;
        }

        if (filters.search) {
            const searchVal = filters.search.toLowerCase();
            const idMatch = searchVal.match(/cd-(\d+)/) || searchVal.match(/^(\d+)$/);

            if (idMatch) {
                const idNum = idMatch[1];
                query += ` AND (LOWER(p.name) LIKE $${paramIndex} OR p.id = $${paramIndex + 1})`;
                params.push(`%${searchVal}%`, idNum);
                paramIndex += 2;
            } else {
                query += ` AND (
                    LOWER(p.name) LIKE $${paramIndex} OR 
                    LOWER(p.description) LIKE $${paramIndex} OR 
                    p.category_id ILIKE $${paramIndex} OR 
                    p.subcategory ILIKE $${paramIndex}
                )`;
                params.push(`%${searchVal}%`);
                paramIndex++;
            }
        }

        // Sorting Logic
        if (filters.search) {
            query += ` ORDER BY p.id ASC`;
        } else {
            switch (filters.sortBy) {
                case 'featured':
                    query += ` ORDER BY p.is_featured DESC, "sortOrder" ASC, p.id ASC`;
                    break;
                case 'best_selling':
                    query += ` ORDER BY p.sales_count DESC, "sortOrder" ASC`;
                    break;
                case 'newest':
                    query += ` ORDER BY p.created_at DESC`;
                    break;
                case 'price_asc':
                    query += ` ORDER BY p.price ASC`;
                    break;
                case 'price_desc':
                    query += ` ORDER BY p.price DESC`;
                    break;
                case 'manual':
                default:
                    query += ` ORDER BY "sortOrder" ASC, p.id ASC`;
            }
        }

        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
        }

        try {
            const result = await pool.query(query, params);
            return result.rows.map(row => ({
                ...row,
                price: Number(row.price),
                originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
                rating: Number(row.rating),
                reviews: Number(row.reviews),
                stock: Number(row.stock || 0),
                deliveryCharge: Number(row.deliveryCharge || 0),
                additionalImages: row.additionalImages || [],
                categoryIds: row.categoryIds || [row.category].filter(Boolean)
            }));
        } catch (err) {
            console.error('🔥 CRITICAL DB ERROR in productRepository.getAll:', err);
            throw err;
        }
    },

    async getById(id: number): Promise<Product | null> {
        const result = await pool.query(`
      SELECT id, name, price, original_price as "originalPrice", image_url as image, 
             category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge",
             variations, additional_images as "additionalImages",
             sort_order as "sortOrder", is_featured as "isFeatured", sales_count as "salesCount"
      FROM products
      WHERE id = $1
    `, [id]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0),
            additionalImages: row.additionalImages || [],
            categoryIds: row.categoryIds || [row.category].filter(Boolean),
            sortOrder: row.sortOrder,
            isFeatured: row.isFeatured,
            salesCount: row.salesCount
        };
    },

    async create(product: Omit<Product, 'id'> & { id?: number }) {
        const categoryIds = product.categoryIds || [product.category].filter(Boolean);
        const cols = ['name', 'price', 'original_price', 'image_url', 'category_id', 'category_ids', 'subcategory', 'rating', 'reviews', 'badge', 'description', 'stock', 'delivery_charge', 'variations', 'additional_images', 'sort_order', 'is_featured'];
        const vals = [product.name, product.price, product.originalPrice, product.image, product.category, categoryIds, product.subcategory, product.rating, product.reviews, product.badge, product.description, product.stock || 0, product.deliveryCharge || 0, JSON.stringify(product.variations || []), product.additionalImages || [], 1000, false];
        let placeholder = vals.map((_, i) => `$${i + 1}`).join(', ');

        if (product.id) {
            cols.push('id');
            vals.push(product.id);
            placeholder += `, $${vals.length}`;
        }

        const query = `
            INSERT INTO products (${cols.join(', ')})
            VALUES (${placeholder})
            RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                      category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge", variations, additional_images as "additionalImages", sort_order as "sortOrder", is_featured as "isFeatured", sales_count as "salesCount"
        `;

        const result = await pool.query(query, vals);
        const row = result.rows[0];
        return {
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0),
            additionalImages: row.additionalImages || [],
            categoryIds: row.categoryIds || [row.category].filter(Boolean),
            sortOrder: row.sortOrder,
            isFeatured: row.isFeatured,
            salesCount: row.salesCount
        };
    },

    async update(id: number, product: Partial<Product>): Promise<Product> {
        // If categoryIds is provided, we use it. If only category is provided, we wrap it.
        const categoryIds = product.categoryIds !== undefined ? product.categoryIds : (product.category ? [product.category] : undefined);

        const result = await pool.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          price = COALESCE($2, price),
          original_price = COALESCE($3, original_price),
          image_url = COALESCE($4, image_url),
          category_id = COALESCE($5, category_id),
          category_ids = COALESCE($6, category_ids),
          rating = COALESCE($7, rating),
          reviews = COALESCE($8, reviews),
          badge = COALESCE($9, badge),
          description = COALESCE($10, description),
          stock = COALESCE($11, stock),
          delivery_charge = COALESCE($12, delivery_charge),
          variations = COALESCE($13, variations),
          additional_images = COALESCE($14, additional_images),
          is_featured = COALESCE($15, is_featured),
          sort_order = COALESCE($16, sort_order)
      WHERE id = $17
      RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge", variations, additional_images as "additionalImages", sort_order as "sortOrder", is_featured as "isFeatured", sales_count as "salesCount"
    `, [
            product.name, product.price, product.originalPrice, product.image,
            product.category, categoryIds, product.rating, product.reviews, product.badge,
            product.description, product.stock, product.deliveryCharge,
            product.variations ? JSON.stringify(product.variations) : null,
            product.additionalImages,
            product.isFeatured,
            product.sortOrder,
            id
        ]);

        const row = result.rows[0];
        return {
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0),
            additionalImages: row.additionalImages || [],
            categoryIds: row.categoryIds || [row.category].filter(Boolean),
            sortOrder: row.sortOrder,
            isFeatured: row.isFeatured,
            salesCount: row.salesCount
        };
    },

    async updateCategoryProducts(categoryId: string, productIds: number[]): Promise<void> {
        await pool.query(`
            UPDATE products 
            SET category_ids = array_remove(category_ids, $1)
            WHERE $1 = ANY(category_ids) AND NOT (id = ANY($2))
        `, [categoryId, productIds]);

        await pool.query(`
            UPDATE products 
            SET category_ids = array_append(category_ids, $1)
            WHERE id = ANY($2) AND NOT ($1 = ANY(category_ids))
        `, [categoryId, productIds]);
    },

    async updateSortOrder(items: { id: number; position: number }[], categoryId?: string): Promise<void> {
        if (items.length === 0) return;

        // Use a transaction for bulk updates
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const item of items) {
                if (categoryId) {
                    // Category-specific sort order (using junction table)
                    await client.query(`
                        INSERT INTO category_product_sorting (category_id, product_id, sort_order)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (category_id, product_id)
                        DO UPDATE SET sort_order = EXCLUDED.sort_order
                    `, [categoryId, item.id, item.position]);
                } else {
                    // Global sort order
                    await client.query('UPDATE products SET sort_order = $1 WHERE id = $2', [item.position, item.id]);
                }
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async toggleFeatured(id: number, isFeatured: boolean): Promise<Product> {
        const result = await pool.query(`
            UPDATE products SET is_featured = $1 WHERE id = $2 RETURNING *
        `, [isFeatured, id]);

        // Reuse mapping from getById or simpler mapping since we just need to return confirmation
        // adhering to interface though:
        const row = result.rows[0];
        return {
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0),
            additionalImages: row.additionalImages || [],
            categoryIds: row.categoryIds || [row.category].filter(Boolean),
            sortOrder: row.sortOrder,
            isFeatured: row.isFeatured,
            salesCount: row.salesCount
        };
    },

    async updateSalesCount(id: number, increment: number): Promise<void> {
        await pool.query('UPDATE products SET sales_count = sales_count + $1, last_ordered_at = NOW() WHERE id = $2', [increment, id]);
    },

    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
};
