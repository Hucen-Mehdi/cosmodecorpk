"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2, Upload, Search, Filter, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

interface MigrationItem {
    id: string | number;
    name: string;
    imageUrl: string;
    additionalImages?: string[];
    type: 'product' | 'category' | 'hero';
}

export default function MigrationPage() {
    const { token } = useAuth();
    const [items, setItems] = useState<MigrationItem[]>([]);
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
            
            const combined: MigrationItem[] = [
                ...(data.products || []).map((p: any) => ({ ...p, type: 'product' })),
                ...(data.categories || []).map((p: any) => ({ ...p, type: 'category' })),
                ...(data.heroSlides || []).map((p: any) => ({ ...p, type: 'hero' }))
            ];
            
            setItems(combined);
            setStats({
                total: data.count || 0,
                pending: combined.length
            });
        } catch (err) {
            console.error('Failed to load migration status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleUpload = async (itemId: string | number, type: string, field: string, file: File, index?: number) => {
        const uploadKey = `${type}-${itemId}-${field}-${index ?? 'main'}`;
        setUploading(uploadKey);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', itemId.toString());
        formData.append('type', type);
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

    const filteredItems = items.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.id.toString().includes(search)
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-rose-500" />
                        Image Migration <span className="text-rose-500 font-medium text-sm px-3 py-1 bg-rose-50 rounded-full border border-rose-100 ml-2">Cloudinary → VPS</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-xl">
                        Identify and replace completely ALL broken images across your store (Products, Categories, Banners).
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Fixes</p>
                        <p className="text-2xl font-black text-rose-500">{stats.pending}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by name..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={loadStatus}
                        className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type / Name</th>
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
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center text-green-500 font-bold">
                                        Migration Complete!
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idxKey) => (
                                    <tr key={`${item.type}-${item.id}-${idxKey}`} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[10px] uppercase font-black px-2 py-1 rounded text-white bg-gray-800">
                                                    {item.type}
                                                </div>
                                                <p className="font-bold text-gray-900">{item.name || \`ID: \${item.id}\`}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-3">
                                                {/* Main Image */}
                                                {item.imageUrl?.includes('cloudinary') && (
                                                    <div className="flex items-center gap-3 text-rose-500">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <p className="text-[10px] font-mono bg-rose-50 px-2 py-1 rounded truncate max-w-xs">{item.imageUrl}</p>
                                                    </div>
                                                )}
                                                {/* Additional Images (Product Gallery or Hero Mobile Images) */}
                                                {(item.additionalImages || []).length > 0 && typeof item.additionalImages !== 'string' && (item.additionalImages as string[]).map((img, idx) => (
                                                    img.includes('cloudinary') && (
                                                        <div key={idx} className="flex items-center gap-3 text-rose-400 pl-4 border-l border-rose-100">
                                                            <ImageIcon className="w-3 h-3" />
                                                            <p className="text-[10px] font-mono bg-white border border-gray-100 px-2 py-1 rounded truncate max-w-xs">gallery[{idx}]: {img}</p>
                                                        </div>
                                                    )
                                                ))}
                                                {/* Handling Hero mobile Image string directly */}
                                                {(item.additionalImages && typeof item.additionalImages === 'string' && (item.additionalImages as string).includes('cloudinary')) && (
                                                    <div className="flex items-center gap-3 text-rose-400 pl-4 border-l border-rose-100">
                                                        <ImageIcon className="w-3 h-3" />
                                                        <p className="text-[10px] font-mono bg-white border border-gray-100 px-2 py-1 rounded truncate max-w-xs">mobile: {item.additionalImages as string}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2 items-center">
                                                {/* Upload Main */}
                                                {item.imageUrl?.includes('cloudinary') && (
                                                    <label className="w-full max-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm">
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleUpload(item.id, item.type, 'imageUrl', e.target.files[0])}
                                                        />
                                                        Main Image
                                                    </label>
                                                )}
                                                
                                                {/* Upload Additional */}
                                                {Array.isArray(item.additionalImages) && item.additionalImages.map((img: string, idx: number) => (
                                                    img.includes('cloudinary') && (
                                                        <label key={idx} className="w-full max-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white shadow-sm">
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={(e) => e.target.files?.[0] && handleUpload(item.id, item.type, 'additionalImages', e.target.files[0], idx)}
                                                            />
                                                            Gallery [{idx}]
                                                        </label>
                                                    )
                                                ))}

                                                {/* Upload Mobile Image for Hero Slides */}
                                                {typeof item.additionalImages === 'string' && (item.additionalImages as string).includes('cloudinary') && (
                                                    <label className="w-full max-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white shadow-sm">
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleUpload(item.id, item.type, 'mobileImageUrl', e.target.files[0])}
                                                        />
                                                        Mobile Image
                                                    </label>
                                                )}

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
