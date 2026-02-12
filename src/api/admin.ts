import { Product, Category } from './api';

import { API_BASE_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export async function fetchAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}

// Categories
export async function fetchAdminCategories() {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
}

// Categories
export async function createCategory(data: Partial<Category>) {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
    }
    return response.json();
}

export async function updateCategory(id: string, data: Partial<Category>) {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
    }
    return response.json();
}
export async function deleteCategory(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
    }
    return true;
}

export async function updateCategoryProducts(id: string, productIds: number[]) {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}/products`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productIds })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category products');
    }
    return response.json();
}

// Products
export async function createProduct(data: Partial<Product>) {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
    }
    return response.json();
}

export async function updateProduct(id: number, data: Partial<Product>) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
    }
    return response.json();
}

export async function deleteProduct(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
    }
    return true;
}
export async function fetchNotifications() {
    const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
}

export async function markNotificationAsRead(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
}

// Product Sorting
export async function fetchSortingQueue(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/product-sorting/sorting-queue${query}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch sorting queue');
    return response.json();
}

export async function updateProductSortOrder(items: { id: number, position: number }[], categoryId?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/product-sorting/sort-order`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items, categoryId })
    });
    if (!response.ok) throw new Error('Failed to update sort order');
    return response.json();
}

export async function updateProductFeatured(id: number, isFeatured: boolean) {
    const response = await fetch(`${API_BASE_URL}/admin/product-sorting/${id}/feature`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isFeatured })
    });
    if (!response.ok) throw new Error('Failed to update featured status');
    return response.json();
}

// Hero Slides
export async function fetchAdminHeroSlides() {
    const response = await fetch(`${API_BASE_URL}/admin/hero`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch hero slides');
    return response.json();
}

export async function createHeroSlide(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/hero`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create hero slide');
    return response.json();
}

export async function updateHeroSlide(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/hero/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update hero slide');
    return response.json();
}

export async function deleteHeroSlide(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/hero/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete hero slide');
    return response.json();
}

export async function updateHeroSlideOrder(items: { id: number, order_index: number }[]) {
    const response = await fetch(`${API_BASE_URL}/admin/hero/order`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items })
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
}

// Reviews
export async function fetchAdminReviews() {
    const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
}

export async function deleteReview(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return true;
}

