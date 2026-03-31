"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/context/CartContext';
import { ProductCard } from '@/src/components/ProductCard';
import { Product, Review, fetchReviews, submitReview } from '@/src/api/api';
import Image from 'next/image';

const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [displayImage, setDisplayImage] = useState(product.image);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>(() => {
        const defaults: { [key: string]: string } = {};
        if (product.variations) {
            product.variations.forEach(v => {
                if (v.options.length > 0) {
                    defaults[v.name] = v.options[0];
                }
            });
        }
        return defaults;
    });

    // Review State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, name: '', email: '', comment: '', pictures: [] as string[] });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchReviews(product.id).then(setReviews);
    }, [product.id]);

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;
                    const max_size = 800;

                    if (width > height && width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    } else if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Limit to 3 photos
        if (files.length + reviewForm.pictures.length > 3) {
            alert("Maximum 3 photos allowed");
            return;
        }

        const newPictures: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const resized = await resizeImage(files[i]);
            newPictures.push(resized);
        }

        setReviewForm(prev => ({ ...prev, pictures: [...prev.pictures, ...newPictures] }));
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const newReview = await submitReview({
                product_id: product.id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                reviewer_name: reviewForm.name,
                reviewer_email: reviewForm.email,
                picture_urls: reviewForm.pictures
            });

            // Optimistic update or refetch
            setReviews([newReview, ...reviews]);
            setReviewForm({ rating: 5, name: '', email: '', comment: '', pictures: [] });
            alert('Review submitted successfully!');
        } catch (err: any) {
            alert(err.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const currentPrice = (() => {
        let price = product.price;
        if (product.variations) {
            Object.entries(selectedVariations).forEach(([name, option]) => {
                const variation = product.variations?.find(v => v.name === name);
                if (variation && variation.priceAdjustments[option]) {
                    price += variation.priceAdjustments[option];
                }
            });
        }
        return price;
    })();

    const formatPrice = (price: number) => {
    return 'Rs ' + Math.round(price).toLocaleString('en-US');
  };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariations);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity, selectedVariations);
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* Removed top breadcrumb */},

            {/* Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border dark:border-gray-800">
                            <Image
                                src={displayImage || '/placeholder.png'}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={true}
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                            {product.badge && (
                                <span className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${product.badge === 'Sale' ? 'bg-primary text-white' :
                                    product.badge === 'New' ? 'bg-primary-light text-primary-dark' :
                                        product.badge === 'Bestseller' ? 'bg-star text-white' :
                                            'bg-primary text-white'
                                    }`}>
                                    {product.badge}
                                </span>
                            )}
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${isWishlisted ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white'
                                    }`}
                            >
                                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        {/* Thumbnail Gallery */}
                        {(product.additionalImages && product.additionalImages.length > 0) && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setDisplayImage(product.image)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${displayImage === product.image ? 'border-rose-500 scale-95' : 'border-transparent hover:border-rose-200'}`}
                                >
                                    <Image src={product.image || '/placeholder.png'} fill sizes="80px" className="object-cover" alt="Main" />
                                </button>
                                {product.additionalImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setDisplayImage(img)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${displayImage === img ? 'border-rose-500 scale-95' : 'border-transparent hover:border-rose-200'}`}
                                    >
                                        <Image src={img || '/placeholder.png'} fill sizes="80px" className="object-cover" alt={`Gallery ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex flex-col gap-4">
                            {/* 1. Title with Rating */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">{product.name}</h1>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-star fill-star' : 'text-gray-300 dark:text-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {product.rating} <span className="text-gray-400">|</span> {product.reviews} reviews
                                    </span>
                                </div>
                            </div>

                            {/* 2. "X sold" badge (if applicable) */}
                            {product.badge === 'Trending' && (
                                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full w-fit">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-amber-700 dark:text-star">
                                        {Math.floor(Math.random() * 20) + 10} sold in last 24 hours
                                    </span>
                                </div>
                            )}

                            {/* 3. Price with sale percentage */}
                            <div className="flex items-end gap-3 mt-2">
                                <span className="text-4xl font-bold text-primary leading-none">{formatPrice(currentPrice)}</span>
                                {product.originalPrice && (
                                    <div className="flex flex-col mb-1">
                                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through decoration-1">{formatPrice(product.originalPrice)}</span>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                            -{discount}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>


                            {/* Breadcrumbs (Small) */}
                            <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 my-2">
                                <Link href="/" className="hover:text-primary">Home</Link>
                                <ChevronRight className="w-3 h-3" />
                                <Link href="/products" className="hover:text-primary">Products</Link>
                                <ChevronRight className="w-3 h-3" />
                                <Link href={`/category/${product.category || ''}`} className="hover:text-primary capitalize">
                                    {(product.category || 'Category').replace('-', ' ')}
                                </Link>
                            </nav>

                            {/* Warranty information - moved below price */}
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800 w-fit mt-2">
                                <Shield className="w-3 h-3 text-green-500" />
                                <span>{product.badge === 'New' ? '2 Year Premium Warranty' : '1 Year Standard Warranty'} Included</span>
                            </div>



                            {/* 5. Product variations */}
                            {product.variations && product.variations.length > 0 && (
                                <div className="space-y-4 py-4 border-t border-gray-100 dark:border-gray-800">
                                    {product.variations.map((variation) => (
                                        <div key={variation.name}>
                                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                                                {variation.name}: <span className="text-primary">{selectedVariations[variation.name]}</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {variation.options.map((option) => {
                                                    const adjustment = variation.priceAdjustments[option] || 0;
                                                    const isSelected = selectedVariations[variation.name] === option;
                                                    return (
                                                        <button
                                                            key={option}
                                                            onClick={() => setSelectedVariations({ ...selectedVariations, [variation.name]: option })}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${isSelected
                                                                ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-200 dark:hover:border-rose-800'
                                                                }`}
                                                        >
                                                            {option}
                                                            {adjustment !== 0 && (
                                                                <span className="ml-1 text-[10px] opacity-75">
                                                                    ({adjustment > 0 ? '+' : ''}{formatPrice(adjustment)})
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 6. Quantity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-semibold text-gray-900 dark:text-white tabular-nums">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {product.stock < 20 && (
                                        <span className="text-sm font-medium text-primary animate-pulse">
                                            Only {product.stock} left!
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 7. & 8. Actions (Add to Cart / Buy Now) */}
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all active:scale-[0.98]"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-[1.5] bg-gradient-to-r from-rose-600 to-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none hover:shadow-xl hover:translate-y-[-1px] transition-all active:scale-[0.98]"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* FEATURES & DESCRIPTION (Moved Down) */}
                        <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Product Details</h3>

                            {/* Collapsible Description */}
                            <div className="relative">
                                <div className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${isDescriptionExpanded ? 'max-h-full' : 'max-h-24'}`}>
                                    <p>{product.description}</p>

                                    {/* Dummy extra content to make it look longer for demo if short */}
                                    <p className="mt-4">
                                        Enhance your living space with our premium quality {product.name}.
                                        Crafted with attention to detail, this piece combines elegance with durability.
                                        Perfect for modern homes, offices, and special occasions.
                                    </p>
                                </div>

                                {!isDescriptionExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
                                )}

                                <button
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="mt-2 text-primary font-semibold text-sm hover:underline flex items-center gap-1"
                                >
                                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                                    <ChevronRight className={`w-3 h-3 transition-transform ${isDescriptionExpanded ? '-rotate-90' : 'rotate-90'}`} />
                                </button>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <Truck className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Fast Delivery</p>
                                        <p className="text-xs text-gray-500">2-4 Working Days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <RotateCcw className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Easy Returns</p>
                                        <p className="text-xs text-gray-500">7 Day Policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Customer Reviews</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                                                    {review.reviewer_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{review.reviewer_name}</h4>
                                                    <div className="flex items-center gap-1">
                                                        <span className="flex text-star">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                                                            ))}
                                                        </span>
                                                        {review.verified_purchase && (
                                                            <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-medium ml-2">Verified Purchase</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(review.review_date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{review.comment}</p>

                                        {/* Review Images */}
                                        {review.picture_urls && review.picture_urls.length > 0 && (
                                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                                {review.picture_urls.map((url, idx) => (
                                                    <div key={idx} className="relative w-20 h-20 flex-shrink-0">
                                                        <Image
                                                            src={url || '/placeholder.png'}
                                                            alt={`Review by ${review.reviewer_name}`}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                                                            onClick={() => window.open(url, '_blank')}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Write a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                className="focus:outline-none"
                                            >
                                                <Star className={`w-6 h-6 ${reviewForm.rating >= star ? 'text-star fill-star' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={reviewForm.name}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={reviewForm.email}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none resize-none"
                                        placeholder="What did you like or dislike?"
                                    />
                                </div>

                                {/* Pictures */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pictures (Optional, max 3)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        disabled={reviewForm.pictures.length >= 3}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700 transition-all"
                                    />
                                    {reviewForm.pictures.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {reviewForm.pictures.map((url, idx) => (
                                                <div key={idx} className="relative group w-16 h-16 flex-shrink-0">
                                                    <Image src={url || '/placeholder.png'} fill sizes="64px" alt="Upload preview" className="object-cover rounded-lg border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setReviewForm(prev => ({
                                                            ...prev,
                                                            pictures: prev.pictures.filter((_, i) => i !== idx)
                                                        }))}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
