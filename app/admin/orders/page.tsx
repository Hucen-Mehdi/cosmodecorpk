"use client";

import { useState, useEffect } from 'react';
import {
    Search, ClipboardList, Eye, CheckCircle, XCircle,
    Truck, PauseCircle, Clock, MoreVertical, X, Phone, Mail, MapPin, Package, AlertCircle, Trash2
} from 'lucide-react';
import { getAllOrdersAdmin, updateOrderStatusAdmin, deleteOrderAdmin, Order } from '@/src/api/orders';

const statusOptions = [
    { label: 'Pending', value: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Processing', value: 'Processing', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'On Hold', value: 'On Hold', icon: PauseCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
    { label: 'Shipped', value: 'Shipped', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Completed', value: 'Completed', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Cancelled', value: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllOrdersAdmin();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (newStatus === 'Cancelled' && !window.confirm('WARNING: Are you sure you want to cancel this order? This action will restore product stock and notification the customer.')) {
            return;
        }
        if (newStatus === 'Completed' && !window.confirm('Are you sure you want to mark this order as completed?')) {
            return;
        }
        if (newStatus === 'On Hold' && !window.confirm('Do you want to put this order on hold?')) {
            return;
        }

        setIsUpdating(orderId);
        try {
            await updateOrderStatusAdmin(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm('CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE this order? This action cannot be undone and will remove all order records from the database.')) {
            return;
        }

        setIsUpdating(orderId);
        try {
            await deleteOrderAdmin(orderId);
            setOrders(orders.filter(o => o.id !== orderId));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(null);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusInfo = (status: string) => {
        return statusOptions.find(s => s.value === status) || statusOptions[0];
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage customer orders and fulfillment status.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-4 w-48">Order Details</th>
                                <th className="px-8 py-4">Customer & Address</th>
                                <th className="px-8 py-4 w-40">Total</th>
                                <th className="px-8 py-4 w-48">Payment</th>
                                <th className="px-8 py-4 w-48">Status</th>
                                <th className="px-8 py-4 text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-48 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6 ml-auto"><div className="h-4 w-8 bg-gray-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ClipboardList className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <p className="text-gray-900 font-bold text-lg">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 text-sm">{order.userName}</p>
                                                <p className="text-xs text-gray-500 font-medium mb-1">{order.userEmail}</p>
                                                <div className="flex items-start gap-1 text-[10px] text-gray-400 bg-gray-50 p-1.5 rounded-lg border border-gray-100 max-w-[250px]">
                                                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                                    <p className="line-clamp-2 italic">{order.shippingAddress}, {order.shippingCity}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-900 whitespace-nowrap">
                                                {formatPrice(order.total)}
                                                <p className="text-[10px] text-gray-400 font-medium">{order.itemsCount} items</p>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap font-medium">
                                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider border border-rose-100 italic">
                                                    {order.paymentMethod || 'COD'} (Advance)
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="relative inline-block w-full min-w-[160px]">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={isUpdating === order.id}
                                                        className={`appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${statusInfo.bg} ${statusInfo.color} ${isUpdating === order.id ? 'opacity-50' : 'cursor-pointer hover:shadow-sm'}`}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <MoreVertical className="w-3 h-3 h-opacity-50" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-rose-500">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2.5 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                                                        title="Delete Order"
                                                        disabled={isUpdating === order.id}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedOrder(null)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                <p className="text-sm text-gray-500 font-medium">View and manage fulfillment details.</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            < ClipboardList className="w-5 h-5 text-rose-500" />
                                            Summarize
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Order Number:</span>
                                                <span className="text-gray-900 font-bold">{selectedOrder.orderNumber}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Order Date:</span>
                                                <span className="text-gray-900 font-bold">{new Date(selectedOrder.date).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Status:</span>
                                                <span className={`font-bold px-2 py-0.5 rounded-lg ${getStatusInfo(selectedOrder.status).bg} ${getStatusInfo(selectedOrder.status).color}`}>
                                                    {selectedOrder.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Payment:</span>
                                                <span className="text-rose-600 font-bold uppercase tracking-wide">{selectedOrder.paymentMethod || 'COD'} (ADVANCE)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-rose-500" />
                                            Shipping Details
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-base text-gray-900 font-bold leading-tight mb-1">
                                                        {selectedOrder.shippingAddress}
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-semibold">
                                                        {selectedOrder.shippingCity} {selectedOrder.shippingPostalCode && ` - ${selectedOrder.shippingPostalCode}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedOrder.shippingNotes && (
                                                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                                                    <strong>Notes:</strong> {selectedOrder.shippingNotes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-rose-500" />
                                        Customer Info
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                                            <p className="text-gray-900 font-bold text-lg">{selectedOrder.shippingName || selectedOrder.userName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm text-gray-700 font-bold">{selectedOrder.shippingEmail || selectedOrder.userEmail}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm text-gray-700 font-bold tracking-wide">{selectedOrder.shippingPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4 text-center">Qty</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 leading-none">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-sm" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 line-clamp-1">{item.name}</span>
                                                            {(item as any).selectedVariations && Object.keys((item as any).selectedVariations).length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {Object.entries((item as any).selectedVariations).map(([key, value]) => (
                                                                        <span key={key} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                                                            <span className="font-semibold text-gray-700">{key}:</span> {String(value)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-700">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-500">{formatPrice(item.price)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50/50">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-3 text-right text-xs font-bold text-gray-500">Subtotal</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-900">{formatPrice(selectedOrder.subtotal)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="px-6 py-3 text-right text-xs font-bold text-gray-500">Shipping</td>
                                            <td className="px-6 py-3 text-right font-bold text-gray-900">{formatPrice(selectedOrder.shipping)}</td>
                                        </tr>
                                        <tr className="border-t border-gray-100">
                                            <td colSpan={3} className="px-6 py-6 text-right text-lg font-bold text-gray-900">Total</td>
                                            <td className="px-6 py-6 text-right text-2xl font-black text-rose-500">{formatPrice(selectedOrder.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex flex-wrap gap-4 justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                                    className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                                >
                                    Cancel Order
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedOrder.id, 'On Hold')}
                                    className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                                >
                                    Put On Hold
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                                    className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
                                >
                                    Delete Permanent
                                </button>
                            </div>
                            <button
                                onClick={() => handleStatusChange(selectedOrder.id, 'Completed')}
                                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-95"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
