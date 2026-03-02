import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';

export default function CustomerDashboard() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const { cart } = useCart();
    const navigate = useNavigate();

    if (!isLoaded) {
        return (
            <div className="pt-32 flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="pt-32 text-center py-20">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="font-display font-bold text-2xl text-gray-700 mb-4">Please sign in to view your dashboard</h2>
                <Link to="/sign-in" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold">Sign In</Link>
            </div>
        );
    }

    const membershipTier = user.publicMetadata?.membershipTier || 'free';
    const tierColor = { free: 'bg-gray-100 text-gray-600', plus: 'bg-yellow-100 text-yellow-700', premium: 'bg-orange-100 text-orange-700' };
    const tierLabel = { free: '🆓 Free Plan', plus: '👑 Plus Member', premium: '💎 Premium Member' };
    const displayName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'User';

    return (
        <div className="pt-28 pb-20 min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Clerk avatar */}
                        {user.imageUrl ? (
                            <img src={user.imageUrl} alt={displayName} className="w-16 h-16 rounded-full border-4 border-white/30 object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-display font-bold">
                                {displayName[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="font-display font-extrabold text-2xl">Welcome back, {user.firstName || displayName.split(' ')[0]}! 👋</h1>
                            <p className="text-white/80 mt-1 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${tierColor[membershipTier]}`}>
                                {tierLabel[membershipTier] || '🆓 Free Plan'}
                            </span>
                        </div>
                        <button
                            onClick={() => signOut().then(() => navigate('/'))}
                            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Cart Items', value: cart.length, icon: '🛒', color: 'text-orange-500' },
                        { label: 'Membership', value: membershipTier.toUpperCase(), icon: '👑', color: 'text-yellow-500' },
                        { label: 'Deals Saved', value: '0', icon: '💾', color: 'text-blue-500' },
                        { label: 'Total Savings', value: '₹0', icon: '💰', color: 'text-green-500' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className={`font-display font-extrabold text-2xl ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Upgrade Banner */}
                {membershipTier === 'free' && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-display font-bold text-xl mb-1">👑 Upgrade to Plus</h3>
                            <p className="text-white/80 text-sm">Unlock exclusive member-only deals — save up to 70% more!</p>
                        </div>
                        <Link to="/membership" className="bg-white text-orange-500 font-display font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
                            Upgrade Now →
                        </Link>
                    </div>
                )}

                {/* Cart Quick View */}
                {cart.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-display font-bold text-lg text-gray-900">🛒 Cart ({cart.length} items)</h2>
                            <Link to="/cart" className="text-orange-500 text-sm font-medium hover:underline">View Cart →</Link>
                        </div>
                        <div className="space-y-3">
                            {cart.slice(0, 3).map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.storeName}</p>
                                    </div>
                                    <span className="text-sm font-bold text-orange-500">
                                        {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                                    </span>
                                </div>
                            ))}
                            {cart.length > 3 && <p className="text-xs text-gray-400 text-center pt-2">+{cart.length - 3} more items</p>}
                        </div>
                    </div>
                )}

                {/* Browse CTA */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Ready to Save?</h3>
                    <p className="text-gray-400 mb-6">Discover thousands of deals in your city.</p>
                    <Link to="/" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all">
                        Browse Deals
                    </Link>
                </div>
            </div>
        </div>
    );
}
