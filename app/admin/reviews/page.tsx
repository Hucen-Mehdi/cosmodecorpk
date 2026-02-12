"use client";

import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Star, Search } from 'lucide-react';
import { fetchAdminReviews, deleteReview } from '@/src/api/admin';
import Link from 'next/link';
import { DeleteConfirmationModal } from '../_components/DeleteConfirmationModal';

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<{ id: number; product_name: string; reviewer_name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminReviews();
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleDeleteClick = (review: any) => {
        setReviewToDelete(review);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(true);
        try {
            await deleteReview(reviewToDelete.id);
            await loadReviews();
            setDeleteModalOpen(false);
            setReviewToDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete review');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredReviews = reviews.filter(r => {
        const searchStr = searchTerm.toLowerCase();
        const content = (r.comment || '').toLowerCase();
        const reviewer = (r.reviewer_name || '').toLowerCase();
        const product = (r.product_name || '').toLowerCase();

        return (
            content.includes(searchStr) ||
            reviewer.includes(searchStr) ||
            product.includes(searchStr)
        );
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reviews</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage customer reviews.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search reviews, products or customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 dark:text-gray-100 transition-all font-medium text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                                <th className="px-6 py-4 text-left">Product</th>
                                <th className="px-6 py-4 text-left">Rating</th>
                                <th className="px-6 py-4 text-left w-1/3">Review</th>
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6" colSpan={6}><div className="h-4 bg-gray-100 rounded" /></td>
                                    </tr>
                                ))
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <p className="text-gray-900 font-bold lg text-lg">No reviews found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {r.product_image ? (
                                                        <img src={r.product_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 max-w-[200px]">
                                                    <p className="font-bold text-gray-900 text-sm truncate" title={r.product_name}>{r.product_name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID: {r.product_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1 text-orange-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold text-gray-900">{r.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm text-gray-600 line-clamp-2">{r.comment}</p>
                                            {r.picture_urls && r.picture_urls.length > 0 && (
                                                <div className="flex gap-1 mt-2">
                                                    {r.picture_urls.map((url: string, idx: number) => (
                                                        <img key={idx} src={url} alt="" className="w-8 h-8 rounded object-cover border border-gray-100" />
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{r.reviewer_name}</span>
                                                <span className="text-xs text-gray-500">{r.reviewer_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <p className="text-xs font-medium text-gray-500">
                                                {new Date(r.review_date).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(r)}
                                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Review?"
                message={`Are you sure you want to delete this review by ${reviewToDelete?.reviewer_name}? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </div>
    );
}
