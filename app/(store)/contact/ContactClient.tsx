"use client";

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactForm } from '@/src/api/api';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await submitContactForm(formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* Hero Section */}
            <section className="relative h-64 md:h-80 bg-gradient-to-r from-rose-500 to-orange-400">
                <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
                        <p className="text-xl text-white/80">We'd love to hear from you!</p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-rose-900/10 text-center border dark:border-gray-800 transition-colors duration-200">
                        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-7 h-7 text-rose-500" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Visit Us</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Shop #123, China Market,<br />Rawalpindi, Pakistan
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-rose-900/10 text-center border dark:border-gray-800 transition-colors duration-200">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-7 h-7 text-green-500 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Call Us</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            0320-9937113<br />0335-0500333
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-rose-900/10 text-center border dark:border-gray-800 transition-colors duration-200">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Email Us</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            info@cosmodecorpk.com<br />support@cosmodecorpk.com
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg dark:shadow-rose-900/10 text-center border dark:border-gray-800 transition-colors duration-200">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Working Hours</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Mon - Sat: 10AM - 9PM<br />Sunday: 12PM - 8PM
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border dark:border-gray-800 transition-colors duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Send Us a Message</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p>Your message has been sent successfully! We'll get back to you soon.</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={status === 'submitting'}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={status === 'submitting'}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        disabled={status === 'submitting'}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="0300-1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Subject</label>
                                    <select
                                        disabled={status === 'submitting'}
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20 disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Status</option>
                                        <option value="return">Returns & Refunds</option>
                                        <option value="custom">Custom Orders</option>
                                        <option value="feedback">Feedback</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Your Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    disabled={status === 'submitting'}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20 resize-none disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder="How can we help you?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-rose-100 dark:hover:shadow-rose-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Map & Additional Info */}
                    <div className="space-y-6">
                        {/* Map Placeholder */}
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl h-80 flex items-center justify-center overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.0127!2d67.0737!3d24.8058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ4JzIwLjkiTiA2N8KwMDQnMjUuMyJF!5e0!3m2!1sen!2s!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                className="rounded-3xl"
                            />
                        </div>

                        {/* WhatsApp Support */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-lg dark:shadow-green-900/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <MessageCircle className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">WhatsApp Support</h3>
                                    <p className="text-white/80">Get instant help on WhatsApp</p>
                                </div>
                            </div>
                            <p className="mb-6 text-white/90">
                                Chat with our customer support team instantly. We're available 24/7 to help you with your queries.
                            </p>
                            <a
                                href="https://wa.me/923001234567"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat on WhatsApp
                            </a>
                        </div>

                        {/* FAQ Prompt */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border dark:border-gray-800 transition-colors duration-200">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-800 dark:text-white">What are your delivery times?</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Delivery takes 3-7 business days depending on your location.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 dark:text-white">Do you offer assembly services?</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, we offer free assembly for orders above Rs. 50,000.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 dark:text-white">What is your return policy?</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">We offer 7-day hassle-free returns for all products.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
