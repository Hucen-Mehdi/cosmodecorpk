"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories, fetchProductById } from '@/src/api/api';
import { createProduct, updateProduct, fetchAdminCategories } from '@/src/api/admin';
import { ArrowLeft, Save, AlertCircle, Loader2, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { Variation } from '@/src/api/api';

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
        stock: 10,
        deliveryCharge: 200,
        variations: [] as Variation[],
        additionalImages: [] as string[]
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch categories from Admin API (Authenticated)
                const cats = await fetchAdminCategories();

                if (Array.isArray(cats)) {
                    setCategories(cats);
                } else {
                    console.error("Categories response is not an array:", cats);
                    setCategories([]);
                }

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
                        stock: product.stock || 0,
                        deliveryCharge: product.deliveryCharge || 200,
                        variations: product.variations || [],
                        additionalImages: product.additionalImages || []
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
                stock: Number(formData.stock),
                category_id: formData.category // Send category_id as requested
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

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Delivery Charge (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.deliveryCharge}
                                        onChange={(e) => setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-bold"
                                        placeholder="Enter delivery charge for this product..."
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1 italic">
                                        This charge will be applied per unit of this product at checkout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Variations Section */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-l-4 border-rose-500 pl-4">
                                    <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Variations & Options</h3>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            variations: [...formData.variations, { name: '', options: [], required: false, priceAdjustments: {} }]
                                        })}
                                        className="text-[10px] font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors flex items-center gap-1 uppercase tracking-wide"
                                    >
                                        <Plus className="w-3 h-3" /> Add Variation
                                    </button>
                                </div>

                                {formData.variations.length === 0 && (
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-center">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No variations added yet</p>
                                        <p className="text-gray-400 text-[10px] mt-1">Add options like Size, Color, or Material</p>
                                    </div>
                                )}

                                {formData.variations.map((variation, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group animate-in slide-in-from-bottom-2 duration-300">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newVars = [...formData.variations];
                                                newVars.splice(index, 1);
                                                setFormData({ ...formData, variations: newVars });
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-white text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Variation Name</label>
                                                    <input
                                                        type="text"
                                                        value={variation.name}
                                                        onChange={(e) => {
                                                            const newVars = [...formData.variations];
                                                            newVars[index].name = e.target.value;
                                                            setFormData({ ...formData, variations: newVars });
                                                        }}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-50/50 focus:border-rose-400 font-bold text-sm"
                                                        placeholder="e.g. Size, Color"
                                                    />
                                                </div>
                                                <div className="flex items-center pt-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={variation.required}
                                                            onChange={(e) => {
                                                                const newVars = [...formData.variations];
                                                                newVars[index].required = e.target.checked;
                                                                setFormData({ ...formData, variations: newVars });
                                                            }}
                                                            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                                                        />
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Required</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Options</label>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {variation.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                            <span className="text-xs font-bold text-gray-700">{opt}</span>
                                                            {variation.priceAdjustments[opt] !== 0 && (
                                                                <span className={`text-[10px] font-bold ${variation.priceAdjustments[opt] > 0 ? 'text-rose-500' : 'text-green-500'}`}>
                                                                    {variation.priceAdjustments[opt] > 0 ? '+' : ''}{variation.priceAdjustments[opt]}
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newVars = [...formData.variations];
                                                                    newVars[index].options = variation.options.filter((_, i) => i !== optIdx);
                                                                    delete newVars[index].priceAdjustments[opt];
                                                                    setFormData({ ...formData, variations: newVars });
                                                                }}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-50/50 focus:border-rose-400 text-sm font-medium"
                                                        placeholder="Add option (e.g. Small) and press Enter"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const val = e.currentTarget.value.trim();
                                                                if (val && !variation.options.includes(val)) {
                                                                    const newVars = [...formData.variations];
                                                                    newVars[index].options.push(val);
                                                                    newVars[index].priceAdjustments[val] = 0;
                                                                    setFormData({ ...formData, variations: newVars });
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {variation.options.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100 animate-in fade-in zoom-in-95">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Price Adjustments</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {variation.options.map(opt => (
                                                            <div key={opt} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                                                                <span className="text-xs font-semibold text-gray-700 truncate mr-2">{opt}</span>
                                                                <input
                                                                    type="number"
                                                                    value={variation.priceAdjustments[opt] || 0}
                                                                    onChange={(e) => {
                                                                        const newVars = [...formData.variations];
                                                                        newVars[index].priceAdjustments[opt] = parseFloat(e.target.value);
                                                                        setFormData({ ...formData, variations: newVars });
                                                                    }}
                                                                    className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-right text-xs font-bold focus:outline-none focus:border-rose-400"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
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

                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Additional Images (Max 5)</h4>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            {formData.additionalImages.length} / 5
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-5 gap-3">
                                        {formData.additionalImages.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages = [...formData.additionalImages];
                                                            newImages.splice(idx, 1);
                                                            setFormData({ ...formData, additionalImages: newImages });
                                                        }}
                                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <div className="flex gap-1">
                                                        {idx > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newImages = [...formData.additionalImages];
                                                                    [newImages[idx], newImages[idx - 1]] = [newImages[idx - 1], newImages[idx]];
                                                                    setFormData({ ...formData, additionalImages: newImages });
                                                                }}
                                                                className="p-1 bg-white text-gray-700 rounded hover:bg-gray-100 text-[10px] font-bold"
                                                            >
                                                                ←
                                                            </button>
                                                        )}
                                                        {idx < formData.additionalImages.length - 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newImages = [...formData.additionalImages];
                                                                    [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
                                                                    setFormData({ ...formData, additionalImages: newImages });
                                                                }}
                                                                className="p-1 bg-white text-gray-700 rounded hover:bg-gray-100 text-[10px] font-bold"
                                                            >
                                                                →
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.additionalImages.length < 5 && (
                                            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                                                <Plus className="w-5 h-5 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {formData.additionalImages.length < 5 && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs font-bold"
                                                placeholder="Paste additional image URL and press Enter"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim();
                                                        if (val && !formData.additionalImages.includes(val)) {
                                                            setFormData({
                                                                ...formData,
                                                                additionalImages: [...formData.additionalImages, val]
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

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
