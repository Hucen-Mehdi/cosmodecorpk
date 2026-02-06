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
    categoryIds?: string[];

    subcategory?: string;
    rating: number;
    reviews: number;
    badge?: string;
    description?: string;
    stock: number;
    deliveryCharge?: number;
    variations?: Variation[];
    additionalImages?: string[];
}

export interface Variation {
    name: string;
    options: string[];
    required: boolean;
    priceAdjustments: { [key: string]: number };
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

export async function searchProducts(query: string, category?: string) {
    if (!API_BASE_URL || query.length < 2) return { products: [], total: 0, categories: [] };

    const params = new URLSearchParams();
    params.append('q', query);
    if (category) params.append('category', category);

    try {
        const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('❌ Search error:', error);
        return { products: [], total: 0, categories: [] };
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

// Reviews
export interface Review {
    id: number;
    product_id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    reviewer_email: string;
    review_date: string;
    picture_urls?: string[];
    verified_purchase: boolean;
}

export async function fetchReviews(productId: number) {
    if (!API_BASE_URL) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${productId}`, { cache: 'no-store' });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

export async function submitReview(data: Omit<Review, 'id' | 'review_date' | 'verified_purchase'>) {
    if (!API_BASE_URL) throw new Error('API URL not configured');
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to submit review');
    return result;
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
