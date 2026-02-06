"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Heart, User, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, Category, searchProducts } from '../api/api';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setSearchError(null);
        try {
          const data = await searchProducts(searchQuery.trim());
          setSearchResults(data.products || []);
          setShowResults(true);
        } catch (err) {
          console.error('Search error:', err);
          setSearchError('Search temporarily unavailable');
          setShowResults(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
        setSearchError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setShowResults(false);
      // Force blur the input to hide keyboard on mobile and give visual feedback
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const mainMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'New Arrivals', path: '/products?filter=new' },
    { name: 'Best Sellers', path: '/products?filter=bestseller' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🚚 Fast Nationwide Delivery Across Pakistan</span>
          <span className="hidden md:block">📞 Call us: 0320-9937113</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile: Hamburger on Left */}
          <div className="lg:hidden w-12 flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo: Centered on Mobile, Left on Desktop */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="overflow-hidden h-16 sm:h-20">
                <img
                  src="https://res.cloudinary.com/dpz4mq1ql/image/upload/v1770403762/HEADER_LOGO_1_lqgt2p.png"
                  alt="CosmoDecor PK"
                  className="h-24 sm:h-28 w-auto -my-4" /* Negative margins crop whitespace */
                />
              </div>
            </Link>
          </div>
          <div className="hidden lg:flex flex-1 justify-center px-8 relative">
            <form onSubmit={handleSearch} className="relative w-full max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                autoComplete="off"
                placeholder="Search for plants, decor, lighting..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 dark:bg-gray-800 dark:text-gray-100 transition-all font-medium"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors" />
              </button>
            </form>

            {/* Desktop Search Results */}
            {showResults && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-red-500 font-medium">
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        onClick={() => setShowResults(false)}
                      >
                        <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 dark:text-white truncate group-hover:text-rose-500 transition-colors">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
                        </div>
                        <p className="font-black text-rose-500">Rs. {product.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-6 w-12 lg:w-auto flex-none lg:flex-1">
            {/* Mobile Search Icon - Visible on Mobile only */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Wishlist - Desktop Only */}
            <Link href="/wishlist" className="hidden lg:flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden lg:block text-[10px] mt-1 font-medium">Wishlist</span>
            </Link>

            {/* Auth - Desktop Only */}
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <Link href="/account" className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden lg:block text-[10px] mt-1 font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden lg:block text-[10px] mt-1 font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center">
                <Link href="/login" className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden lg:block text-[10px] mt-1 font-medium">Log in</span>
                </Link>
              </div>
            )}

            {/* Cart - Visible Everywhere */}
            <Link href="/cart" className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors relative">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rose-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {totalItems}
                </span>
              )}
              <span className="hidden lg:block text-[10px] mt-1 font-medium">Cart</span>
            </Link>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Main Menu Items */}
          {mainMenuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`font-medium transition-colors ${pathname === item.path ? 'text-rose-500' : 'text-gray-700 dark:text-gray-300 hover:text-rose-500'}`}
            >
              {item.name}
            </Link>
          ))}

          {/* Shop by Collection Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsShopOpen(true)}
            onMouseLeave={() => setIsShopOpen(false)}
          >
            <button className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-rose-500 transition-colors">
              Shop by Collection <ChevronDown className="w-4 h-4" />
            </button>

            {isShopOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 min-w-[700px] z-50">
                <div className="grid grid-cols-4 gap-6">
                  {/* Plants Column */}
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                      Plants
                    </h3>
                    <div className="space-y-1">
                      <Link href="/category/artificial-plants" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500 font-medium">
                        Artificial Plants
                      </Link>
                      <Link href="/category/floral-plants" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500 font-medium">
                        Floral Plants
                      </Link>
                    </div>
                  </div>

                  {/* Home Decor Column */}
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                      Home Decor
                    </h3>
                    <div className="space-y-1">
                      <Link href="/category/table-decor" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Table Decor
                      </Link>
                      <Link href="/category/corner-decor" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Corner Decor
                      </Link>
                      <Link href="/category/wall-decor" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Wall Decor
                      </Link>
                    </div>
                  </div>

                  {/* Lighting & Seasonal */}
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                      More
                    </h3>
                    <div className="space-y-1">
                      <Link href="/category/lighting-lamps" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Lighting & Lamps
                      </Link>
                      <Link href="/category/ramadan-decor" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Ramadan Decor
                      </Link>
                      <Link href="/category/gift-ideas" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Gift Ideas
                      </Link>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=200&fit=crop"
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <p className="font-bold">New Arrivals</p>
                        <p className="text-sm opacity-80">Shop Now →</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View All Link */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                  <Link href="/products" className="text-rose-500 font-semibold hover:underline">
                    View All Products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className={`font-medium transition-colors ${pathname === '/about' ? 'text-rose-500' : 'text-gray-700 dark:text-gray-300 hover:text-rose-500'}`}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className={`font-medium transition-colors ${pathname === '/contact' ? 'text-rose-500' : 'text-gray-700 dark:text-gray-300 hover:text-rose-500'}`}
          >
            Contact Us
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] sm:top-[124px] bg-white dark:bg-gray-900 z-40 overflow-y-auto transition-colors duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                autoComplete="off"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </form>

            {/* Mobile Search Results */}
            {showResults && (
              <div className="absolute left-4 right-4 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
                ) : searchError ? (
                  <div className="p-4 text-center text-red-500 text-sm font-medium">{searchError}</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => { setShowResults(false); setIsMenuOpen(false); }}
                      >
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 dark:text-white truncate text-sm">{product.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
                        </div>
                        <p className="font-bold text-rose-500 text-sm italic">Rs. {product.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">No products found</div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col pb-20">
            {/* Main Menu Links */}
            <Link
              href="/"
              className={`px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 border-l-4 border-transparent hover:border-rose-500 transition-all font-semibold ${pathname === '/' ? 'text-rose-500 border-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products?filter=bestseller"
              className={`px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 border-l-4 border-transparent hover:border-rose-500 transition-all font-semibold ${pathname === '/products' && searchQuery === 'bestseller' ? 'text-rose-500 border-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Best Sellers
            </Link>

            {/* Shop by Collection Header */}
            <div className="px-4 py-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black bg-gray-50/50 dark:bg-gray-800/50 mt-2">
              Shop by Collection
            </div>

            {categories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === category.id ? null : category.id)}
                  className="w-full px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                >
                  <span className="font-medium">{category.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedMobileCategory === category.id ? 'rotate-90 text-rose-500' : 'text-gray-400'}`} />
                </button>

                {expandedMobileCategory === category.id && (
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 py-2 border-b border-gray-100 dark:border-gray-800/50 animate-in slide-in-from-top-4 duration-300">
                    <Link
                      href={`/category/${category.id}`}
                      className="block px-8 py-3 text-rose-500 font-bold text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All {category.name}
                    </Link>
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.id}?sub=${sub.id}`}
                        className="block px-8 py-3 text-gray-600 dark:text-gray-300 hover:text-rose-500 text-sm font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Footer Links in Menu */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/about"
                className="px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 font-semibold flex items-center transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 font-semibold flex items-center transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>

            {/* Account Management */}
            <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
              {!user ? (
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-md shadow-rose-200 dark:shadow-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" /> Log in
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">{user.name}</p>
                      <Link href="/account" className="text-xs text-rose-500 font-medium" onClick={() => setIsMenuOpen(false)}>My Account →</Link>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-950 text-rose-500 dark:text-rose-400 py-3 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-bold"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
