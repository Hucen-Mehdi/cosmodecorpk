"use client";

import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, Eye, X } from 'lucide-react';
import { Product } from '../api/api';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const router = useRouter();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/product/${product.id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {product.badge && (
              <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${product.badge === 'Sale' ? 'bg-red-500 text-white' :
                product.badge === 'New' ? 'bg-green-500 text-white' :
                  product.badge === 'Bestseller' ? 'bg-amber-500 text-white' :
                    product.badge === 'Trending' ? 'bg-purple-500 text-white' :
                      'bg-rose-500 text-white'
                }`}>
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick Actions - Visible on mobile, hover on desktop */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white'
                } shadow-md backdrop-blur-sm`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white transition-colors shadow-md backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Add to Cart Button - Slide in on desktop, fixed bottom on mobile or always visible slightly */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform hidden sm:block">
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-2 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-rose-500 transition-colors line-clamp-2 mb-1 sm:mb-2 text-sm sm:text-base h-10 sm:h-12">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">({product.reviews})</span>
          </div>

          {/* Price & Mobile Add to Cart */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <span className="text-base sm:text-xl font-bold text-rose-500">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {/* Mobile-only Add to Cart button */}
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="sm:hidden w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowQuickView(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-4 sm:p-8 flex flex-col md:flex-row gap-6 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 z-10 bg-white dark:bg-gray-900 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full md:w-1/2 aspect-square flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full rounded-2xl object-cover" />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">{product.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 sm:w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">({product.reviews} reviews)</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base leading-relaxed">{product.description}</p>
              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-rose-500">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-base sm:text-lg text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <button
                  onClick={() => { addToCart(product); setShowQuickView(false); }}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
