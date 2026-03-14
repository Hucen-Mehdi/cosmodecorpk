
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin } from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    review_date: string;
    picture_urls?: string[];
    verified_purchase: boolean;
    product_name: string;
    product_image?: string;
    location?: string;
}

export function ReviewsCarousel({ initialReviews }: { initialReviews: Review[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [visibleCount, setVisibleCount] = useState(3);

    // Responsive visible count
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setVisibleCount(1);
            else setVisibleCount(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => {
            const next = prev + visibleCount;
            return next >= initialReviews.length ? 0 : next;
        });
    }, [visibleCount, initialReviews.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => {
            const next = prev - visibleCount;
            return next < 0 ? Math.max(0, initialReviews.length - visibleCount) : next;
        });
    }, [visibleCount, initialReviews.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    if (initialReviews.length === 0) return null;

    // Split reviews into groups based on visibleCount
    const displayedReviews = initialReviews.slice(currentIndex, currentIndex + visibleCount);

    return (
        <section className="py-10 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-normal text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                        Let customers speak for us
                    </h2>
                    <div className="flex justify-center mb-1">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-8 h-8 fill-current" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Slideshow Container */}
                <div className="relative mb-4">
                    <div className="flex flex-col lg:flex-row gap-8 justify-center min-h-[250px]">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col lg:flex-row gap-8 w-full justify-center"
                            >
                                {displayedReviews.map((review) => (
                                    <div 
                                        key={review.id} 
                                        className="w-full lg:w-1/3 flex gap-4 items-center"
                                    >
                                        {/* Image Section - slightly smaller */}
                                        <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] flex-shrink-0 rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            {review.picture_urls && review.picture_urls.length > 0 ? (
                                                <img 
                                                    src={review.picture_urls[0]} 
                                                    alt={review.reviewer_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : review.product_image ? (
                                                <img 
                                                    src={review.product_image} 
                                                    alt={review.product_name}
                                                    className="w-full h-full object-cover grayscale-[0.2]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                    <Quote className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex text-amber-400 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-current" />
                                                ))}
                                            </div>
                                            
                                            <h3 className="font-bold text-gray-800 dark:text-white text-base mb-0.5 leading-tight">
                                                {review.product_name}
                                            </h3>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 text-xs leading-snug line-clamp-3 mb-2">
                                                {review.comment}
                                            </p>
                                            
                                            <div className="mt-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {review.reviewer_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Arrows - Bottom Center - Changed to orange theme */}
                <div className="flex justify-center gap-6 mt-2">
                    <button 
                        onClick={prevSlide}
                        className="text-orange-500 hover:text-rose-500 transition-colors"
                        aria-label="Previous reviews"
                    >
                        <ChevronLeft className="w-10 h-10 stroke-[3px]" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="text-orange-500 hover:text-rose-500 transition-colors"
                        aria-label="Next reviews"
                    >
                        <ChevronRight className="w-10 h-10 stroke-[3px]" />
                    </button>
                </div>
            </div>
        </section>
    );
}
