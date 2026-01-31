import { pool } from '../db/client';

export interface Notification {
    id?: number;
    userId: string | null; // null for admin/global?
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead?: boolean;
    orderId?: string;
    createdAt?: string;
}

export const notificationRepository = {
    async create(notif: Notification) {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, order_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [notif.userId, notif.title, notif.message, notif.type, notif.orderId]
        );
    },

    async getByUserId(userId: string) {
        const res = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 OR user_id IS NULL 
             ORDER BY created_at DESC LIMIT 50`,
            [userId]
        );
        return res.rows;
    },

    async markAsRead(id: number) {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    },

    async getAdminNotifications() {
        const res = await pool.query(
            `SELECT n.*, u.name as "userName" 
             FROM notifications n
             LEFT JOIN users u ON n.user_id = u.id
             WHERE n.user_id IS NULL OR EXISTS (SELECT 1 FROM users WHERE id = n.user_id AND role = 'admin')
             ORDER BY n.created_at DESC LIMIT 50`
        );
        return res.rows;
    }
};
