"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, X, Search, MoreVertical } from 'lucide-react';
import { fetchCategories } from '@/src/api/api';
import { createCategory, updateCategory, deleteCategory } from '@/src/api/admin';

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        icon: '',
        image: ''
    });

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
            } else {
                await createCategory(formData);
            }
            setShowModal(false);
            loadCategories();
            setFormData({ id: '', name: '', icon: '', image: '' });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (cat: any) => {
        setEditingCategory(cat);
        setFormData({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '',
            image: cat.image || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Collections</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage and organize your product categories.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ id: '', name: '', icon: '', image: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all active:scale-95 self-start md:self-auto"
                >
                    <Plus className="w-5 h-5" /> Add Collection
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-4">Icon / Image</th>
                                <th className="px-8 py-4">Collection Info</th>
                                <th className="px-8 py-4">Slug (ID)</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="w-12 h-12 bg-gray-100 rounded-xl" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td className="px-8 py-6 text-right"><MoreVertical className="w-5 h-5 text-gray-200 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <FolderTree className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-500 font-bold">No collections found</p>
                                            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new one.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                                                    {cat.image ? (
                                                        <img src={cat.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl">{cat.icon || '📁'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900 text-lg">{cat.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">Main Category</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">{cat.id}</code>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{editingCategory ? 'Edit Collection' : 'New Collection'}</h2>
                                <p className="text-gray-500 text-sm font-medium mt-1">Fill in the details for your category.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 text-gray-400 hover:bg-white hover:text-gray-900 rounded-xl transition-all shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 text-sm font-bold">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Unique Slug (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingCategory}
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="e.g. artificial-plants"
                                    />
                                    {!editingCategory && <p className="text-[10px] text-gray-400 mt-2 px-1 italic">This ID is used for routing and cannot be changed later.</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-bold"
                                        placeholder="e.g. Artificial Plants"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Icon (Emoji)</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all text-center text-2xl"
                                            placeholder="🌿"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all font-medium text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-4 rounded-2xl font-bold hover:from-rose-500 hover:to-orange-400 transition-all shadow-lg active:scale-95"
                                >
                                    {editingCategory ? 'Update Collection' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
