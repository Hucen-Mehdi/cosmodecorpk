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
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.subcategory) params.append('subcategory', filters.subcategory);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    const url = `${API_BASE_URL}/products${query ? `?${query}` : ''}`;

    console.log('🌐 Fetching from URL:', url);

    try {
        const response = await fetch(url);
        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
            console.error('❌ Response not OK:', response.status);
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('📦 Received data:', Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
        return data;
    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}

export async function fetchProductById(id: number) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    return response.json();
}

export async function fetchCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
}

export async function fetchTestimonials() {
    const response = await fetch(`${API_BASE_URL}/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return response.json();
}

export async function submitContactForm(data: { name: string; email: string; subject?: string; message: string }) {
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
