import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/src/components/ProductCard';
import { fetchProducts, fetchCategories, Product, Category as CategoryType } from '@/src/api/api';
import { Metadata } from 'next';

type Props = {
    params: { id: string };
    searchParams: { sub?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const categories = await fetchCategories();
    const category = categories.find((c: CategoryType) => c.id.toLowerCase() === params.id.toLowerCase());
    const categoryName = category?.name || params.id.replace('-', ' ');
    const title = `${categoryName} | CosmoDecorPK`;
    const description = category?.description || `Explore our premium collection of ${categoryName}. Transform your space with high-quality artificial plants and home decor from CosmoDecorPK.`;
    const image = category?.image || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                    alt: categoryName,
                }
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

// ... (existing imports and code)

export async function generateStaticParams() {
    try {
        const categories = await fetchCategories();
        return categories.map((category: CategoryType) => ({
            id: category.id,
        }));
    } catch (e) {
        console.error("Error generating static params for categories:", e);
        return [];
    }
}

export default async function CategoryPage({ params, searchParams }: Props) {
    // ... (rest of the component)
    const { id } = params;
    const subFilter = searchParams.sub;

    let products: Product[] = [];
    let categories: CategoryType[] = [];

    try {
        const [productsData, categoriesData] = await Promise.all([
            fetchProducts(),
            fetchCategories()
        ]);
        products = productsData;
        categories = categoriesData;
    } catch (error) {
        console.error('Error loading category data:', error);
    }

    const category = categories.find(c => c.id.toLowerCase() === id.toLowerCase());

    const categoryProducts = products.filter(
        p => p.category?.toLowerCase() === id.toLowerCase()
    );

    if (categoryProducts.length === 0 && !category) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Category Not Found</h1>
                    <Link href="/products" className="text-rose-500 hover:underline">
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    const categoryName = category?.name || id.replace('-', ' ');
    const categoryIcon = category?.icon || '📦';
    const categoryImage = category?.image || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80">
                <img
                    src={categoryImage}
                    alt={categoryName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 w-full">
                        <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/products" className="hover:text-white">Products</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white">{categoryName}</span>
                        </nav>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-3xl sm:text-5xl">{categoryIcon}</span>
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">{categoryName}</h1>
                                <p className="text-white/80 mt-1 sm:mt-2 text-sm">{categoryProducts.length} Products</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                {/* Subcategories */}
                {category?.subcategories && category.subcategories.length > 0 && (
                    <div className="mb-8 sm:mb-12">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">Shop by Type</h2>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Link
                                href={`/category/${id}`}
                                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base transition-colors shadow-sm ${!subFilter
                                    ? 'bg-rose-500 text-white shadow-rose-500/20'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-rose-400 dark:hover:border-rose-400 hover:text-rose-500 dark:hover:text-rose-500'
                                    }`}
                            >
                                All
                            </Link>
                            {category.subcategories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/category/${id}?sub=${sub.id}`}
                                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base transition-colors shadow-sm ${subFilter === sub.id
                                        ? 'bg-rose-500 text-white shadow-rose-500/20'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-rose-400 dark:hover:border-rose-400 hover:text-rose-500 dark:hover:text-rose-500'
                                        }`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categoryProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {categoryProducts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No products in this category yet.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-rose-500 font-medium hover:underline"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
