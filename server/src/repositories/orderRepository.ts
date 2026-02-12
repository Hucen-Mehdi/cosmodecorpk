import { pool } from '../db/client';
import { sendOrderConfirmationEmail } from '../utils/emailService';

export interface OrderItem {
    productId: string | number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    deliveryCharge?: number;
    selectedVariations?: { [key: string]: string };
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string | null;
    userEmail?: string;
    userName?: string;
    isGuest?: boolean;
    guestEmail?: string;
    date: string;
    status: string;
    items: OrderItem[];
    itemsCount: number;
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod?: string;
    shippingName?: string;
    shippingEmail?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingPostalCode?: string;
    shippingNotes?: string;
    codTax?: number;
}

export const orderRepository = {
    async create(order: Order) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let totalDeliveryCharge = 0;

            // 1. Check Stock and Calculate Delivery Charges
            for (const item of order.items) {
                const productRes = await client.query('SELECT stock, name, delivery_charge FROM products WHERE id = $1 FOR UPDATE', [Number(item.productId)]);
                if (productRes.rows.length === 0) throw new Error(`Product ${item.productId} not found`);

                const product = productRes.rows[0];
                const currentStock = product.stock;

                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}`);
                }

                // Calculate delivery charge for this item
                const itemDeliveryCharge = (Number(product.delivery_charge) || 0) * item.quantity;
                item.deliveryCharge = Number(product.delivery_charge) || 0;
                totalDeliveryCharge += itemDeliveryCharge;

                await client.query('UPDATE products SET stock = stock - $1, sales_count = sales_count + $1, last_ordered_at = NOW() WHERE id = $2', [item.quantity, item.productId]);
            }

            // Recalculate totals
            const finalShipping = totalDeliveryCharge;
            let finalTotal = order.subtotal + finalShipping;
            let codTax = 0;

            if (order.paymentMethod === 'cod') {
                codTax = order.subtotal * 0.05;
                finalTotal += codTax;
            }


            // 2. Insert Order
            await client.query(
                `INSERT INTO orders (
                    id, order_number, user_id, is_guest, guest_email, date, status, items_count, subtotal, shipping, total, 
                    payment_method, shipping_name, shipping_email, shipping_phone, 
                    shipping_address, shipping_city, shipping_postal_code, shipping_notes, cod_tax
                )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
                [
                    order.id,
                    order.orderNumber,
                    order.userId,
                    order.isGuest || false,
                    order.guestEmail || null,
                    order.date,
                    order.status,
                    order.itemsCount,
                    order.subtotal,
                    finalShipping,
                    finalTotal,
                    order.paymentMethod,
                    order.shippingName,
                    order.shippingEmail,
                    order.shippingPhone,
                    order.shippingAddress,
                    order.shippingCity,
                    order.shippingPostalCode,
                    order.shippingNotes,
                    codTax
                ]
            );

            // 3. Insert Items
            for (const item of order.items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url, delivery_charge, selected_variations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        order.id,
                        Number(item.productId),
                        item.name,
                        item.price,
                        item.quantity,
                        item.image,
                        item.deliveryCharge || 0,
                        JSON.stringify(item.selectedVariations || {})
                    ]
                );
            }

            // 4. Create Notifications
            // For Admin
            await client.query(
                `INSERT INTO notifications (user_id, title, message, type, order_id)
                 VALUES (NULL, $1, $2, 'success', $3)`,
                ['New Order Received', `Order #${order.orderNumber} placed for Rs. ${finalTotal.toLocaleString()}`, order.id]
            );

            // For User (Only if registered)
            if (order.userId) {
                await client.query(
                    `INSERT INTO notifications (user_id, title, message, type, order_id)
                     VALUES ($1, $2, $3, 'success', $4)`,
                    [order.userId, 'Order Placed!', `Your order #${order.orderNumber} has been received and is being processed.`, order.id]
                );
            }


            await client.query('COMMIT');

            const newOrderResult = {
                ...order,
                shipping: finalShipping,
                total: finalTotal,
                codTax
            };

            // Send Email Confirmation (Async, don't block response)
            sendOrderConfirmationEmail(newOrderResult).catch(err => console.error('Failed to send email:', err));

            // Return updated order object with correct totals
            return newOrderResult;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async findByUserId(userId: string): Promise<Order[]> {
        const ordersRes = await pool.query(
            `SELECT id, order_number as "orderNumber", user_id as "userId", date, status, 
              items_count as "itemsCount", subtotal, shipping, total, cod_tax as "codTax",
              payment_method as "paymentMethod", shipping_name as "shippingName", 
              shipping_email as "shippingEmail", shipping_phone as "shippingPhone", 
              shipping_address as "shippingAddress", shipping_city as "shippingCity", 
              shipping_postal_code as "shippingPostalCode", shipping_notes as "shippingNotes"
       FROM orders
       WHERE user_id = $1
       ORDER BY date DESC`,
            [userId]
        );

        const orders: Order[] = [];

        for (const row of ordersRes.rows) {
            const itemsRes = await pool.query(
                `SELECT product_id as "productId", name, price, quantity, image_url as image, delivery_charge as "deliveryCharge", selected_variations as "selectedVariations"
         FROM order_items
         WHERE order_id = $1`,
                [row.id]
            );

            orders.push({
                ...row,
                date: row.date.toISOString(),
                subtotal: Number(row.subtotal),
                shipping: Number(row.shipping),
                total: Number(row.total),
                codTax: Number(row.codTax || 0),
                itemsCount: Number(row.itemsCount),
                items: itemsRes.rows.map(i => ({
                    ...i,
                    price: Number(i.price),
                    productId: String(i.productId),
                    deliveryCharge: Number(i.deliveryCharge || 0),
                    selectedVariations: i.selectedVariations
                }))
            });
        }

        return orders;
    },

    async getAll(): Promise<Order[]> {
        const ordersRes = await pool.query(
            `SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId", o.date, o.status, 
              o.items_count as "itemsCount", o.subtotal, o.shipping, o.total, o.cod_tax as "codTax",
              o.payment_method as "paymentMethod", o.shipping_name as "shippingName", 
              o.shipping_email as "shippingEmail", o.shipping_phone as "shippingPhone", 
              o.shipping_address as "shippingAddress", o.shipping_city as "shippingCity", 
              o.shipping_postal_code as "shippingPostalCode", o.shipping_notes as "shippingNotes",
              u.email as "userEmail", u.name as "userName"
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.date DESC`
        );

        const orders: Order[] = [];

        for (const row of ordersRes.rows) {
            const itemsRes = await pool.query(
                `SELECT product_id as "productId", name, price, quantity, image_url as image, delivery_charge as "deliveryCharge", selected_variations as "selectedVariations"
         FROM order_items
         WHERE order_id = $1`,
                [row.id]
            );

            orders.push({
                ...row,
                date: row.date.toISOString(),
                subtotal: Number(row.subtotal),
                shipping: Number(row.shipping),
                total: Number(row.total),
                codTax: Number(row.codTax || 0),
                itemsCount: Number(row.itemsCount),
                items: itemsRes.rows.map(i => ({
                    ...i,
                    price: Number(i.price),
                    productId: String(i.productId),
                    deliveryCharge: Number(i.deliveryCharge || 0),
                    selectedVariations: i.selectedVariations
                }))
            });
        }

        return orders;
    },

    async updateStatus(id: string, status: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get current order details
            const orderRes = await client.query('SELECT user_id, order_number, status, total FROM orders WHERE id = $1', [id]);
            if (orderRes.rows.length === 0) throw new Error('Order not found');
            const order = orderRes.rows[0];

            // 2. Handle Stock Restore if Cancelled
            if (status === 'Cancelled' && order.status !== 'Cancelled') {
                const itemsRes = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
                for (const item of itemsRes.rows) {
                    await client.query('UPDATE products SET stock = stock + $1, sales_count = GREATEST(0, sales_count - $1) WHERE id = $2', [item.quantity, item.product_id]);
                }
            }

            // 3. Update Status
            await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

            // 4. Create User Notification
            await client.query(
                `INSERT INTO notifications (user_id, title, message, type, order_id)
                 VALUES ($1, $2, $3, 'info', $4)`,
                [order.user_id, 'Order Status Updated', `Your order #${order.order_number} is now ${status}.`, order.id]
            );

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },


    async findByOrderNumberAndEmail(orderNumber: string, email: string): Promise<Order | null> {
        const orderRes = await pool.query(
            `SELECT id, order_number as "orderNumber", user_id as "userId", date, status, 
              items_count as "itemsCount", subtotal, shipping, total, cod_tax as "codTax",
              payment_method as "paymentMethod", shipping_name as "shippingName", 
              shipping_email as "shippingEmail", shipping_phone as "shippingPhone", 
              shipping_address as "shippingAddress", shipping_city as "shippingCity", 
              shipping_postal_code as "shippingPostalCode", shipping_notes as "shippingNotes"
       FROM orders
       WHERE order_number = $1 AND (guest_email = $2 OR shipping_email = $2)`,
            [orderNumber, email]
        );

        if (orderRes.rows.length === 0) return null;

        const row = orderRes.rows[0];
        const itemsRes = await pool.query(
            `SELECT product_id as "productId", name, price, quantity, image_url as image, delivery_charge as "deliveryCharge", selected_variations as "selectedVariations"
         FROM order_items
         WHERE order_id = $1`,
            [row.id]
        );

        return {
            ...row,
            date: row.date.toISOString(),
            subtotal: Number(row.subtotal),
            shipping: Number(row.shipping),
            total: Number(row.total),
            codTax: Number(row.codTax || 0),
            itemsCount: Number(row.itemsCount),
            items: itemsRes.rows.map(i => ({
                ...i,
                price: Number(i.price),
                productId: String(i.productId),
                deliveryCharge: Number(i.deliveryCharge || 0),
                selectedVariations: i.selectedVariations
            }))
        };
    },

    async delete(id: string): Promise<void> {
        await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    }
};
