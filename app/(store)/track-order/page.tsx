
"use client";

import { useState } from 'react';
import { Search, Loader2, Package, MapPin, CreditCard, Calendar, Truck, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/src/api/config';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    deliveryCharge?: number;
    selectedVariations?: { [key: string]: string };
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod?: string;
    shippingName?: string;
    shippingEmail?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingPostalCode?: string;
}

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState<Order | null>(null);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber || !email) {
            setError('Please enter both Order Number and Email');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const res = await fetch(`${API_BASE_URL}/orders/track?orderNumber=${orderNumber}&email=${email}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Order not found');
            }

            setOrder(data);
        } catch (err: any) {
            setError(err.message || 'Failed to track order');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
    return 'Rs ' + Math.round(price).toLocaleString('en-US');
  };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            case 'processing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Track Your Order</h1>
                    <p className="text-gray-500 dark:text-gray-400">Enter your order ID and email to check the status of your shipment.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border dark:border-gray-800">
                    <form onSubmit={handleTrackOrder} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Order ID *
                                </label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                    placeholder="ORD-2024XXXX"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Used usering checkout"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                            Track Order
                        </button>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2 mt-4">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Order Details */}
                {order && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border dark:border-gray-800 overflow-hidden animate-fade-in-up">
                        {/* Order Header */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order {order.orderNumber}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Placed on {formatDate(order.date)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                            </div>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* Shipping Info */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Shipping Details
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p className="font-semibold text-gray-800 dark:text-white">{order.shippingName}</p>
                                    <p>{order.shippingAddress}</p>
                                    <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                                    <p>{order.shippingPhone}</p>
                                    <p>{order.shippingEmail}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Payment Information
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300">
                                    <p className="capitalize font-medium text-gray-800 dark:text-white mb-1">
                                        Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                    </p>
                                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Shipping</span>
                                        <span>{formatPrice(order.shipping)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-gray-800 dark:text-white">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6 border-t dark:border-gray-800">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Items ({order.items.length})
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{item.name}</h4>
                                            {item.selectedVariations && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(item.selectedVariations).map(([k, v]) => (
                                                        <span key={k} className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border dark:border-gray-700">
                                                            {k}: {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                            <p className="font-bold text-gray-800 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
