import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/src/components/ProductCard';

const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
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
  const id = params.id;
  const normalizedId = id.toLowerCase();
  const subFilter = searchParams.sub;

  let products: Product[] = [];
  let categories: CategoryType[] = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts({ category: normalizedId }),
      fetchCategories(),
    ]);
    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error('Error loading category data:', error);
  }

  const category = categories.find(
    (c: CategoryType) => c.id.toLowerCase() === normalizedId
  );

  const selectedSub = category?.subcategories?.find((s: any) => s.id === subFilter);

  const categoryProducts = products
    .filter((p: Product) => {
      // 1. Verify Product belongs to current Main Category (Primary or via Array)
      const mainCategoryMatch =
        (p.category || '').toLowerCase() === normalizedId ||
        p.categoryIds?.some(cid => cid.toLowerCase() === normalizedId);

      if (!mainCategoryMatch) return false;

      // If no subfilter, return all matching products
      if (!subFilter) return true;

      // 2. Handle Subfilters (Price & Subcategories)
      const normalize = (str: string) => str.toLowerCase().replace(/,/g, '').replace('k', '000');
      const subName = selectedSub ? normalize(selectedSub.name) : '';
      const subId = normalize(subFilter || '');

      // Price "Virtual" Filters
      if (subId.includes('under-5000') || subName.includes('under 5000')) {
        return p.price < 5000;
      }
      if (subId.includes('under-10000') || subName.includes('under 10000')) {
        return p.price < 10000;
      }
      if (subId.includes('above-10000') || subName.includes('above 10000')) {
        return p.price >= 10000;
      }

      // Standard Subcategory / Type Matching
      const filterSub = subFilter.toLowerCase();
      const filterName = selectedSub ? selectedSub.name.toLowerCase() : '';
      const productSub = (p.subcategory || '').toLowerCase();

      // Check if product matches subcategory via:
      // - subcategory string name
      // - category ID (if mapped directly)
      // - categoryIds array
      const isSubcategoryMatch =
        productSub === filterSub ||
        (filterName && productSub === filterName) ||
        (p.category || '').toLowerCase() === filterSub ||
        p.categoryIds?.some(cid => cid.toLowerCase() === filterSub);

      return isSubcategoryMatch;
    })
    .sort((a: Product, b: Product) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000));

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
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={categoryImage}
          alt={categoryName}
          fill
          priority
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="object-cover"
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
            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
              <Link
                href={`/category/${id}`}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${!subFilter ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                All
              </Link>
              {category!.subcategories!.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/category/${id}?sub=${sub.id}`}
                  className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${subFilter === sub.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
