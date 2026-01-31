export interface Category {
    id: string;
    name: string;
    icon: string;
    image: string;
    subcategories?: { id: string; name: string }[];
}

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;

    // ✅ THIS MUST MATCH API
    category: string;

    subcategory?: string;
    rating: number;
    reviews: number;
    badge?: string;
    description?: string;
    stock: number;
}


import { API_BASE_URL } from './config';

export async function fetchProducts(filters: { category?: string; subcategory?: string; search?: string } = {}) {
    if (!API_BASE_URL) return [];
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.subcategory) params.append('subcategory', filters.subcategory);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    const url = `${API_BASE_URL}/products${query ? `?${query}` : ''}`;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('❌ Fetch error:', error);
        return [];
    }
}

export async function fetchProductById(id: number) {
    if (!API_BASE_URL) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export async function fetchCategories() {
    if (!API_BASE_URL) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

export async function fetchTestimonials() {
    if (!API_BASE_URL) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials`, { cache: 'no-store' });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

export async function submitContactForm(data: { name: string; email: string; subject?: string; message: string }) {
    if (!API_BASE_URL) throw new Error('API URL not configured');
    const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to submit form');
    return result;
}
