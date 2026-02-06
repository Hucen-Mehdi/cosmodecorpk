"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import { createOrder, OrderItem } from '@/src/api/orders';
import {
    MapPin, Phone, User, Mail, CreditCard, Truck, CheckCircle,
    ArrowLeft, Shield, Clock, ChevronRight, Package, Copy, MessageCircle, AlertCircle,
    Loader2
} from 'lucide-react';

type PaymentMethod = 'nayapay' | 'jazzcash' | 'easypaisa' | 'cod';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
}

export default function CheckoutClient() {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [copiedAccount, setCopiedAccount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [confirmedTotal, setConfirmedTotal] = useState(0);
    const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
    const [confirmedDeliveryFee, setConfirmedDeliveryFee] = useState(0);
    const [confirmedItems, setConfirmedItems] = useState<any[]>([]);

    // Calculate total delivery fee by summing up delivery charges of all items
    const deliveryFee = items.reduce((sum, item) => sum + ((item as any).deliveryCharge || 0) * item.quantity, 0);
    const finalTotal = totalPrice + deliveryFee;

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});

    const whatsappNumber = '923209937113';
    const whatsappDisplayNumber = '+92 320 9937113';

    const paymentAccounts = [
        {
            id: 'nayapay' as const,
            name: 'NayaPay',
            icon: '🏦',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-500',
            accountTitle: 'CosmoDecor PK',
            accountNumber: '0332-5932181',
        },
        {
            id: 'jazzcash' as const,
            name: 'JazzCash',
            icon: '📱',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-500',
            accountTitle: 'CosmoDecor PK',
            accountNumber: '0332-5932181',
        },
        {
            id: 'easypaisa' as const,
            name: 'Easypaisa',
            icon: '💚',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500',
            accountTitle: 'CosmoDecor PK',
            accountNumber: '0332-5932181',
        },
        {
            id: 'cod' as const,
            name: 'Cash on Delivery (COD)',
            icon: '🚚',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            accountTitle: 'Payment on Delivery',
            accountNumber: 'Pay when you receive',
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const cities = [
        'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
        'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
        'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Other'
    ];

    useEffect(() => {
        if (user && formData.email === '') {
            const names = user.name.split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || names[0] || '',
                lastName: prev.lastName || names.slice(1).join(' ') || '',
                email: prev.email || user.email || ''
            }));
        }
    }, [user]);

    const getWhatsAppLink = (id?: string) => {
        const currentOrderId = id || orderId;
        const targetItems = orderPlaced ? confirmedItems : items;
        const targetSubtotal = orderPlaced ? confirmedSubtotal : totalPrice;
        const targetDeliveryFee = orderPlaced ? confirmedDeliveryFee : deliveryFee;
        const targetTotal = orderPlaced ? confirmedTotal : finalTotal;

        const itemsList = targetItems.map(item => {
            const vars = item.selectedVariations ? Object.entries(item.selectedVariations).map(([k, v]) => `[${k}: ${v}]`).join(' ') : '';
            const unitDc = (item as any).deliveryCharge || 0;
            return `- ${item.name} ${vars}\n  Qty: ${item.quantity} x ${formatPrice(item.price)} ${unitDc > 0 ? `(+ ${formatPrice(unitDc)} DC/unit)` : ''}`;
        }).join('\n');

        const isCod = paymentMethod === 'cod';
        const methodDisplay = isCod ? 'Cash on Delivery (COD)' : `${paymentAccounts.find(p => p.id === paymentMethod)?.name} (Advance Payment)`;

        const message = encodeURIComponent(
            `Hi CosmoDecorPK! 🏠\n\n` +
            `I have placed an${isCod ? ' ' : ' (Advance) '}order.\n\n` +
            `📦 Order Details:\n` +
            `Order ID: ${currentOrderId}\n` +
            `Items:\n${itemsList}\n\n` +
            `------------------------\n` +
            `Subtotal: ${formatPrice(targetSubtotal)}\n` +
            `Delivery Charges: ${formatPrice(targetDeliveryFee)}\n` +
            `Grand Total: ${formatPrice(targetTotal)}\n` +
            `------------------------\n` +
            `Payment Method: ${methodDisplay}\n\n` +
            `👤 Customer: ${formData.firstName} ${formData.lastName}\n` +
            `📱 Phone: ${formData.phone}\n` +
            `📍 Address: ${formData.address}, ${formData.city}\n\n` +
            (isCod ? `Please confirm my order. I will pay upon delivery. ✅` : `I am attaching my payment screenshot below. ⬇️`)
        );
        return `https://wa.me/${whatsappNumber}?text=${message}`;
    };

    const handlePlaceOrder = async () => {
        if (!user) {
            setError('You must be logged in to place an order.');
            return;
        }

        if (!paymentMethod) {
            setError('Please select a payment method.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const orderItems: OrderItem[] = items.map(item => ({
                productId: item.id.toString(),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                deliveryCharge: (item as any).deliveryCharge || 0,
                selectedVariations: item.selectedVariations
            }));

            const newOrder = await createOrder({
                items: orderItems,
                subtotal: totalPrice,
                shipping: deliveryFee,
                total: finalTotal,
                paymentMethod,
                shippingName: `${formData.firstName} ${formData.lastName}`,
                shippingEmail: formData.email,
                shippingPhone: formData.phone,
                shippingAddress: formData.address,
                shippingCity: formData.city,
                shippingPostalCode: formData.postalCode,
                shippingNotes: formData.notes
            });

            setOrderId(newOrder.orderNumber);
            setConfirmedTotal(finalTotal);
            setConfirmedSubtotal(totalPrice);
            setConfirmedDeliveryFee(deliveryFee);
            setConfirmedItems([...items]);
            setOrderPlaced(true);

            // Automatic redirect to WhatsApp ONLY for Advance Payment
            if (paymentMethod !== 'cod') {
                const waLink = getWhatsAppLink(newOrder.orderNumber);
                setTimeout(() => {
                    window.open(waLink, '_blank');
                }, 1500);
            }

            clearCart();
        } catch (err: any) {
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors: Partial<FormData> = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^(03\d{9}|\+92\d{10})$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Invalid Pakistani phone number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && paymentMethod) {
            setStep(3);
        }
    };

    const copyToClipboard = (text: string, accountId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedAccount(accountId);
        setTimeout(() => setCopiedAccount(''), 2000);
    };

    if (items.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="text-center bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">You need to add some items to your cart before you can checkout.</p>
                    <Link href="/" className="inline-block bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (!user && !orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
                <div className="text-center bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Login Required</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">Please sign in to your account to complete your purchase and track your order.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/login" className="bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                            Sign In to Checkout
                        </Link>
                        <Link href="/cart" className="text-gray-500 dark:text-gray-400 hover:text-rose-500 font-medium py-2">
                            Return to Cart
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 sm:py-12 transition-colors duration-200">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-5 sm:p-8 border dark:border-gray-800">
                        {/* Success Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Order Placed Successfully!</h1>
                            <p className="text-gray-600 dark:text-gray-300">Thank you for shopping with CosmoDecorPK</p>
                        </div>

                        {/* Order ID */}
                        <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-2xl p-4 sm:p-6 mb-8 text-center border dark:border-rose-900/30">
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Your Order ID</p>
                            <p className="text-2xl sm:text-3xl font-bold text-rose-500">{orderId}</p>
                        </div>

                        {/* IMPORTANT: Payment Proof Section / COD Section */}
                        <div className="relative mb-8">
                            <div className={`absolute -inset-1 bg-gradient-to-r ${paymentMethod === 'cod' ? 'from-blue-500 via-indigo-500 to-blue-500' : 'from-rose-500 via-orange-500 to-rose-500'} rounded-2xl blur opacity-75 animate-pulse`}></div>
                            <div className={`relative bg-gradient-to-r ${paymentMethod === 'cod' ? 'from-blue-500 to-indigo-500' : 'from-rose-500 to-orange-500'} rounded-2xl p-1`}>
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6">
                                    {paymentMethod === 'cod' ? (
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Truck className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                                                    📦 order Received (COD)
                                                </h3>
                                                <div className="space-y-3 text-gray-700 dark:text-gray-200">
                                                    <p className="font-medium">
                                                        Your order has been received. You will pay <span className="text-blue-500 font-bold">{formatPrice(confirmedTotal)}</span> in cash when the rider delivers your package.
                                                    </p>
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-blue-300 dark:border-blue-700">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Next steps:</p>
                                                        <ul className="list-disc list-inside space-y-2 text-sm">
                                                            <li>Our team will call you for verification</li>
                                                            <li>Keep the exact amount ready for delivery</li>
                                                            <li>Delivery typically takes 3-5 working days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                            <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                                                    ⚠️ IMPORTANT: Send Payment Proof
                                                </h3>
                                                <div className="space-y-3 text-gray-700 dark:text-gray-200">
                                                    <p className="font-medium">
                                                        To confirm your order, you <span className="text-rose-500 font-bold">MUST</span> send the
                                                        <span className="bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 px-2 py-0.5 rounded font-bold mx-1">screenshot of your payment</span>
                                                        to our WhatsApp number.
                                                    </p>
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-rose-300 dark:border-rose-700">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Steps to complete your order:</p>
                                                        <ol className="list-decimal list-inside space-y-2 text-sm">
                                                            <li>Take a <strong>screenshot</strong> of your payment confirmation</li>
                                                            <li>Click the WhatsApp button below</li>
                                                            <li>Send the screenshot along with your order details</li>
                                                            <li>Wait for our confirmation message</li>
                                                        </ol>
                                                    </div>
                                                    <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">
                                                        ❗ Your order will only be processed after we receive and verify your payment proof.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* WhatsApp Button */}
                                    <a
                                        href={getWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`mt-6 w-full ${paymentMethod === 'cod' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 hover:shadow-xl hover:scale-[1.02] transition-all`}
                                    >
                                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                        {paymentMethod === 'cod' ? 'Confirm Order on WhatsApp' : 'Send Payment Proof on WhatsApp'}
                                    </a>
                                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3">
                                        WhatsApp: <span className="font-semibold">{whatsappDisplayNumber}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details Reminder */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 sm:p-6 mb-8">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Payment Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                                    <p className="font-bold text-xl text-gray-800 dark:text-white">{formatPrice(confirmedTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                                    <p className="font-bold text-xl text-gray-800 dark:text-white">
                                        {paymentAccounts.find(p => p.id === paymentMethod)?.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                <Package className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Order Confirmed</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                <Truck className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Ships in 24-48 hrs</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                <Clock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Delivery: 3-5 Days</p>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Delivery Address</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {formData.firstName} {formData.lastName}<br />
                                {formData.address}<br />
                                {formData.city} {formData.postalCode && `, ${formData.postalCode}`}<br />
                                {formData.phone}<br />
                                {formData.email}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/account"
                                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border-2 border-rose-500 text-rose-500 px-8 py-3 rounded-full font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                            >
                                View My Orders
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-rose-500 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cart
                </Link>

                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center justify-between sm:justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
                    {[
                        { num: 1, label: 'Shipping' },
                        { num: 2, label: 'Payment' },
                        { num: 3, label: 'Review' }
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center flex-shrink-0">
                            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-semibold text-sm sm:text-base ${step >= s.num
                                ? 'bg-gradient-to-r from-rose-500 to-orange-400 text-white'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                }`}>
                                {step > s.num ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : s.num}
                            </div>
                            <span className={`ml-2 font-medium text-xs sm:text-base ${step >= s.num ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                {s.label}
                            </span>
                            {i < 2 && (
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600 mx-2 sm:mx-4 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Shipping Information */}
                        {step === 1 && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-rose-500" />
                                    Shipping Information
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            First Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                placeholder="John"
                                            />
                                        </div>
                                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                placeholder="Doe"
                                            />
                                        </div>
                                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                placeholder="03XX XXXXXXX"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Street Address *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                                placeholder="House #, Street, Area"
                                            />
                                        </div>
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            City *
                                        </label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white ${errors.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Postal Code (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white"
                                            placeholder="12345"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Order Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-gray-800 dark:text-white"
                                            placeholder="Any special instructions for delivery..."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    className="w-full mt-6 bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    Continue to Payment <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 sm:p-6 border dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                    <CreditCard className="w-6 h-6 text-rose-500" />
                                    Payment Method
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">Select how you'd like to pay for your order</p>

                                {/* COD vs Advance Notice */}
                                <div className={`border-2 rounded-xl p-4 mb-6 transition-colors ${paymentMethod === 'cod'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {paymentMethod === 'cod' ? (
                                            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`font-semibold text-sm sm:text-base ${paymentMethod === 'cod' ? 'text-blue-800 dark:text-blue-200' : 'text-amber-800 dark:text-amber-200'}`}>
                                                {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Advance Payment Required'}
                                            </p>
                                            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${paymentMethod === 'cod' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                                {paymentMethod === 'cod'
                                                    ? 'Pay the total amount in cash to our delivery partner when you receive your package.'
                                                    : 'We require complete advance payment to process your order. Transfer the amount to any of the accounts below.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Accounts */}
                                <div className="space-y-3 sm:space-y-4 mb-6">
                                    {paymentAccounts.map((account) => (
                                        <label
                                            key={account.id}
                                            className={`block border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === account.id
                                                ? `${account.borderColor} ${account.bgColor} dark:bg-gray-800`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={account.id}
                                                        checked={paymentMethod === account.id}
                                                        onChange={() => setPaymentMethod(account.id)}
                                                        className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 focus:ring-rose-500"
                                                    />
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${account.color} flex items-center justify-center text-xl sm:text-2xl`}>
                                                        {account.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">{account.name}</p>
                                                        <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Transfer to {account.name} Account</p>
                                                    </div>
                                                </div>

                                                {/* Account Details */}
                                                {paymentMethod === account.id && (
                                                    <div className="mt-4 ml-7 sm:ml-9 bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700">
                                                        {account.id !== 'cod' ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Title</p>
                                                                    <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{account.accountTitle}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Number</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-semibold text-gray-800 dark:text-white font-mono text-base sm:text-lg">{account.accountNumber}</p>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => copyToClipboard(account.accountNumber, account.id)}
                                                                            className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                        >
                                                                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                                        </button>
                                                                        {copiedAccount === account.id && (
                                                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Copied!</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                                <Truck className="w-5 h-5" />
                                                                <p className="text-sm font-bold uppercase tracking-wide">Pay cash to the rider upon delivery</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount to Pay</p>
                                                            <p className="font-bold text-2xl text-rose-500">{formatPrice(finalTotal)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!paymentMethod}
                                        className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${paymentMethod
                                            ? 'bg-gradient-to-r from-rose-500 to-orange-400 text-white hover:shadow-lg'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Review Order <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-rose-500" />
                                            Shipping Address
                                        </h3>
                                        <button onClick={() => setStep(1)} className="text-rose-500 text-sm hover:underline">
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {formData.firstName} {formData.lastName}<br />
                                        {formData.address}<br />
                                        {formData.city}, {formData.postalCode}<br />
                                        {formData.phone}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-rose-500" />
                                            Payment Method
                                        </h3>
                                        <button onClick={() => setStep(2)} className="text-rose-500 text-sm hover:underline">
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 capitalize">
                                        {paymentMethod}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Order Items</h3>
                                    <div className="space-y-4">
                                        {items.map(item => (
                                            <div key={item.uniqueId} className="flex flex-col border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name} <span className="text-gray-500 text-sm">x {item.quantity}</span></span>
                                                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                                {item.selectedVariations && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(item.selectedVariations).map(([key, value]) => (
                                                            <span key={key} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Package className="w-5 h-5" />
                                            Place Order - {formatPrice(finalTotal)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Order Summary */}
                    {step < 3 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800 sticky top-24">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-6">Order Summary</h3>
                                <div className="space-y-4 text-sm sm:text-base">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium dark:text-white">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                        <span className={`font-medium ${deliveryFee === 0 ? 'text-green-500' : 'dark:text-white'}`}>
                                            {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-800 dark:text-white">Total</span>
                                            <span className="text-xl font-bold text-rose-500">{formatPrice(finalTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
