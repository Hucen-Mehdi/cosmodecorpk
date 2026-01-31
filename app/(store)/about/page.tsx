import { Users, Award, Truck, Heart, Target, Eye, Leaf, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | CosmoDecorPK - Our Story',
    description: 'Discover the story behind CosmoDecorPK. Learn about our mission to bring premium artificial plants and lifelike home decor to every home in Pakistan.',
    openGraph: {
        title: 'About Us | CosmoDecorPK - Our Story',
        description: 'Discover the story behind CosmoDecorPK and our mission for premium Pakistani home decor.',
        images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us | CosmoDecorPK - Our Story',
        description: 'Learn about CosmoDecorPK - Pakistan\'s premium home decor brand.',
        images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=630&fit=crop'],
    },
};

export default function About() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
            {/* Hero Section */}
            <section className="relative min-h-[350px] h-[50vh] md:h-[500px]">
                <img
                    src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=600&fit=crop"
                    alt="About CosmoDecorPK"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Our Story</h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto px-4">
                            Bringing life to your spaces with premium artificial plants & home decor
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-gradient-to-r from-rose-500 to-orange-400">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <p className="text-4xl md:text-5xl font-bold mb-2">5K+</p>
                            <p className="text-white/80">Happy Customers</p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-bold mb-2">200+</p>
                            <p className="text-white/80">Products</p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-bold mb-2">50+</p>
                            <p className="text-white/80">Cities Served</p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-bold mb-2">100%</p>
                            <p className="text-white/80">Advance Payment</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Content */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">Who We Are</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            CosmoDecorPK was born from a passion for bringing beauty and elegance to Pakistani homes
                            without the hassle of maintaining real plants. We specialize in premium quality artificial
                            plants, floral arrangements, and home décor that look incredibly lifelike.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Our carefully curated collection includes everything from stunning artificial plants and
                            silk flowers to elegant vases, mirrors, lighting, and seasonal Ramadan decor. Each piece
                            is handpicked to ensure it meets our high standards of quality and aesthetics.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            We're proud to serve customers across Pakistan, delivering beauty straight to their
                            doorsteps. Our commitment to quality and customer satisfaction has made us a trusted
                            name in home décor.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img
                            src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=500&fit=crop"
                            alt="Our Products"
                            className="rounded-2xl w-full h-64 object-cover"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=500&fit=crop"
                            alt="Floral Decor"
                            className="rounded-2xl w-full h-64 object-cover mt-8"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Why Choose CosmoDecorPK?</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We're not just selling décor – we're helping you create spaces you'll love
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border dark:border-gray-800 text-center transition-colors duration-200">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Leaf className="w-8 h-8 text-green-500 dark:text-green-400" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Lifelike Quality</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Our artificial plants look so real, even your guests won't tell the difference!
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border dark:border-gray-800 text-center transition-colors duration-200">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Zero Maintenance</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                No watering, no sunlight needed. Perfect for busy lifestyles and any space.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border dark:border-gray-800 text-center transition-colors duration-200">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Nationwide Delivery</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                We deliver safe and fast across Pakistan. High-quality packaging for every order.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border dark:border-gray-800 text-center transition-colors duration-200">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">Customer Love</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Thousands of happy customers trust us for their home décor needs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10 rounded-3xl p-8 border dark:border-gray-800">
                            <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Mission</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                To make every Pakistani home beautiful with premium quality artificial plants and
                                home décor that combines elegance, durability, and affordability. We aim to bring
                                joy to our customers by transforming their living spaces into beautiful sanctuaries.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-3xl p-8 border dark:border-gray-800">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-400 rounded-2xl flex items-center justify-center mb-6">
                                <Eye className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Vision</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                To become Pakistan's most loved home décor brand, known for our curated collections,
                                exceptional quality, and outstanding customer experience. We envision a future where
                                every home reflects beauty and personal style.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Our Values</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Award className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Quality First</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Every product is carefully selected to ensure premium quality.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Customer First</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your satisfaction is our priority. We're here to help you.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Truck className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Reliable Delivery</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Safe and timely delivery across Pakistan.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Transparency</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Honest communication and clear pricing, always.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-rose-500 to-orange-400">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Space?</h2>
                    <p className="text-xl text-white/80 mb-8">
                        Browse our collection and find the perfect pieces for your home
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-white text-rose-500 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Shop Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
