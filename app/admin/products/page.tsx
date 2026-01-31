"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { fetchProducts } from '@/src/api/api';
import { deleteProduct } from '@/src/api/admin';
import Link from 'next/link';

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this product?')) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your inventory and product listings.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all active:scale-95 self-start md:self-auto"
                >
                    <Plus className="w-5 h-5" /> Add Product
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                                <th className="px-6 py-4 text-left w-full">Product Info</th>
                                <th className="px-6 py-4 text-left whitespace-nowrap w-px">Category</th>
                                <th className="px-6 py-4 text-left whitespace-nowrap w-px">Price</th>
                                <th className="px-6 py-4 text-left whitespace-nowrap w-px">Stock</th>
                                <th className="px-6 py-4 text-left whitespace-nowrap w-px">Status</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap w-px">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-8 bg-gray-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Package className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <p className="text-gray-900 font-bold lg text-lg">No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4 min-w-[280px]">
                                                <div className="w-14 h-14 relative flex-shrink-0">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm" />
                                                    {p.badge && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                            {p.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-base leading-tight truncate">{p.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">ID: CD-{p.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border border-gray-100">
                                                {p.category.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <p className="font-bold text-gray-900 text-sm">Rs. {p.price.toLocaleString()}</p>
                                            {p.originalPrice && (
                                                <p className="text-[10px] text-gray-400 line-through font-medium">Rs. {p.originalPrice.toLocaleString()}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${((p as any).stock <= 5) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {(p as any).stock || 0} in stock
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                Live
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/products/${p.id}/edit`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
