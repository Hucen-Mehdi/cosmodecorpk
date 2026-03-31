"use client";

import Link from 'next/link';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/src/components/ProductCard';
import { useAuth } from '@/src/context/AuthContext';
import { fetchWishlist, removeFromWishlist } from '@/src/api/wishlist';
import { Product } from '@/src/api/api';

export default function WishlistClient() {
    const { user, token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !token) {
            setLoading(false);
            return;
        }

        fetchWishlist(token).then(data => {
            setProducts(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, token]);

    const handleRemove = async (productId: number) => {
        if (!token) return;

        const success = await removeFromWishlist(token, productId);
        if (success) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center">
                    <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Sign In Required</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in to view your wishlist</p>
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                        Sign In <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center">
                    <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your Wishlist is Empty</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Start adding items you love!</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                        Browse Products <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center">
                        <Heart className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Wishlist</h1>
                        <p className="text-gray-600 dark:text-gray-400">{products.length} items saved</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="relative group">
                            <ProductCard product={product} />
                            <button
                                onClick={() => handleRemove(product.id)}
                                className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                title="Remove from wishlist"
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
