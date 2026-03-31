"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Loader2, Upload } from 'lucide-react';
import { API_BASE_URL } from '@/src/api/config';

interface ReviewTokenData {
    valid: boolean;
    product?: {
        id: number;
        name: string;
        image: string;
    };
    reviewer_name?: string;
    message?: string;
}

export default function SubmitReviewPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [loading, setLoading] = useState(true);
    const [tokenData, setTokenData] = useState<ReviewTokenData | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [pictures, setPictures] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            checkToken();
        }
    }, [token]);

    const checkToken = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/reviews/token/${token}`);
            const data = await res.json();
            setTokenData(data);
            if (!data.valid) {
                setError(data.message || 'Invalid or expired review link');
            }
        } catch (err) {
            setError('Failed to validate review link');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (files.length + pictures.length > 3) {
            alert("Maximum 3 photos allowed");
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPictures(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reviews/submit/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    comment,
                    picture_urls: pictures
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit review');

            setSuccess(true);
            setTimeout(() => {
                if (tokenData?.product?.id) {
                    router.push(`/product/${tokenData.product.id}`);
                } else {
                    router.push('/');
                }
            }, 3000);

        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !tokenData?.valid) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">❌</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h1>
                <p className="text-gray-500 max-w-md">{error || "This review link is no longer valid or has already been used."}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold"
                >
                    Return Home
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🎉</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
                <p className="text-gray-500 max-w-md">Your review has been submitted successfully.</p>
                <p className="text-sm text-gray-400 mt-4">Redirecting you to the product page...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Write a Review</h1>
                    <p className="text-gray-500 text-sm">Hi {tokenData.reviewer_name}, please share your experience.</p>
                </div>

                {tokenData.product && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-8">
                        <img src={tokenData.product.image} className="w-16 h-16 object-cover rounded-lg border border-gray-200" alt="" />
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{tokenData.product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Verified Purchase</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rate your experience</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-10 h-10 cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'fill-star text-star' : 'text-gray-300 hover:text-amber-200'
                                        }`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        <span className="font-bold text-lg text-amber-500">{rating}/5</span>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Your Review</label>
                        <textarea
                            required
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike?"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium resize-none"
                        />
                    </div>

                    {/* Photos */}
                    <div className="space-y-2">
                        <label htmlFor="review-photos" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Add Photos (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="review-photos"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <label
                                htmlFor="review-photos"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-gray-500 font-medium"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Click to upload images</span>
                            </label>
                        </div>

                        {pictures.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {pictures.map((pic, i) => (
                                    <div key={i} className="relative w-16 h-16 group">
                                        <img src={pic} className="w-full h-full object-cover rounded-lg border border-gray-200" alt="" />
                                        <button
                                            type="button"
                                            onClick={() => setPictures(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
