import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/src/components/ProductCard';
import { fetchProducts, fetchCategories, Product, Category as CategoryType } from '@/src/api/api';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string };
  searchParams: { sub?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.id.replace('-', ' ');

  return {
    title: `${categoryName} | CosmoDecorPK`,
    description: `Explore our premium collection of ${categoryName} at CosmoDecorPK.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = params;
  const subFilter = searchParams.sub;

  let products: Product[] = [];
  let categories: CategoryType[] = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error('Error loading category data:', error);
  }

  const category = categories.find(
    (c) => c.id.toLowerCase() === id.toLowerCase()
  );

  const categoryProducts = products.filter(
    (p) => p.category?.toLowerCase() === id.toLowerCase()
  );

  if (categoryProducts.length === 0 && !category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Category Not Found
          </h1>
          <Link href="/products" className="text-rose-500 hover:underline">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = category?.name || id.replace('-', ' ');
  const categoryIcon = category?.icon || '📦';
  const categoryImage =
    category?.image ||
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop';

  const hasSubcategories =
    Array.isArray(category?.subcategories) &&
    category.subcategories.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
            <div className="flex items-center gap-3">
              <span className="text-4xl">{categoryIcon}</span>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white">
                  {categoryName}
                </h1>
                <p className="text-white/80">
                  {categoryProducts.length} Products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Subcategories */}
        {hasSubcategories && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Shop by Type</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/category/${id}`}
                className={!subFilter ? 'bg-rose-500 text-white px-4 py-2 rounded-full' : 'px-4 py-2 rounded-full border'}
              >
                All
              </Link>

              {category!.subcategories!.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/category/${id}?sub=${sub.id}`}
                  className={
                    subFilter === sub.id
                      ? 'bg-rose-500 text-white px-4 py-2 rounded-full'
                      : 'px-4 py-2 rounded-full border'
                  }
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
