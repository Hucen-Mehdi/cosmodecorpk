
import { Order } from '../repositories/orderRepository';

export const sendOrderConfirmationEmail = async (order: Order) => {
    // This is a placeholder for email service integration (e.g. Nodemailer, SendGrid)
    // In a production environment, you would configure SMTP settings here.

    const recipient = order.userId ? order.userEmail : order.guestEmail || order.shippingEmail;

    if (!recipient) {
        console.warn(`⚠️ Cannot send email confirmation: No valid email found for order ${order.orderNumber}`);
        return;
    }

    console.log(`
    📧 [EMAIL SIMULATION] Sending Order Confirmation
    ---------------------------------------------------
    To: ${recipient}
    Subject: Your CosmoDecorPK Order #${order.orderNumber} Confirmed!
    
    Dear ${order.shippingName || 'Customer'},
    
    Thank you for your order!
    Order ID: ${order.orderNumber}
    Total Amount: Rs. ${order.total.toLocaleString()}
    
    Track your order here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order
    
    Items:
    ${order.items.map(item => `- ${item.name} x${item.quantity}`).join('\n')}
    
    We will notify you when it ships!
    ---------------------------------------------------
    `);
};
