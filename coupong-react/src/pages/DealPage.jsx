import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { DEALS, STORES } from '../data/data';
import { getAllCoupons } from '../utils/db';
import { useCart } from '../context/CartContext';

function getDaysLeft(expiryDate) {
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function DealPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { addToCart } = useCart();
    const isMember = user?.publicMetadata?.membershipTier === 'plus' || user?.publicMetadata?.membershipTier === 'premium';
    const [added, setAdded] = useState(false);

    // Find deal (static or dynamic)
    const staticDeal = DEALS.find(d => d.id === id);
    const dynamicDeal = getAllCoupons().find(c => c.id === id);
    const deal = staticDeal || (dynamicDeal ? {
        ...dynamicDeal, isDynamic: true,
        title: dynamicDeal.title, description: dynamicDeal.short_description || dynamicDeal.description || '',
        category: dynamicDeal.category, image: dynamicDeal.primary_image || 'https://images.unsplash.com/photo-1607082348824?w=800&q=80',
        discountPercentage: dynamicDeal.discount_type === 'percentage' ? dynamicDeal.discount_value : 0,
        discountedPrice: dynamicDeal.discount_type === 'fixed' ? dynamicDeal.discount_value : 'Special Offer',
        originalPrice: null, expiryDate: dynamicDeal.expires_on, soldCount: 0,
        vendorName: dynamicDeal.vendor_name, city: dynamicDeal.city, locality: dynamicDeal.locality
    } : null);

    if (!deal) {
        return (
            <div className="pt-32 text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="font-display font-bold text-2xl text-gray-700 mb-4">Deal not found</h2>
                <Link to="/" className="text-orange-500 hover:underline">← Back to Deals</Link>
            </div>
        );
    }

    const store = deal.isDynamic
        ? { name: deal.vendorName, locality: deal.locality, city: deal.city, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.vendorName || 'V')}&background=FF6B35&color=fff`, rating: deal.rating || 4.5 }
        : STORES.find(s => s.id === deal.storeId) || {};

    const isLocked = deal.membersOnly && !isMember;
    const daysLeft = getDaysLeft(deal.expiryDate);

    const handleAddToCart = () => {
        addToCart({ id: deal.id, title: deal.title, price: deal.discountedPrice, image: deal.image, storeName: store.name });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="pt-28 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="capitalize">{deal.category}</span>
                    <span>/</span>
                    <span className="text-gray-700 font-medium line-clamp-1">{deal.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left - Image */}
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
                            <img src={deal.image} alt={deal.title} className={`w-full h-full object-cover ${isLocked ? 'blur-md' : ''}`} />
                            {deal.membersOnly && (
                                <span className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                                    👑 {isMember ? 'Member Deal' : 'Members Only'}
                                </span>
                            )}
                            {!deal.membersOnly && (
                                <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                                    {deal.discountPercentage}% OFF
                                </span>
                            )}
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <div className="text-5xl mb-2">🔒</div>
                                        <p className="font-display font-bold text-xl">Members Only</p>
                                        <p className="text-white/80 text-sm mt-1">Upgrade to unlock this deal</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Store Info Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                            <img src={store.logo} alt={store.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name || 'S')}&background=FF6B35&color=fff`} />
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{store.name}</h3>
                                <p className="text-sm text-gray-400">{store.locality}, {store.city}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < Math.round(store.rating || 4) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                    ))}
                                    <span className="text-sm text-gray-500 ml-1">{store.rating || 4.5}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Details */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 capitalize">{deal.category}</span>
                            <h1 className="font-display font-extrabold text-3xl text-gray-900 leading-snug">{deal.title}</h1>
                            <p className="text-gray-500 mt-3 leading-relaxed">{deal.description}</p>
                        </div>

                        {/* Price Box */}
                        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100">
                            {deal.originalPrice && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-400 line-through text-lg">₹{deal.originalPrice.toLocaleString()}</span>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save ₹{(deal.originalPrice - deal.discountedPrice).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="text-4xl font-display font-extrabold text-orange-500 mb-3">
                                {typeof deal.discountedPrice === 'number' ? `₹${deal.discountedPrice.toLocaleString()}` : deal.discountedPrice}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">⏳ {daysLeft === 0 ? 'Expires today!' : `${daysLeft} days left`}</span>
                                {deal.soldCount > 0 && <span className="flex items-center gap-1">🔥 {deal.soldCount.toLocaleString()} people bought</span>}
                            </div>
                        </div>

                        {/* Options if any */}
                        {deal.options && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-800">Choose an Option</h3>
                                {deal.options.map(opt => (
                                    <label key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-orange-300 cursor-pointer transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">{opt.title}</p>
                                            <p className="text-xs text-gray-400">{opt.bought} bought</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 line-through">₹{opt.originalPrice}</p>
                                            <p className="font-bold text-orange-500">₹{opt.discountedPrice}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        {isLocked ? (
                            <Link to="/membership" className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-display font-bold text-lg py-4 rounded-2xl text-center hover:shadow-xl transition-all">
                                👑 Unlock with Membership
                            </Link>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full font-display font-bold text-lg py-4 rounded-2xl transition-all ${added ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-xl hover:shadow-orange-200'}`}
                                >
                                    {added ? '✅ Added to Cart!' : '🛒 Add to Cart'}
                                </button>
                                <Link to="/checkout" className="block w-full border-2 border-orange-500 text-orange-500 font-display font-bold text-lg py-4 rounded-2xl text-center hover:bg-orange-50 transition-all">
                                    Buy Now
                                </Link>
                            </div>
                        )}

                        {/* Fine Print */}
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 space-y-1">
                            <p>✅ Instant digital voucher after purchase</p>
                            <p>✅ Valid at all listed locations</p>
                            <p>✅ No booking required — just show the coupon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
