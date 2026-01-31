"use client";

import { useState, useEffect } from 'react';
import { User as UserIcon, Package, Heart, MapPin, CreditCard, Settings, LogOut, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { getProfile, updateProfile, getAddresses, Profile, Address } from '@/src/api/account';
import { getMyOrders, Order } from '@/src/api/orders';
import { useRouter } from 'next/navigation';

export default function AccountClient() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    useEffect(() => {
        const loadAccountData = async () => {
            setLoading(true);
            try {
                const [profileData, ordersData, addressesData] = await Promise.all([
                    getProfile(),
                    getMyOrders(),
                    getAddresses()
                ]);
                setProfile(profileData);
                setOrders(ordersData);
                setAddresses(addressesData);

                // Initialize form data
                setFormData({
                    firstName: profileData.firstName || profileData.name.split(' ')[0] || '',
                    lastName: profileData.lastName || profileData.name.split(' ').slice(1).join(' ') || '',
                    phone: profileData.phone || ''
                });
            } catch (error) {
                console.error('Failed to load account data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadAccountData();
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const updated = await updateProfile(formData);
            setProfile(updated);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Account</h1>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border dark:border-gray-800 transition-colors duration-200">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-100 dark:shadow-rose-900/20">
                                    <span className="text-3xl font-bold text-white uppercase">
                                        {profile?.name?.charAt(0) || user?.name?.charAt(0)}
                                    </span>
                                </div>
                                <h2 className="font-bold text-gray-800 dark:text-white">{profile?.name || user?.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || user?.email}</p>
                            </div>
                            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none gap-2">
                                {[
                                    { id: 'profile', icon: UserIcon, label: 'Profile' },
                                    { id: 'orders', icon: Package, label: 'Orders' },
                                    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                                    { id: 'addresses', icon: MapPin, label: 'Addresses' },
                                    { id: 'payment', icon: CreditCard, label: 'Payment' },
                                    { id: 'settings', icon: Settings, label: 'Settings' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`whitespace-nowrap flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm sm:text-base ${activeTab === item.id
                                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 sm:p-8 min-h-[500px] border dark:border-gray-800 transition-colors duration-200">
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Personal Information</h2>
                                    {message.text && (
                                        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                            {message.text}
                                        </div>
                                    )}
                                    <form className="space-y-6" onSubmit={handleProfileUpdate}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Your first name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Your last name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-500 dark:text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="mt-1 text-xs text-gray-400 italic">Email cannot be changed.</p>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-rose-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="e.g. 03XX-XXXXXXX"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-gradient-to-r from-rose-500 to-orange-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-rose-100 dark:shadow-rose-900/20 hover:shadow-rose-200 dark:hover:shadow-rose-900/40 transition-all flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Orders</h2>
                                    {orders.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Orders Yet</h3>
                                            <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet. Start shopping!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800 pb-4 mb-4">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-white">Order #{order.orderNumber}</p>
                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {order.itemsCount} items</p>
                                                            {order.shippingAddress && (
                                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg w-fit">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span className="truncate max-w-[200px] italic">{order.shippingAddress}, {order.shippingCity}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-6">
                                                            <span className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">Rs. {order.total.toLocaleString()}</span>
                                                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                    order.status === 'On Hold' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                        order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                                                }`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Timeline */}
                                                    <div className="relative mt-8 mb-4">
                                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2"></div>
                                                        <div className="relative flex justify-between items-center px-2">
                                                            {[
                                                                { status: 'Pending', label: 'Placed' },
                                                                { status: 'Processing', label: 'Processing' },
                                                                { status: 'Shipped', label: 'Shipped' },
                                                                { status: 'Completed', label: 'Delivered' }
                                                            ].filter(s => {
                                                                if (order.status === 'Cancelled' && s.status === 'Completed') return false;
                                                                return true;
                                                            }).concat(order.status === 'Cancelled' ? [{ status: 'Cancelled', label: 'Cancelled' } as any] : [])
                                                                .map((step) => {
                                                                    const statuses = ['Pending', 'Processing', 'Shipped', 'Completed'];
                                                                    if (order.status === 'Cancelled') statuses.push('Cancelled');
                                                                    if (order.status === 'On Hold') statuses.splice(2, 0, 'On Hold');

                                                                    const currentIdx = statuses.indexOf(order.status);
                                                                    const stepIdx = statuses.indexOf(step.status);
                                                                    const isPast = stepIdx <= currentIdx;
                                                                    const isCurrent = step.status === order.status;

                                                                    return (
                                                                        <div key={step.status} className="flex flex-col items-center relative z-10 w-1/5">
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'bg-rose-500 text-white scale-125 shadow-lg shadow-rose-200' :
                                                                                isPast ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'
                                                                                }`}>
                                                                                <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-white' : isPast ? 'bg-rose-500' : 'bg-gray-300'}`}></div>
                                                                            </div>
                                                                            <span className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${isCurrent ? 'text-rose-600' : isPast ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'
                                                                                }`}>
                                                                                {step.label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Saved Addresses</h2>
                                        <button className="flex items-center gap-2 text-rose-500 font-semibold hover:text-rose-600">
                                            <Plus className="w-5 h-5" /> Add New
                                        </button>
                                    </div>

                                    {addresses.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Addresses Saved</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Add an address to speed up your checkout process.</p>
                                            <button className="mt-6 bg-white dark:bg-gray-800 border border-rose-500 text-rose-500 px-6 py-2 rounded-xl font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                Add My First Address
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {addresses.map((address) => (
                                                <div key={address.id} className={`border-2 rounded-xl p-6 relative ${address.isDefault ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-800'}`}>
                                                    {address.isDefault && (
                                                        <span className="absolute top-4 right-4 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs px-2 py-1 rounded-full font-bold">Default</span>
                                                    )}
                                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{address.label}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                        {address.line1}<br />
                                                        {address.line2 && <>{address.line2}<br /></>}
                                                        {address.city}, {address.region}<br />
                                                        {address.country} {address.postalCode}
                                                    </p>
                                                    <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-wider">
                                                        <button className="text-gray-400 hover:text-rose-500">Edit</button>
                                                        {!address.isDefault && <button className="text-gray-400 hover:text-blue-500">Make Default</button>}
                                                        <button className="text-gray-400 hover:text-red-500 ml-auto">Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(activeTab === 'wishlist' || activeTab === 'payment' || activeTab === 'settings') && (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {activeTab === 'wishlist' && <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600" />}
                                        {activeTab === 'payment' && <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-600" />}
                                        {activeTab === 'settings' && <Settings className="w-10 h-10 text-gray-300 dark:text-gray-600" />}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Coming Soon</h3>
                                    <p className="text-gray-500 dark:text-gray-400">The {activeTab} feature is currently being connected to our new system.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
