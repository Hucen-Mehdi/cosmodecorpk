import { fetchProducts, fetchCategories } from '@/src/api/api';
import ProductsClient from './ProductsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Products | CosmoDecorPK - Premium Home Decor',
    description: 'Explore our full range of premium artificial plants, silk flowers, vases, and home decor. Nationwide delivery across Pakistan with the best quality guaranteed.',
    openGraph: {
        title: 'All Products | CosmoDecorPK - Premium Home Decor',
        description: 'Explore our full range of premium artificial plants, silk flowers, vases, and home decor.',
        images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'All Products | CosmoDecorPK - Premium Home Decor',
        description: 'Explore our full range of premium artificial plants and home decor.',
        images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop'],
    },
};

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const products = await fetchProducts();
    const categories = await fetchCategories();

    return <ProductsClient initialProducts={products} initialCategories={categories} searchParams={searchParams} />;
}
