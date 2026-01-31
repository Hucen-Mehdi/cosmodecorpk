"use client";

import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/src/context/CartContext';

export default function CartClient() {
    const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const deliveryFee = totalPrice > 10000 ? 0 : 500;
    const finalTotal = totalPrice + deliveryFee;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center">
                    <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                        Start Shopping <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Shopping Cart ({items.length} items)</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-row gap-4 sm:gap-6 border dark:border-gray-800">
                                <Link href={`/product/${item.id}`} className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <div>
                                            <Link href={`/product/${item.id}`} className="font-semibold text-gray-800 dark:text-white hover:text-rose-500 text-base sm:text-lg line-clamp-1 sm:line-clamp-none">
                                                {item.name}
                                            </Link>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category.replace('-', ' ')}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 w-fit">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-lg sm:text-xl font-bold text-rose-500">{formatPrice(item.price * item.quantity)}</p>
                                            {item.quantity > 1 && (
                                                <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">{formatPrice(item.price)} each</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-red-500 hover:underline text-sm"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm sticky top-24 border dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Order Summary</h2>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Promo code"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:border-rose-400"
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                                    <span className="font-medium dark:text-gray-100">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Delivery</span>
                                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-500' : 'dark:text-gray-100'}`}>
                                        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                                    </span>
                                </div>
                                {deliveryFee > 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Add {formatPrice(10000 - totalPrice)} more for free delivery
                                    </p>
                                )}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                                        <span className="text-2xl font-bold text-rose-500">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full mt-6 bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                            >
                                Proceed to Checkout <ArrowRight className="w-5 h-5" />
                            </Link>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">We Accept</p>
                                <div className="flex justify-center gap-2">
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-bold">NayaPay</span>
                                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-bold">JazzCash</span>
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold">EasyPaisa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
