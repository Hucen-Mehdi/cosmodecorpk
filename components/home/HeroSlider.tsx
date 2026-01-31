"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const heroSlides = [
    {
        title: 'Transform Your Space',
        subtitle: 'Premium Artificial Plants & Home Decor',
        description: 'Up to 40% off on selected items',
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop',
        cta: 'Shop Now',
        link: '/products'
    },
    {
        title: 'Floral Elegance',
        subtitle: 'Beautiful Silk Flowers & Arrangements',
        description: 'Fast Nationwide Delivery Across Pakistan',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=600&fit=crop',
        cta: 'Explore',
        link: '/category/floral-plants'
    },
    {
        title: 'Ramadan Collection',
        subtitle: 'Make Your Home Festive',
        description: 'Lanterns, Crescent Decor & More',
        image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=600&fit=crop',
        cta: 'View Collection',
        link: '/category/ramadan-decor'
    }
];

export function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[60vh] min-h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-10" />
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center">
                        <div className="max-w-7xl mx-auto px-4 w-full">
                            <div className="max-w-xl">
                                <span className="inline-block bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-sm font-medium mb-3 sm:mb-4 animate-pulse">
                                    {slide.description}
                                </span>
                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{slide.subtitle}</h2>
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">{slide.title}</h1>
                                <Link
                                    href={slide.link}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                                >
                                    {slide.cta} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Controls */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
