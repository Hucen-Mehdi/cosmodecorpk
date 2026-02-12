"use client";

import { useState, useEffect } from 'react';
import { fetchAdminHeroSlides, updateHeroSlide, createHeroSlide, deleteHeroSlide, updateHeroSlideOrder } from '@/src/api/admin';
import { Loader2, Plus, Trash2, Save, GripVertical, Image as ImageIcon, Link as LinkIcon, Type, FileText } from 'lucide-react';
import { HeroSlide } from '@/src/api/api';

export default function AdminBannersPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminHeroSlides();
            setSlides(data);
        } catch (err: any) {
            setError('Failed to load hero slides');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSlide = (id: number, field: string, value: string) => {
        setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSave = async (slide: HeroSlide) => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateHeroSlide(slide.id, slide);
            setSuccess(`Slide "${slide.title}" updated successfully!`);
        } catch (err: any) {
            setError(`Failed to update slide: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        setSaving(true);
        try {
            await deleteHeroSlide(id);
            setSlides(prev => prev.filter(s => s.id !== id));
            setSuccess('Slide deleted successfully!');
        } catch (err: any) {
            setError(`Failed to delete slide: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAddNew = async () => {
        const newSlide = {
            title: 'New Slide Title',
            subtitle: 'New Subtitle',
            description: 'New Description line',
            image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop',
            cta_text: 'Shop Now',
            link_url: '/products',
            order_index: slides.length
        };

        setSaving(true);
        try {
            const created = await createHeroSlide(newSlide);
            setSlides(prev => [...prev, created]);
            setSuccess('New slide created!');
        } catch (err: any) {
            setError(`Failed to create slide: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-rose-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Banners</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the hero slider images and text on the storefront</p>
                </div>
                <button
                    onClick={handleAddNew}
                    disabled={saving}
                    className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Plus className="w-5 h-5" /> Add New Slide
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 font-medium border border-green-100">{success}</div>}

            <div className="space-y-8">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100 shadow-sm">
                                    {index + 1}
                                </span>
                                <h3 className="font-bold text-gray-800">Slide ID: {slide.id}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSave(slide)}
                                    disabled={saving}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                                <button
                                    onClick={() => handleDelete(slide.id)}
                                    disabled={saving}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 p-6">
                            {/* Preview/Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Banner Image</label>
                                <div className="aspect-[2/1] bg-gray-100 rounded-xl overflow-hidden mb-4 border relative group/img">
                                    <img src={slide.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-xs font-bold">Image Preview</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={slide.image_url}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'image_url', e.target.value)}
                                        placeholder="Image URL (e.g. Unsplash link)"
                                        className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
                                    />
                                </div>
                            </div>

                            {/* Content Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Type className="w-3 h-3" /> Main Title (Big)
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.title}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'title', e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.subtitle}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'subtitle', e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-rose-500 focus:border-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upper Badge Label</label>
                                    <input
                                        type="text"
                                        value={slide.description}
                                        onChange={(e) => handleUpdateSlide(slide.id, 'description', e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 text-sm"
                                        placeholder="e.g. Up to 40% Off"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Button Text</label>
                                        <input
                                            type="text"
                                            value={slide.cta_text}
                                            onChange={(e) => handleUpdateSlide(slide.id, 'cta_text', e.target.value)}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" /> Link URL
                                        </label>
                                        <input
                                            type="text"
                                            value={slide.link_url}
                                            onChange={(e) => handleUpdateSlide(slide.id, 'link_url', e.target.value)}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {slides.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No banners found. Add your first slide to get started.</p>
                </div>
            )}
        </div>
    );
}
