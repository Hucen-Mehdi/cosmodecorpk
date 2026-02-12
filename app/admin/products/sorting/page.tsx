
"use client";

import { useState, useEffect, useRef } from 'react';
import { fetchSortingQueue, updateProductSortOrder, fetchAdminCategories } from '@/src/api/admin';
import { Loader2, Save, GripVertical, AlertCircle, CheckCircle } from 'lucide-react';
import { Product } from '@/src/api/api';

export default function ProductSortingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Drag and Drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedCategory]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                fetchSortingQueue(selectedCategory),
                categories.length === 0 ? fetchAdminCategories() : Promise.resolve(categories)
            ]);

            setProducts(productsData);
            if (categories.length === 0) setCategories(categoriesData);
        } catch (err: any) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const _products = [...products];
        const draggedItemContent = _products[dragItem.current];

        _products.splice(dragItem.current, 1);
        _products.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = null;
        dragOverItem.current = null;
        setProducts(_products);
    };

    const saveOrder = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            // Map products to { id, position }
            // We use the current index as the new sort_order
            // To allow spacing, maybe multiply by 10 or just use index.
            // Using index + 1 ensures 1-based.
            const updates = products.map((p, index) => ({
                id: p.id,
                position: index + 1
            }));

            await updateProductSortOrder(updates, selectedCategory || undefined);
            setSuccess('Product order updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    if (loading && products.length === 0) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-rose-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Sorting</h1>
                    <p className="text-gray-500">Drag and drop to reorder products</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white min-w-[200px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={saveOrder}
                        disabled={saving}
                        className="px-6 py-2 bg-rose-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-rose-600 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Order
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {success}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No products found in this category.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                draggable
                                onDragStart={(e) => {
                                    dragItem.current = index;
                                    e.currentTarget.classList.add('opacity-50', 'bg-gray-50');
                                }}
                                onDragEnter={(e) => {
                                    dragOverItem.current = index;
                                }}
                                onDragEnd={(e) => {
                                    handleSort();
                                    e.currentTarget.classList.remove('opacity-50', 'bg-gray-50');
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-move group transition-colors"
                            >
                                <div className="text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="w-8 text-center font-mono text-xs text-gray-400">
                                    {index + 1}
                                </div>
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="font-mono text-gray-500">#{product.sortOrder}</span>
                                    {product.isFeatured && (
                                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">Featured</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
