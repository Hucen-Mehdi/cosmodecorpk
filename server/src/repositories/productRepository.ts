import { pool } from '../db/client';

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    subcategory?: string;
    rating: number;
    reviews: number;
    badge?: string;
    description?: string;
    stock: number;
    deliveryCharge?: number;
}

export const productRepository = {
    async getAll(filters: { category?: string; subcategory?: string; search?: string }): Promise<Product[]> {
        let query = `
      SELECT id, name, price, original_price as "originalPrice", image_url as image, 
             category_id as category, subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge"
      FROM products
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.category) {
            query += ` AND category_id = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.subcategory) {
            query += ` AND subcategory = $${paramIndex}`;
            params.push(filters.subcategory);
            paramIndex++;
        }

        if (filters.search) {
            query += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`;
            params.push(`%${filters.search.toLowerCase()}%`);
            paramIndex++;
        }

        query += ` ORDER BY id ASC`;

        const result = await pool.query(query, params);

        return result.rows.map(row => ({
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0)
        }));
    },

    async getById(id: number): Promise<Product | null> {
        const result = await pool.query(`
      SELECT id, name, price, original_price as "originalPrice", image_url as image, 
             category_id as category, subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge"
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
            deliveryCharge: Number(row.deliveryCharge || 0)
        };
    },

    async create(product: Omit<Product, 'id'> & { id?: number }) {
        const cols = ['name', 'price', 'original_price', 'image_url', 'category_id', 'subcategory', 'rating', 'reviews', 'badge', 'description', 'stock', 'delivery_charge'];
        const vals = [product.name, product.price, product.originalPrice, product.image, product.category, product.subcategory, product.rating, product.reviews, product.badge, product.description, product.stock || 0, product.deliveryCharge || 0];
        let placeholder = '$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12';

        if (product.id) {
            cols.push('id');
            vals.push(product.id);
            placeholder += `, $${vals.length}`;
        }

        const query = `
            INSERT INTO products (${cols.join(', ')})
            VALUES (${placeholder})
            RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                      category_id as category, subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge"
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
            deliveryCharge: Number(row.deliveryCharge || 0)
        };
    },

    async update(id: number, product: Partial<Product>): Promise<Product> {
        const result = await pool.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          price = COALESCE($2, price),
          original_price = COALESCE($3, original_price),
          image_url = COALESCE($4, image_url),
          category_id = COALESCE($5, category_id),
          rating = COALESCE($6, rating),
          reviews = COALESCE($7, reviews),
          badge = COALESCE($8, badge),
          description = COALESCE($9, description),
          stock = COALESCE($10, stock),
          delivery_charge = COALESCE($11, delivery_charge)
      WHERE id = $12
      RETURNING id, name, price, original_price as "originalPrice", image_url as image, 
                category_id as category, subcategory, rating, reviews, badge, description, stock, delivery_charge as "deliveryCharge"
    `, [
            product.name, product.price, product.originalPrice, product.image,
            product.category, product.rating, product.reviews, product.badge,
            product.description, product.stock, product.deliveryCharge, id
        ]);

        const row = result.rows[0];
        return {
            ...row,
            price: Number(row.price),
            originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
            rating: Number(row.rating),
            reviews: Number(row.reviews),
            stock: Number(row.stock || 0),
            deliveryCharge: Number(row.deliveryCharge || 0)
        };
    },

    async delete(id: number): Promise<void> {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
};
