"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchHeroSlides, HeroSlide } from '@/src/api/api';

const heroMessages = [
    "🚚 Fast Nationwide Delivery Across Pakistan",
    "🌟 Premium Quality Artificial Plants & Decor",
    "💎 100% Customer Satisfaction Guaranteed"
];
const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

export function HeroSlider() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [msgIndex, setMsgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const data = await fetchHeroSlides();
                if (data.length > 0) {
                    setSlides(data);
                }
            } catch (err) {
                console.error('Failed to load hero slides:', err);
            } finally {
                setLoading(false);
            }
        };
        loadSlides();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides]);

    useEffect(() => {
        if (isHovered) return;
        const messageTimer = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % heroMessages.length);
        }, 4500);
        return () => clearInterval(messageTimer);
    }, [isHovered]);

    if (loading) {
        return <div className="h-[220px] sm:h-[400px] md:h-[550px] bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (slides.length === 0) return null;

    return (
        <section className="relative h-[220px] sm:h-[400px] md:h-[550px] overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-10" />
                    <Image
                        src={slide.image_url}
                        alt={slide.title}
                        fill
                        priority={index <= 1}
                        sizes="100vw"
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        style={{ objectFit: 'cover' }}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center">
                        <div className="max-w-7xl mx-auto px-4 w-full">
                            <div className="max-w-xl">
                                <span className="inline-block bg-rose-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium mb-2 sm:mb-3 animate-pulse">
                                    {slide.description}
                                </span>
                                <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-1">{slide.subtitle}</h2>
                                <div 
                                    className="relative text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div className="grid grid-cols-1 grid-rows-1">
                                        {heroMessages.map((msg, idx) => (
                                            <h1 
                                                key={idx}
                                                className={`col-start-1 row-start-1 transition-opacity duration-1000 ease-in-out ${idx === msgIndex ? 'opacity-100' : 'opacity-0 invisible'}`}
                                            >
                                                {msg}
                                            </h1>
                                        ))}
                                    </div>
                                </div>
                                <Link
                                    href={slide.link_url}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                                >
                                    {slide.cta_text} <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Controls */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
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
