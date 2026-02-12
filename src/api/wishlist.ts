import { API_BASE_URL } from './config';
import { Product } from './api';

export async function fetchWishlist(token: string): Promise<Product[]> {
    if (!API_BASE_URL || !token) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

export async function addToWishlist(token: string, productId: number): Promise<boolean> {
    if (!API_BASE_URL || !token) return false;
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function removeFromWishlist(token: string, productId: number): Promise<boolean> {
    if (!API_BASE_URL || !token) return false;
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function checkInWishlist(token: string, productId: number): Promise<boolean> {
    if (!API_BASE_URL || !token) return false;
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.inWishlist;
    } catch {
        return false;
    }
}
