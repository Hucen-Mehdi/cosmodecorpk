import { pool } from '../db/client';

export interface Category {
    id: string;
    name: string;
    icon?: string;
    image?: string;
    hasSubMenu?: boolean;
    subcategories?: Subcategory[];
}

export interface Subcategory {
    id: string;
    name: string;
    parentId?: string; // for internal use
}

export const categoryRepository = {
    async getAll(): Promise<Category[]> {
        // Fetch all categories
        const result = await pool.query(`
      SELECT id, name, icon, image_url as image, parent_id
      FROM categories
      ORDER BY id
    `);

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
                    icon: row.icon,
                    image: row.image
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
      SELECT id, name, icon, image_url as image, parent_id
      FROM categories
      WHERE id = $1
    `, [id]);
        if (result.rows.length === 0) return null;
        return {
            id: result.rows[0].id,
            name: result.rows[0].name,
            icon: result.rows[0].icon,
            image: result.rows[0].image
        };
    },

    async create(data: { id: string; name: string; icon?: string; image?: string; parentId?: string }): Promise<Category> {
        const result = await pool.query(`
      INSERT INTO categories (id, name, icon, image_url, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, icon, image_url as image, parent_id
    `, [data.id, data.name, data.icon, data.image, data.parentId]);
        return result.rows[0];
    },

    async update(id: string, data: { name?: string; icon?: string; image?: string }): Promise<Category> {
        const result = await pool.query(`
      UPDATE categories
      SET name = COALESCE($1, name),
          icon = COALESCE($2, icon),
          image_url = COALESCE($3, image_url)
      WHERE id = $4
      RETURNING id, name, icon, image_url as image
    `, [data.name, data.icon, data.image, id]);
        return result.rows[0];
    },

    async delete(id: string): Promise<void> {
        // Check if products exist
        const productsCount = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
        if (parseInt(productsCount.rows[0].count) > 0) {
            throw new Error('Cannot delete category with associated products');
        }

        // Check if subcategories exist
        const subCount = await pool.query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [id]);
        if (parseInt(subCount.rows[0].count) > 0) {
            throw new Error('Cannot delete category with associated subcategories');
        }

        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    }
};
