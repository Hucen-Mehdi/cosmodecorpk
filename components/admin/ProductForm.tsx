"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories, fetchProductById } from '@/src/api/api';
import { createProduct, updateProduct } from '@/src/api/admin';
import { ArrowLeft, Save, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm({ id }: { id?: string }) {
    const router = useRouter();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        originalPrice: 0 as number | undefined,
        image: '',
        category: '',
        subcategory: '',
        rating: 4.5,
        reviews: 0,
        badge: '',
        description: '',
        stock: 10
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cats = await fetchCategories();
                setCategories(cats);

                if (isEdit) {
                    const product = await fetchProductById(parseInt(id!));
                    setFormData({
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image: product.image,
                        category: product.category,
                        subcategory: product.subcategory || '',
                        rating: product.rating,
                        reviews: product.reviews,
                        badge: product.badge || '',
                        description: product.description || '',
                        stock: product.stock || 0
                    });
                } else if (cats.length > 0) {
                    setFormData(prev => ({ ...prev, category: cats[0].id }));
                }
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const dataToSave = {
                ...formData,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                rating: Number(formData.rating),
                reviews: Number(formData.reviews),
                stock: Number(formData.stock)
            };

            if (isEdit) {
                await updateProduct(parseInt(id!), dataToSave);
            } else {
                await createProduct(dataToSave);
            }
            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 font-bold mb-8 group transition-colors"
            >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Back to Catalog
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden mb-12 animate-in slide-in-from-bottom-6 duration-500">
                <div className="px-10 py-10 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isEdit ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Fine-tune the details to make your product stand out.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-5 rounded-[1.5rem] border border-red-100 flex items-center gap-4 animate-in fade-in duration-300">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Left Side: Basic Details */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest border-l-4 border-rose-500 pl-4">Core Information</h3>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Product Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold text-lg"
                                        placeholder="Enter product name..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Selling Price (Rs)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Original Price (Rs)</label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice || ''}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Catalog Section</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 font-bold transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Current Inventory (Stock)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        className={`w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold ${formData.stock <= 5 ? 'text-red-500 focus:ring-red-50/50 focus:border-red-400' : 'text-gray-900 focus:ring-rose-50/50 focus:border-rose-400'
                                            }`}
                                        placeholder="Enter available quantity..."
                                    />
                                    {formData.stock <= 5 && (
                                        <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 animate-pulse italic uppercase tracking-widest">
                                            🚨 Low stock alert will show in catalog
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Media & Presentation */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest border-l-4 border-rose-500 pl-4">Media & Presentation</h3>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">High-Res Image URL</label>
                                    <div className="relative group">
                                        <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-rose-400 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-medium text-sm"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                </div>

                                {formData.image && (
                                    <div className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex justify-center animate-in fade-in zoom-in-95 duration-300">
                                        <img src={formData.image} alt="Preview" className="h-40 w-auto rounded-xl shadow-lg border border-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Badge (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.badge}
                                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold placeholder:font-medium uppercase text-xs tracking-widest text-rose-500"
                                            placeholder="e.g. New / Hot"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Initial Reviews</label>
                                        <input
                                            type="number"
                                            value={formData.reviews}
                                            onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100 space-y-6">
                        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest border-l-4 border-rose-500 pl-4">Full Narrative</h3>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Product Description</label>
                            <textarea
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-8 py-6 bg-gray-50 border border-gray-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-medium leading-relaxed text-gray-700"
                                placeholder="Enter full product details, features, and specs..."
                            />
                        </div>
                    </div>

                    <div className="pt-10 flex flex-col md:flex-row gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-5 rounded-[1.5rem] font-bold hover:from-rose-500 hover:to-orange-400 transition-all shadow-xl shadow-rose-100 hover:shadow-rose-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            {isEdit ? 'Update Product' : 'Save & Publish Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            className="px-10 py-5 rounded-[1.5rem] font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Discard Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
