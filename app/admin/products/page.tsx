"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { fetchProducts } from '@/src/api/api';
import { deleteProduct } from '@/src/api/admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationModal } from '../_components/DeleteConfirmationModal';

export default function AdminProducts() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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

    const handleDeleteClick = (product: { id: number; name: string }) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            await deleteProduct(productToDelete.id);
            await loadProducts();
            setDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete product');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const searchStr = searchTerm.toLowerCase();
        const productName = (p.name || '').toLowerCase();
        const productCategory = (p.category || '').toLowerCase();
        const productDescription = (p.description || '').toLowerCase();
        const productId = (p.id || '').toString();
        const paddedId = `CD-${productId.padStart(4, '0')}`.toLowerCase();

        return (
            productName.includes(searchStr) ||
            productCategory.includes(searchStr) ||
            productDescription.includes(searchStr) ||
            productId.includes(searchStr) ||
            paddedId.includes(searchStr)
        );
    });

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
                    <form
                        onSubmit={(e) => { e.preventDefault(); router.push(`/admin/products?search=${encodeURIComponent(searchTerm)}`); }}
                        className="relative w-full md:w-96 group"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name, category or ID (CD-0001)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 dark:text-gray-100 transition-all font-medium text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                        )}
                    </form>
                </div>

                <div className="overflow-x-auto scrollbar-thin rounded-xl hidden md:block">
                    <table className="w-full min-w-[1000px] border-collapse">
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
                                    <tr
                                        key={p.id}
                                        onClick={() => setSelectedProduct(p)}
                                        className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${selectedProduct?.id === p.id ? 'bg-rose-50/30' : ''}`}
                                    >
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
                                                    <p className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-rose-500 transition-colors">{p.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">ID: CD-{p.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border border-gray-100">
                                                {(p.category || '').replace('-', ' ')}
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
                                        <td className="px-6 py-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/products/${p.id}/edit`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick({ id: p.id, name: p.name })}
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

                {/* Mobile Card Layout */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="p-5 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                        <div className="h-3 w-1/4 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-10 text-center">
                            <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No products found</p>
                        </div>
                    ) : (
                        filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedProduct(p)}
                                className={`p-4 active:bg-gray-50 transition-colors ${selectedProduct?.id === p.id ? 'bg-rose-50/20' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 relative flex-shrink-0">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-gray-900 text-base leading-tight truncate">{p.name}</p>
                                            <p className="font-black text-rose-500 text-sm flex-shrink-0">Rs. {p.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">ID: CD-{p.id.toString().padStart(4, '0')}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                                                {(p.category || '').replace('-', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${((p as any).stock <= 5) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {(p as any).stock || 0} left
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions Panel/Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight truncate max-w-[200px]">{selectedProduct.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: CD-{selectedProduct.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push(`/admin/products/${selectedProduct.id}/edit`)}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Edit2 className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">Edit Product</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteClick({ id: selectedProduct.id, name: selectedProduct.name });
                                    setSelectedProduct(null);
                                }}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">Delete Product</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="w-full py-4 text-center text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors border-t border-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product?"
                message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </div >
    );
}
