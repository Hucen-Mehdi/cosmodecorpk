import Link from 'next/link';
import { Instagram, Mail, Phone, MapPin, MessageCircle, Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">CosmoDecor<span className="text-rose-500">PK</span></h2>
            </div>
            <p className="mb-4 leading-relaxed">
              Transform your space with premium artificial plants, floral arrangements & home decor. Quality craftsmanship, timeless designs.
            </p>
            <div className="flex gap-4">
              <a href="https://www.tiktok.com/@cosmodecorpk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-gray-700 dark:hover:text-white transition-all">
                <Music2 className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/cosmodecorpk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/923209937113" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-rose-500 transition-colors">Home</Link></li>
              <li><Link href="/products?filter=new" className="hover:text-rose-500 transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?filter=bestseller" className="hover:text-rose-500 transition-colors">Best Sellers</Link></li>
              <li><Link href="/products" className="hover:text-rose-500 transition-colors">All Products</Link></li>
              <li><Link href="/about" className="hover:text-rose-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-rose-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Shop by Collection</h3>
            <ul className="space-y-2">
              <li><Link href="/category/artificial-plants" className="hover:text-rose-500 transition-colors">Artificial Plants</Link></li>
              <li><Link href="/category/floral-plants" className="hover:text-rose-500 transition-colors">Floral Plants</Link></li>
              <li><Link href="/category/table-decor" className="hover:text-rose-500 transition-colors">Table Decor</Link></li>
              <li><Link href="/category/corner-decor" className="hover:text-rose-500 transition-colors">Corner Decor</Link></li>
              <li><Link href="/category/wall-decor" className="hover:text-rose-500 transition-colors">Wall Decor</Link></li>
              <li><Link href="/category/lighting-lamps" className="hover:text-rose-500 transition-colors">Lighting & Lamps</Link></li>
              <li><Link href="/category/ramadan-decor" className="hover:text-rose-500 transition-colors">Ramadan Decor</Link></li>
              <li><Link href="/category/gift-ideas" className="hover:text-rose-500 transition-colors">Gift Ideas</Link></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Khattak Plaza, China Market, Rawalpindi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-rose-500" />
                <span>03209937113</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rose-500" />
                <span>admin@cosmodecor.pk</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <a href="https://wa.me/923209937113" className="text-green-500 hover:underline font-medium">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2024 CosmoDecorPK. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm">We Accept:</span>
              <div className="flex gap-2">
                <div className="bg-purple-600 px-3 py-1 rounded text-xs font-bold text-white shadow-sm">NayaPay</div>
                <div className="bg-red-600 px-3 py-1 rounded text-xs font-bold text-white shadow-sm">JazzCash</div>
                <div className="bg-green-600 px-3 py-1 rounded text-xs font-bold text-white shadow-sm">EasyPaisa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
}
