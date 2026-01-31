"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Heart, User, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, Category } from '../api/api';
import { ThemeToggle } from './ThemeToggle';

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
          <span className="hidden md:block">📞 Call us: 0320-9937113<br />0335-0500333</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">C</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">CosmoDecor<span className="text-rose-500">PK</span></h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Premium Home Decor</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-800 dark:text-white">CosmoDecor<span className="text-rose-500">PK</span></h1>
            </div>
          </Link>

          {/* Search Bar - Desktop Centering Container */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search for plants, decor, lighting..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 dark:bg-gray-800 dark:text-gray-100 transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
            {/* Theme Toggle - Visible Everywhere */}
            <ThemeToggle />

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

            {/* Cart - Visible Everywhere (Label Desktop Only) */}
            <Link href="/cart" className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors relative">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rose-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
              <span className="hidden lg:block text-[10px] mt-1 font-medium">Cart</span>
            </Link>

            {/* Mobile Menu Button - Mobile Only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      🌿 Plants
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
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      🏠 Home Decor
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
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      💡 More
                    </h3>
                    <div className="space-y-1">
                      <Link href="/category/lighting-lamps" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        Lighting & Lamps
                      </Link>
                      <Link href="/category/ramadan-decor" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        🌙 Ramadan Decor
                      </Link>
                      <Link href="/category/gift-ideas" className="block py-1.5 text-gray-600 dark:text-gray-300 hover:text-rose-500">
                        🎁 Gift Ideas
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
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="flex flex-col pb-20">
            {/* Main Menu */}
            <Link href="/" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 font-medium" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products?filter=new" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 font-medium" onClick={() => setIsMenuOpen(false)}>
              New Arrivals
            </Link>
            <Link href="/products?filter=bestseller" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 font-medium" onClick={() => setIsMenuOpen(false)}>
              Best Sellers
            </Link>

            {/* Shop by Collection */}
            <div className="px-4 py-3 text-gray-800 dark:text-gray-100 font-bold bg-gray-50 dark:bg-gray-800">Shop by Collection</div>

            {categories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => setExpandedMobileCategory(expandedMobileCategory === category.id ? null : category.id)}
                  className="w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span> {category.name}
                  </span>
                  {category.subcategories && (
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedMobileCategory === category.id ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {expandedMobileCategory === category.id && category.subcategories && (
                  <div className="bg-gray-50 dark:bg-gray-800 py-2">
                    <Link
                      href={`/category/${category.id}`}
                      className="block px-8 py-2 text-rose-500 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All {category.name}
                    </Link>
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.id}?sub=${sub.id}`}
                        className="block px-8 py-2 text-gray-600 dark:text-gray-400 hover:text-rose-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              {!user && (
                <Link href="/login" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-5 h-5" /> Log in
                </Link>
              )}
              {user && (
                <>
                  <Link href="/account" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-5 h-5" /> My Account
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              )}
              <Link href="/about" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 block" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/contact" className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-500 block" onClick={() => setIsMenuOpen(false)}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
