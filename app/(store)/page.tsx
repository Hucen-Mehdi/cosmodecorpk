export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ArrowRight, Truck, Shield, CreditCard, Headphones, Star } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/src/components/ProductCard';
import { fetchProducts, fetchCategories, fetchTestimonials, Product, Category } from '@/src/api/api';
import { HeroSlider } from '@/components/home/HeroSlider';
import { HomeProducts } from '@/components/home/HomeProducts';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CosmoDecorPK | Premium Artificial Plants & Home Decor in Pakistan',
    description: 'Transform your space with CosmoDecorPK - Pakistan\'s premium home decor brand. Shop lifelike artificial plants, floral arrangements, and elegant decor items with fast nationwide delivery.',
    openGraph: {
        title: 'CosmoDecorPK | Premium Artificial Plants & Home Decor in Pakistan',
        description: 'Transform your space with CosmoDecorPK - Pakistan\'s premium home decor brand. Shop lifelike artificial plants, floral arrangements, and elegant decor items.',
        url: 'https://cosmodecorpk.com',
        siteName: 'CosmoDecorPK',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop',
                width: 1200,
                height: 630,
                alt: 'CosmoDecorPK Home Decor',
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

    // Optimized filtering: Get Best Sellers (by rating) for the home page
    const bestSellers = [...products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 100); // Take top 100 products to browse on home page

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            <HeroSlider />

            {/* Features Bar */}
            <section className="bg-white dark:bg-gray-900 py-8 shadow-sm border-b dark:border-gray-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Fast Delivery</h4>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Across all of Pakistan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Quality Guarantee</h4>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Premium quality decor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Secure Payment</h4>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">JazzCash, EasyPaisa, NayaPay</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">WhatsApp Support</h4>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Quick responses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section - Circle Layout */}
            <section className="py-12 max-w-7xl mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Shop by Category</h2>
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

            {/* Home Products Section */}
            <HomeProducts products={bestSellers} />

            {/* Promo Banners */}
            <section className="py-16 max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=400&fit=crop"
                            alt="Artificial Plants"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-600/50" />
                        <div className="absolute inset-0 flex items-center p-8">
                            <div className="text-white">
                                <p className="text-lg mb-2">🌿 New Collection</p>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">Artificial Plants<br />Up to 40% Off</h3>
                                <Link
                                    href="/category/artificial-plants"
                                    className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    Shop Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=400&fit=crop"
                            alt="Ramadan Collection"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 to-amber-600/50" />
                        <div className="absolute inset-0 flex items-center p-8">
                            <div className="text-white">
                                <p className="text-lg mb-2">🌙 Seasonal</p>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">Ramadan<br />Decor Collection</h3>
                                <Link
                                    href="/category/ramadan-decor"
                                    className="inline-flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    Explore <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950 transition-colors duration-200 border-t dark:border-gray-900">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Customer Reviews</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">See what our customers are saying</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, idx) => (
                                <div key={testimonial.id} className="relative">
                                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
                                            "{testimonial.text}"
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{testimonial.name}</h4>
                                                <p className="text-xs text-gray-500">{testimonial.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mobile separator line for list view feel if stacked, though grid handles it */}
                                    {idx !== testimonials.length - 1 && (
                                        <div className="md:hidden absolute -bottom-3 left-6 right-6 h-px bg-gray-100 dark:bg-gray-800" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Instagram Feed */}
            <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Follow Us on Instagram</h2>
                        <p className="text-gray-600 dark:text-gray-400">@cosmodecorpk</p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                            'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&h=300&fit=crop'
                        ].map((img, i) => (
                            <a key={i} href="#" className="aspect-square overflow-hidden rounded-lg group">
                                <img
                                    src={img}
                                    alt={`Instagram ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
