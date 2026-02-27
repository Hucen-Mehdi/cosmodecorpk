export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ArrowRight, Truck, Shield, CreditCard, Headphones, Star } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/src/components/ProductCard';
import { fetchProducts, fetchCategories, fetchTestimonials, Product, Category } from '@/src/api/api';
import { HeroSlider } from '@/components/home/HeroSlider';
import { HomeProducts } from '@/components/home/HomeProducts';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
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
    let testimonials: any[] = [];

    try {
        const [productsData, categoriesData, testimonialsData] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchTestimonials()
        ]);
        products = productsData;
        categories = categoriesData;
        testimonials = testimonialsData;
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
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.id}`}
                            className="flex flex-col items-center gap-3 min-w-[100px] snap-center group flex-shrink-0"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-rose-500 transition-all p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-sm">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 text-center group-hover:text-rose-500 transition-colors line-clamp-2 max-w-[120px]">
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
            {testimonials.length > 0 && (
                <section className="py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200 border-t dark:border-gray-900">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Customer Reviews</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">See what our customers are saying</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {testimonials.map((testimonial, idx) => (
                                <div key={testimonial.id} className="relative">
                                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-xs leading-relaxed flex-grow line-clamp-4">
                                            "{testimonial.text}"
                                        </p>
                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white text-xs">{testimonial.name}</h4>
                                                <p className="text-[10px] text-gray-500">{testimonial.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mobile separator line */}
                                    {idx !== testimonials.length - 1 && (
                                        <div className="md:hidden absolute -bottom-2 left-6 right-6 h-px bg-gray-100 dark:bg-gray-800" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}


        </div>
    );
}
