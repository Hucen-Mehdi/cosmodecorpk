export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ArrowRight, Truck, Shield, CreditCard, Headphones, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/src/components/ProductCard';

const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
import { fetchProducts, fetchCategories, fetchRecentReviews, Product, Category } from '@/src/api/api';
import { HeroSlider } from '@/components/home/HeroSlider';
import { HomeProducts } from '@/components/home/HomeProducts';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
import { ReviewsCarousel } from '@/components/home/ReviewsCarousel';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CosmoDecorPK - Pakistan No.1 Home Decor & Artificial Plants Store',
    description: 'Shop premium quality artificial plants, home decor, wall decor, room decor, wedding decor and gift items in Pakistan. Best prices in Karachi, Lahore, Islamabad. Fast delivery across Pakistan.',
    keywords: "Home Decor Pakistan, Artificial Plants Pakistan, Decoration Items, Modern Home Decor, Wall Decor, Room Decor, Wedding Decor, Gift Items, Artificial Flowers, Home Accessories, Luxury Decor, Pakistani Decor Brands, Best Home Decor Store, Online Decor Shopping Pakistan, Interior Design Ideas, Furniture Pakistan, Rustic Decor, Minimalist Decor, Plant Decor, Office Decor, CosmoDecorPK",
    openGraph: {
        title: 'CosmoDecorPK - Pakistan No.1 Home Decor & Artificial Plants Store',
        description: 'Transform your space with CosmoDecorPK - Pakistan\'s premium home decor brand. Shop lifelike artificial plants, floral arrangements, and elegant decor items.',
        url: 'https://cosmodecorpk.com',
        siteName: 'CosmoDecorPK Pakistan',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop',
                width: 1200,
                height: 630,
                alt: 'CosmoDecorPK Home Decor Pakistan',
            },
        ],
        locale: 'en_PK',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CosmoDecorPK | Premium Artificial Plants & Home Decor in Pakistan',
        description: 'Transform your space with CosmoDecorPK - Pakistan\'s premium home decor brand.',
        images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop'],
    },
};

export default async function Home() {
    let products: Product[] = [];
    let categories: Category[] = [];
    let reviews: any[] = [];

    try {
        const [productsData, categoriesData, reviewsData] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchRecentReviews(100)
        ]);
        products = productsData;
        categories = categoriesData;
        reviews = reviewsData;
    } catch (error) {
        console.error('Error loading home data:', error);
    }

    // Separate featured and general products
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 10);
    const otherProducts = products
        .filter(p => !p.isFeatured)
        .sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000))
        .slice(0, 40);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <HeroSlider />



            {/* Categories Section - Moved Up */}
            <section className="py-6 max-w-7xl mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Shop by Category</h2>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.id}`}
                            className="flex flex-col items-center gap-3 min-w-[100px] snap-center group flex-shrink-0"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-rose-500 transition-all p-1">
                                <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-sm">
                                    <Image
                                        src={category.image || '/placeholder.png'}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 640px) 100px, 120px"
                                        priority={index < 4}
                                        placeholder="blur"
                                        blurDataURL={blurDataURL}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 text-center group-hover:text-primary transition-colors line-clamp-2 max-w-[120px]">
                                {category.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Section */}
            <FeaturedProductsCarousel products={featuredProducts} />

            {/* Home Products Section */}
            <HomeProducts products={otherProducts} />

            {/* Testimonials - Smaller & Compact */}
            {reviews.length > 0 && (
                <ReviewsCarousel initialReviews={reviews} />
            )}


        </div>
    );
}
