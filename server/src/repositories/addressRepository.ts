import { pool } from '../db/client';

export interface Address {
    id: string;
    userId: string;
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
}

export const addressRepository = {
    async getByUserId(userId: string): Promise<Address[]> {
        const result = await pool.query(
            `SELECT id, user_id as "userId", label, line1, line2, city, region, 
              postal_code as "postalCode", country, is_default as "isDefault"
       FROM addresses
       WHERE user_id = $1`,
            [userId]
        );
        return result.rows;
    },

    async create(addr: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
        const id = addr.id || Date.now().toString(); // Consistent with other text IDs

        // If setting default, unset others?
        // This logic was in route, better in repo or route? 
        // Usually repo should be atomic. I'll just insert here. 
        // Route logic handles unsetting.

        const result = await pool.query(
            `INSERT INTO addresses (id, user_id, label, line1, line2, city, region, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id as "userId", label, line1, line2, city, region, postal_code as "postalCode", country, is_default as "isDefault"`,
            [id, addr.userId, addr.label, addr.line1, addr.line2, addr.city, addr.region, addr.postalCode, addr.country, addr.isDefault]
        );
        return result.rows[0];
    },

    async update(id: string, userId: string, updates: Partial<Address>): Promise<Address | null> {
        // Construct dynamic update
        // This is simplified. 

        const fields = [];
        const values = [];
        let idx = 1;

        if (updates.label !== undefined) { fields.push(`label = $${idx++}`); values.push(updates.label); }
        if (updates.line1 !== undefined) { fields.push(`line1 = $${idx++}`); values.push(updates.line1); }
        if (updates.line2 !== undefined) { fields.push(`line2 = $${idx++}`); values.push(updates.line2); }
        if (updates.city !== undefined) { fields.push(`city = $${idx++}`); values.push(updates.city); }
        if (updates.region !== undefined) { fields.push(`region = $${idx++}`); values.push(updates.region); }
        if (updates.postalCode !== undefined) { fields.push(`postal_code = $${idx++}`); values.push(updates.postalCode); }
        if (updates.country !== undefined) { fields.push(`country = $${idx++}`); values.push(updates.country); }
        if (updates.isDefault !== undefined) { fields.push(`is_default = $${idx++}`); values.push(updates.isDefault); }

        if (fields.length === 0) return null; // No updates

        values.push(id);
        values.push(userId);

        const result = await pool.query(
            `UPDATE addresses SET ${fields.join(', ')} 
       WHERE id = $${idx++} AND user_id = $${idx++}
       RETURNING id, user_id as "userId", label, line1, line2, city, region, postal_code as "postalCode", country, is_default as "isDefault"`,
            values
        );
        return result.rows[0] || null;
    },

    async delete(id: string, userId: string): Promise<void> {
        await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    },

    async clearDefaults(userId: string) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }
};
