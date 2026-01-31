import { fetchProductById, fetchProducts, Product } from '@/src/api/api';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import Link from 'next/link';

/**
 * ✅ Force runtime rendering (NO build-time fetching)
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string };
};

/**
 * ✅ SAFE metadata (NO API calls at build time)
 * Dynamic SEO is handled via JSON-LD inside the page instead
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Product | CosmoDecorPK`,
    description: 'Explore premium home decor products at CosmoDecorPK.',
  };
}

/**
 * ❌ REMOVED generateStaticParams
 * This was the main cause of your Vercel build failure
 */

export default async function ProductPage({ params }: Props) {
  const { id } = params;

  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    product = await fetchProductById(Number(id));

    if (product) {
      const allProducts = await fetchProducts({ category: product.category });
      relatedProducts = allProducts
        .filter((p: Product) => p.id !== product!.id)
        .slice(0, 4);
    }
  } catch (error) {
    console.error('Error loading product:', error);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Product Not Found
          </h1>
          <Link href="/products" className="text-rose-500 hover:underline">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  /**
   * ✅ Runtime SEO via JSON-LD (safe on Vercel)
   */
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description || "",
    sku: `CDP-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "CosmoDecorPK",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 5,
      reviewCount: product.reviews || 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
