
"use client";

import Link from 'next/link';
import { ProductCard } from '@/src/components/ProductCard';
import { Product } from '@/src/api/api';
import { ArrowRight, Star } from 'lucide-react';

export function FeaturedProductsCarousel({ products }: { products: Product[] }) {
    if (products.length === 0) return null;

    return (
        <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-200 border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Featured Collection
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Handpicked premium decor items</p>
                </div>
                <Link href="/products?sort=featured" className="text-rose-500 font-bold hover:underline flex items-center gap-1 text-sm sm:text-base">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                    {products.map(product => (
                        <div key={product.id} className="min-w-[260px] sm:min-w-[300px] snap-center">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
