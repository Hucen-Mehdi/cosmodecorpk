export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { fetchProducts, fetchCategories, Product, Category } from '@/src/api/api';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cosmodecorpk.com';

    // Fetch products and categories
    let products: Product[] = [];
    let categories: Category[] = [];

    try {
        [products, categories] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
        ]);
    } catch (error) {
        console.error('Error fetching data for sitemap:', error);
    }

    // Static routes
    const routes = [
        '',
        '/products',
        '/about',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product routes
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Dynamic category routes
    const categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
}
