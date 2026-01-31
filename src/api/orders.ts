import { API_BASE_URL as BASE_URL } from './config';
const API_BASE_URL = `${BASE_URL}/orders`;

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    date: string;
    status: "Pending" | "Processing" | "On Hold" | "Shipped" | "Completed" | "Cancelled";
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
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
}

export const createOrder = (payload: {
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod: string;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode?: string;
    shippingNotes?: string;
}): Promise<Order> =>
    fetchWithAuth(`${API_BASE_URL}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const getMyOrders = (): Promise<Order[]> =>
    fetchWithAuth(`${API_BASE_URL}/my`);

export const getAllOrdersAdmin = (): Promise<Order[]> =>
    fetchWithAuth(`${BASE_URL}/admin/orders`);

export const updateOrderStatusAdmin = (id: string, status: string): Promise<void> =>
    fetchWithAuth(`${BASE_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });

export const deleteOrderAdmin = (id: string): Promise<void> =>
    fetchWithAuth(`${BASE_URL}/admin/orders/${id}`, {
        method: 'DELETE'
    });
