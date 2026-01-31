"use client";

import { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, Package, Clock } from 'lucide-react';
import { fetchAdminStats } from '@/src/api/admin';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>({
        productCount: 0,
        categoryCount: 0,
        orderCount: 0,
        totalRevenue: 0,
        statusCounts: {},
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats()
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: 'Total Products', value: stats.productCount, icon: Package, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
        { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
        { label: 'Orders', value: stats.orderCount, icon: ClipboardList, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Your store's performance at a glance.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm self-start">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        {statCards.map((stat) => (
                            <div key={stat.label} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                        <stat.icon className="w-8 h-8" />
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 leading-none">{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-10">
                        {/* Orders by Status */}
                        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Orders by Status</h3>
                            <div className="space-y-4">
                                {Object.entries(stats.statusCounts || {}).map(([status, count]: [string, any]) => (
                                    <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <span className="font-bold text-gray-600">{status}</span>
                                        <span className="bg-white px-3 py-1 rounded-full font-bold text-gray-900 border border-gray-100">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(stats.statusCounts || {}).length === 0 && (
                                    <p className="text-gray-400 italic text-sm text-center py-4">No orders yet</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                                <a href="/admin/orders" className="text-sm font-bold text-rose-500 hover:text-rose-600">View All</a>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4">Order #</th>
                                            <th className="pb-4">Customer</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats.recentOrders.map((order: any) => (
                                            <tr key={order.id} className="group">
                                                <td className="py-4 font-bold text-gray-900">#{order.orderNumber}</td>
                                                <td className="py-4 font-medium text-gray-600">{order.userName || 'Guest'}</td>
                                                <td className="py-4">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${order.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right font-bold text-gray-900">Rs. {order.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {stats.recentOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-gray-400 italic">No recent orders</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
