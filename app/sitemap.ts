import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cosmodecorpk.com';

    // Fully static sitemap to prevent build-time API failures on Vercel
    const routes = [
        '',
        '/products',
        '/about',
        '/contact',
        '/login',
        '/signup',
        '/cart',
        '/wishlist',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
