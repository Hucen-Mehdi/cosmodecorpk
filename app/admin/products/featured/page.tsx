
"use client";

import { useState, useEffect } from 'react';
import { fetchSortingQueue, updateProductFeatured } from '@/src/api/admin';
import { Loader2, Star, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '@/src/api/api';

export default function FeaturedProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchSortingQueue(); // Should return sorted by featured first via sort params
            setProducts(data.sort((a: Product, b: Product) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).reverse()); // Client sort to pin featured to top? Or backend?
            // Backend sort: featured DESC, sort_order ASC. So initial list IS sorted.
            // Client side re-sort on toggle?
            setProducts(data);
        } catch (err: any) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (id: number, currentStatus: boolean) => {
        setUpdating(id);
        try {
            await updateProductFeatured(id, !currentStatus);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !currentStatus } : p).sort((a, b) =>
                (a.id === id ? !currentStatus : a.isFeatured) === (b.id === id ? !currentStatus : b.isFeatured) ? 0 :
                    (a.id === id ? !currentStatus : a.isFeatured) ? -1 : 1
            ));
        } catch (err) {
            setError('Failed to update featured status');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-rose-500" /></div>;

    const featuredCount = products.filter(p => p.isFeatured).length;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Featured Products</h1>
                    <p className="text-gray-500">Manage products displayed on the homepage carousel</p>
                </div>
                <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 fill-rose-600" />
                    {featuredCount} / 8 Recommended
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`group bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden relative ${product.isFeatured ? 'border-amber-400 ring-2 ring-amber-100 shadow-md transform -translate-y-1' : 'border-gray-100 hover:shadow-md'}`}
                    >
                        {/* Status Badge */}
                        {product.isFeatured && (
                            <div className="absolute top-3 right-3 z-10 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" /> Featured
                            </div>
                        )}

                        <div className="h-48 bg-gray-50 relative overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => toggleFeatured(product.id, product.isFeatured || false)}
                                    disabled={updating === product.id}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transform active:scale-95 transition-all flex items-center gap-2 ${product.isFeatured
                                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                                        : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg'}`}
                                >
                                    {updating === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (product.isFeatured ? 'Unfeature' : 'Feature')}
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 truncate mb-1" title={product.name}>{product.name}</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 capitalize">{product.category}</span>
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 text-xs">#{product.id}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
