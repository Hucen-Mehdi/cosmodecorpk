import { API_BASE_URL as BASE_URL } from './config';
const API_BASE_URL = `${BASE_URL}/account`;

export interface Profile {
    id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'admin' | 'user';
}

export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    itemsCount: number;
    status: 'Delivered' | 'In Progress' | 'Cancelled';
    total: number;
}

export interface Address {
    id: string;
    label: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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

export const getProfile = (): Promise<Profile> => fetchWithAuth(`${API_BASE_URL}/profile`);

export const updateProfile = (profileUpdate: Partial<Profile>): Promise<Profile> =>
    fetchWithAuth(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileUpdate)
    });

export const getAddresses = (): Promise<Address[]> => fetchWithAuth(`${API_BASE_URL}/addresses`);

export const createAddress = (address: Omit<Address, 'id'>): Promise<Address> =>
    fetchWithAuth(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        body: JSON.stringify(address)
    });

export const updateAddress = (id: string, address: Partial<Address>): Promise<Address> =>
    fetchWithAuth(`${API_BASE_URL}/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(address)
    });

export const deleteAddress = (id: string): Promise<void> =>
    fetchWithAuth(`${API_BASE_URL}/addresses/${id}`, {
        method: 'DELETE'
    });

export const getWishlist = (): Promise<string[]> => fetchWithAuth(`${API_BASE_URL}/wishlist`);

export const addToWishlist = (productId: string): Promise<string[]> =>
    fetchWithAuth(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        body: JSON.stringify({ productId })
    });

export const removeFromWishlist = (productId: string): Promise<string[]> =>
    fetchWithAuth(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE'
    });
