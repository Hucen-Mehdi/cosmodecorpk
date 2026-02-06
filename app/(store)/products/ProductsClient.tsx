"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/src/components/ProductCard';
import { Product, Category } from '@/src/api/api';

interface ProductsClientProps {
    initialProducts: Product[];
    initialCategories: Category[];
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsClient({ initialProducts, initialCategories }: ProductsClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('featured');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams?.get('category') || null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [showFilters, setShowFilters] = useState(false);
    const [products] = useState<Product[]>(initialProducts);
    const [categories] = useState<Category[]>(initialCategories);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Sync state with URL params when they change
    useEffect(() => {
        const categoryFromUrl = searchParams?.get('category') || null;
        if (categoryFromUrl !== selectedCategory) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, priceRange, sortBy, searchParams]);

    const filterParam = searchParams?.get('filter');

    const filteredProducts = useMemo(() => {
        let result = [...products];
        const searchVal = searchParams?.get('search')?.toLowerCase() || '';

        if (searchVal) {
            result = result.filter(p =>
                (p.name || '').toLowerCase().includes(searchVal) ||
                (p.description || '').toLowerCase().includes(searchVal) ||
                (p.category || '').toLowerCase().includes(searchVal)
            );
        }

        // Filter by URL parameter (new, bestseller)
        if (filterParam === 'new') {
            result = result.filter(p =>
                p.badge?.toLowerCase() === 'new' ||
                p.badge?.toLowerCase() === 'trending'
            );
        }

        if (filterParam === 'bestseller') {
            // Updated logic: if few items have badge, fallback to rating
            result = result.filter(p =>
                (p.badge?.toLowerCase() === 'bestseller') ||
                (typeof p.rating === 'number' && p.rating >= 4.5) // Lowered threshold slightly to 4.5
            );
        }

        if (selectedCategory) {
            result = result.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
        }

        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                result = result.filter(p => p.badge === 'New').concat(result.filter(p => p.badge !== 'New'));
                break;
        }

        return result;
    }, [products, selectedCategory, priceRange, sortBy, filterParam, searchParams]);

    const searchVal = searchParams?.get('search');

    const pageTitle = searchVal
        ? `Search results for "${searchVal}"`
        : filterParam === 'new'
            ? 'New Arrivals'
            : filterParam === 'bestseller'
                ? 'Best Sellers'
                : 'All Products';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">{pageTitle}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <p className="text-gray-600 dark:text-gray-400">
                            {filteredProducts.length} products found
                            <span className="text-xs ml-2 opacity-50">(Total: {products.length})</span>
                        </p>

                        {/* Clear Filter Button if specialized filter is active */}
                        {filterParam && (
                            <button
                                onClick={() => router.push('/products')}
                                className="text-sm bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1"
                            >
                                Clear "{filterParam === 'new' ? 'New Arrivals' : 'Best Sellers'}" Filter <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm sticky top-24 border dark:border-gray-800">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Filters
                            </h3>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            router.push('/products');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams?.toString());
                                                params.set('category', cat.id);
                                                router.push(`/products?${params.toString()}`);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000000"
                                        step="1000"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        className="w-full accent-rose-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            placeholder="Min"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    router.push('/products');
                                    setPriceRange([0, 1000000]);
                                }}
                                className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 w-full max-w-full">
                        {/* Mobile Sliding Categories */}
                        <div className="lg:hidden mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 flex items-center gap-2 no-scrollbar">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${!selectedCategory ? 'bg-rose-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border dark:border-gray-800'}`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${selectedCategory === cat.id ? 'bg-rose-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border dark:border-gray-800'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 border dark:border-gray-800">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                            >
                                <SlidersHorizontal className="w-5 h-5" /> Filters
                            </button>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>

                                <div className="hidden sm:flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000000 || filterParam || searchVal) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {searchVal && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm">
                                        Search: "{searchVal}"
                                        <button onClick={() => {
                                            const params = new URLSearchParams(searchParams?.toString());
                                            params.delete('search');
                                            router.push(`/products?${params.toString()}`);
                                        }}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                                {filterParam && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm">
                                        {filterParam === 'new' ? 'New Arrivals' : 'Best Sellers'}
                                    </span>
                                )}
                                {selectedCategory && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm">
                                        {categories.find(c => c.id === selectedCategory)?.name}
                                        <button onClick={() => setSelectedCategory(null)}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                                {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm">
                                        Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                                        <button onClick={() => setPriceRange([0, 1000000])}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                            : 'grid-cols-1'
                            }`}>
                            {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Numeric Pagination */}
                        {filteredProducts.length > itemsPerPage && (
                            <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setCurrentPage(prev => prev - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    ←
                                </button>

                                {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            setCurrentPage(page);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium ${currentPage === page
                                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                                    onClick={() => {
                                        setCurrentPage(prev => prev + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    →
                                </button>
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setPriceRange([0, 1000000]);
                                    }}
                                    className="mt-4 text-rose-500 font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 p-6 overflow-y-auto border-l dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="text-gray-600 dark:text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full accent-rose-500"
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Rs. {priceRange[0].toLocaleString()}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Rs. {priceRange[1].toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-3 rounded-xl font-semibold shadow-lg"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
