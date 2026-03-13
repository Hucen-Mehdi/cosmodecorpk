"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2, Upload, Search, Filter, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

interface Product {
    id: number;
    name: string;
    imageUrl: string;
    additionalImages: string[];
}

export default function MigrationPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0 });
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState<string | null>(null);

    const loadStatus = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/migration/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setProducts(data.products || []);
            setStats({
                total: data.count || 0,
                pending: (data.products || []).length
            });
        } catch (err) {
            console.error('Failed to load migration status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadStatus();
    }, [token]);

    const handleUpload = async (productId: number, field: string, file: File, index?: number) => {
        const uploadKey = `${productId}-${field}-${index ?? 'main'}`;
        setUploading(uploadKey);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', productId.toString());
        formData.append('field', field);
        if (index !== undefined) formData.append('index', index.toString());

        try {
            const res = await fetch(`/api/migration/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                // Refresh data
                await loadStatus();
            } else {
                alert('Upload failed. Check console.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload error. Check network.');
        } finally {
            setUploading(null);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.id.toString().includes(search)
    );

    return (
        <div className="space-y-8">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-rose-500" />
                        Image Migration <span className="text-rose-500 font-medium text-sm px-3 py-1 bg-rose-50 rounded-full border border-rose-100 ml-2">Cloudinary → VPS</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-xl">
                        Identify and replace product images that are returning 401 errors because the Cloudinary plan has ended.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Fixes</p>
                        <p className="text-2xl font-black text-rose-500">{stats.pending}</p>
                    </div>
                    <div className="bg-rose-500 border border-rose-600 px-6 py-4 rounded-3xl shadow-lg shadow-rose-200">
                        <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-2xl font-black text-white">Action Required</p>
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-start gap-4 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-amber-900">Direct Download Blocked</h3>
                    <p className="text-sm text-amber-800 leading-relaxed mt-1">
                        Since Cloudinary URLs are returning 401 Unauthorized, we cannot download them automatically. 
                        Please download images from your original backups or your phone and upload them here. 
                        Files will be saved directly to the VPS at <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-mono">/uploads/products/</code>.
                    </p>
                </div>
            </div>

            {/* Interactive Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Search & Filters */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search products by name or ID..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={loadStatus}
                        className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Broken Image Path</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scanning Database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 uppercase">Migration Complete!</p>
                                                <p className="text-sm text-gray-400 font-medium">No more Cloudinary URLs found in products table.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 border border-gray-200 group-hover:border-rose-200 group-hover:bg-white transition-all">
                                                    #{product.id}
                                                </div>
                                                <p className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-3">
                                                {/* Main Image */}
                                                {product.imageUrl?.includes('cloudinary') && (
                                                    <div className="flex items-center gap-3 text-rose-500">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <p className="text-[10px] font-mono bg-rose-50 px-2 py-1 rounded truncate max-w-xs">{product.imageUrl}</p>
                                                    </div>
                                                )}
                                                {/* Additional Images */}
                                                {(product.additionalImages || []).map((img, idx) => (
                                                    img.includes('cloudinary') && (
                                                        <div key={idx} className="flex items-center gap-3 text-rose-400 pl-4 border-l border-rose-100">
                                                            <ImageIcon className="w-3 h-3" />
                                                            <p className="text-[10px] font-mono bg-white border border-gray-100 px-2 py-1 rounded truncate max-w-xs">gallery[{idx}]: {img}</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2 items-center">
                                                {/* Upload Main */}
                                                {product.imageUrl?.includes('cloudinary') && (
                                                    <label className={`w-full max-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploading === `${product.id}-imageUrl-main` ? 'bg-gray-100 text-gray-400' : 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm hover:shadow-rose-200'}`}>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            disabled={!!uploading}
                                                            onChange={(e) => e.target.files?.[0] && handleUpload(product.id, 'imageUrl', e.target.files[0])}
                                                        />
                                                        {uploading === `${product.id}-imageUrl-main` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                        Main Image
                                                    </label>
                                                )}
                                                
                                                {/* Upload Additional */}
                                                {(product.additionalImages || []).map((img, idx) => (
                                                    img.includes('cloudinary') && (
                                                        <label key={idx} className={`w-full max-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploading === `${product.id}-additionalImages-${idx}` ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white shadow-sm'}`}>
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                disabled={!!uploading}
                                                                onChange={(e) => e.target.files?.[0] && handleUpload(product.id, 'additionalImages', e.target.files[0], idx)}
                                                            />
                                                            {uploading === `${product.id}-additionalImages-${idx}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                                                            Gallery [{idx}]
                                                        </label>
                                                    )
                                                ))}
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
