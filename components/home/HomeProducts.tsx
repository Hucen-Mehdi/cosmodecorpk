"use client";

import { useState } from 'react';
import { Product } from '@/src/api/api';
import { ProductCard } from '@/src/components/ProductCard';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface HomeProductsProps {
    products: Product[];
}

export function HomeProducts({ products }: HomeProductsProps) {
    const [displayCount, setDisplayCount] = useState(24);

    const visibleProducts = products.slice(0, displayCount);
    const hasMore = displayCount < products.length;

    return (
        <section className="py-8 sm:py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 italic">Best Sellers</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">Our most loved products by customers across Pakistan</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {hasMore ? (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setDisplayCount(prev => prev + 12)}
                            className="inline-flex items-center gap-2 bg-rose-500 text-white px-10 py-4 rounded-full font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 dark:shadow-none hover:scale-105 active:scale-95"
                        >
                            Show More Products <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="mt-12 text-center">
                        <Link
                            href="/products?filter=bestseller"
                            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-8 py-3 rounded-full font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            View All Best Sellers <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
