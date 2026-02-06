import { pool } from '../db/client';

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string; // Keep for legacy/single compat
    categoryIds?: string[]; // New multiple categories
    subcategory?: string;
    rating: number;
    reviews: number;
    badge?: string;
    description?: string;
    stock: number;
    deliveryCharge?: number;
    variations?: Variation[];
    additionalImages?: string[];
}

export interface Variation {
    name: string;
    options: string[];
    required: boolean;
    priceAdjustments: { [key: string]: number };
}

export const productRepository = {
    async getAll(filters: { category?: string; subcategory?: string; search?: string }): Promise<Product[]> {
        let query = `
      SELECT id, name, price, original_price as "originalPrice", image_url as image, 
             category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge",
             variations, additional_images as "additionalImages"
      FROM products
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.category) {
            query += ` AND (category_id = $${paramIndex} OR $${paramIndex} = ANY(category_ids))`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.subcategory) {
            query += ` AND subcategory = $${paramIndex}`;
            params.push(filters.subcategory);
            paramIndex++;
        }

        if (filters.search) {
            const searchVal = filters.search.toLowerCase();
            const idMatch = searchVal.match(/cd-(\d+)/) || searchVal.match(/^(\d+)$/);

            if (idMatch) {
                const idNum = idMatch[1];
                query += ` AND (LOWER(name) LIKE $${paramIndex} OR id = $${paramIndex + 1})`;
                params.push(`%${searchVal}%`, idNum);
                paramIndex += 2;
            } else {
                query += ` AND (
                    LOWER(name) LIKE $${paramIndex} OR 
                    LOWER(description) LIKE $${paramIndex} OR 
                    category_id ILIKE $${paramIndex} OR 
                    subcategory ILIKE $${paramIndex}
                )`;
                params.push(`%${searchVal}%`);
                paramIndex++;
            }
        }

        // Add priority ordering as requested
        if (filters.search) {
            query += ` ORDER BY (CASE WHEN LOWER(name) LIKE $${paramIndex - 1} THEN 1 ELSE 2 END) ASC, created_at DESC`;
        } else {
            query += ` ORDER BY id ASC`;
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
             variations, additional_images as "additionalImages"
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
            categoryIds: row.categoryIds || [row.category].filter(Boolean)
        };
    },

    async create(product: Omit<Product, 'id'> & { id?: number }) {
        const categoryIds = product.categoryIds || [product.category].filter(Boolean);
        const cols = ['name', 'price', 'original_price', 'image_url', 'category_id', 'category_ids', 'subcategory', 'rating', 'reviews', 'badge', 'description', 'stock', 'delivery_charge', 'variations', 'additional_images'];
        const vals = [product.name, product.price, product.originalPrice, product.image, product.category, categoryIds, product.subcategory, product.rating, product.reviews, product.badge, product.description, product.stock || 0, product.deliveryCharge || 0, JSON.stringify(product.variations || []), product.additionalImages || []];
        let placeholder = '$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15';

        if (product.id) {
            cols.push('id');
            vals.push(product.id);
            placeholder += `, $${vals.length}`;
        } else {
            // Adjust placeholder count if no ID
            placeholder = vals.map((_, i) => `$${i + 1}`).join(', ');
        }

        const query = `
            INSERT INTO products (${cols.join(', ')})
            VALUES (${placeholder})
            RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                      category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge", variations, additional_images as "additionalImages"
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
            categoryIds: row.categoryIds || [row.category].filter(Boolean)
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
          additional_images = COALESCE($14, additional_images)
      WHERE id = $15
      RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                category_id as category, category_ids as "categoryIds", subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge", variations, additional_images as "additionalImages"
    `, [
            product.name, product.price, product.originalPrice, product.image,
            product.category, categoryIds, product.rating, product.reviews, product.badge,
            product.description, product.stock, product.deliveryCharge,
            product.variations ? JSON.stringify(product.variations) : null,
            product.additionalImages,
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
            categoryIds: row.categoryIds || [row.category].filter(Boolean)
        };
    },

    async updateCategoryProducts(categoryId: string, productIds: number[]): Promise<void> {
        // 1. Remove categoryId from all products NOT in the list
        await pool.query(`
            UPDATE products 
            SET category_ids = array_remove(category_ids, $1)
            WHERE $1 = ANY(category_ids) AND NOT (id = ANY($2))
        `, [categoryId, productIds]);

        // 2. Add categoryId to all products IN the list
        await pool.query(`
            UPDATE products 
            SET category_ids = array_append(category_ids, $1)
            WHERE id = ANY($2) AND NOT ($1 = ANY(category_ids))
        `, [categoryId, productIds]);
    },

    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
};
