import { fetchProductById, fetchProducts, Product } from '@/src/api/api';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import Link from 'next/link';

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const product = await fetchProductById(Number(params.id));
        const title = `${product.name} | CosmoDecorPK`;
        const description = product.description.slice(0, 160);

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [
                    {
                        url: product.image,
                        alt: product.name,
                    }
                ],
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [product.image],
            },
        };
    } catch (error) {
        return {
            title: 'Product Not Found | CosmoDecorPK',
        };
    }
}

// ... (existing imports and code)

export async function generateStaticParams() {
    try {
        const products = await fetchProducts();
        return products.map((product: Product) => ({
            id: product.id.toString(),
        }));
    } catch (e) {
        console.error("Error generating static params for products:", e);
        return [];
    }
}

export default async function ProductPage({ params }: Props) {
    // ... (rest of the component)
    const { id } = params;

    let product: Product | null = null;
    let relatedProducts: Product[] = [];

    try {
        product = await fetchProductById(Number(id));
        // Fetch related products
        if (product) {
            const allProducts = await fetchProducts({ category: product.category });
            relatedProducts = allProducts.filter((p: Product) => p.id !== product!.id).slice(0, 4);
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Product Not Found</h1>
                    <Link href="/products" className="text-rose-500 hover:underline">
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description || "",
        "sku": `CDP-${product.id}`,
        "brand": {
            "@type": "Brand",
            "name": "CosmoDecorPK"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "PKR",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 5,
            "reviewCount": product.reviews || 1
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
