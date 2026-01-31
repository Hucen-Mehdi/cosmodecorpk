"use client";

import { useState } from 'react';
import { ChevronRight, Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/context/CartContext';
import { ProductCard } from '@/src/components/ProductCard';
import { Product } from '@/src/api/api';

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
    };

    const handleBuyNow = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Link href="/" className="hover:text-rose-500">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/products" className="hover:text-rose-500">Products</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href={`/category/${product.category || ''}`} className="hover:text-rose-500 capitalize">
                            {(product.category || 'Category').replace('-', ' ')}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-800 dark:text-white">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border dark:border-gray-800">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {product.badge && (
                                <span className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${product.badge === 'Sale' ? 'bg-red-500 text-white' :
                                    product.badge === 'New' ? 'bg-green-500 text-white' :
                                        product.badge === 'Bestseller' ? 'bg-amber-500 text-white' :
                                            'bg-rose-500 text-white'
                                    }`}>
                                    {product.badge}
                                </span>
                            )}
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white'
                                    }`}
                            >
                                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{product.rating} ({product.reviews} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-bold text-rose-500">{formatPrice(product.price)}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-xl text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                                        Save {discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{product.description}</p>

                        {/* Quantity */}
                        <div className="mb-8">
                            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-3">Quantity</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="w-16 text-center font-semibold text-lg dark:text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">Only 12 items left!</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 border-2 border-rose-500 text-rose-500 py-4 rounded-xl font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                            >
                                Buy Now
                            </button>
                            <button className="w-14 h-14 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Truck className="w-6 h-6 text-rose-500" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Fast Delivery</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Shield className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">1 Year Warranty</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <RotateCcw className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Easy Returns</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
