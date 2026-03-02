import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { STORES } from '../data/data';

function getDaysLeft(expiryDate) {
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function DealCard({ deal, index = 0 }) {
    const { user } = useUser();
    const isMember = user?.publicMetadata?.membershipTier === 'plus' || user?.publicMetadata?.membershipTier === 'premium';
    const store = deal.isDynamic
        ? { name: deal.vendorName, locality: deal.locality, city: deal.city, logo: deal.storeLogo }
        : STORES.find(s => s.id === deal.storeId) || {};

    const daysLeft = getDaysLeft(deal.expiryDate);
    const isLocked = deal.membersOnly && !isMember;

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in flex flex-col"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Image */}
            <div className="relative overflow-hidden h-48">
                <img
                    src={deal.image}
                    alt={deal.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isLocked ? 'blur-sm' : ''}`}
                    loading="lazy"
                />

                {/* Badge */}
                {deal.membersOnly ? (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        👑 {isMember ? 'Member Deal' : 'Members Only'}
                    </span>
                ) : (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {deal.discountPercentage}% OFF
                    </span>
                )}

                {deal.extraDiscount && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Extra %
                    </span>
                )}

                {/* Days Left */}
                {daysLeft <= 3 && (
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                        ⏳ {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                    </span>
                )}

                {/* Locked Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-3xl mb-1">🔒</div>
                            <p className="font-semibold text-sm">Members Only</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Store Info */}
                <div className="flex items-center gap-2 mb-3">
                    <img
                        src={store.logo}
                        alt={store.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name || 'S')}&background=FF6B35&color=fff`; }}
                    />
                    <div>
                        <p className="font-semibold text-gray-800 text-sm leading-tight">{store.name}</p>
                        <p className="text-xs text-gray-400">{store.locality}, {store.city}</p>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 flex-1">
                    {deal.title}
                </h3>

                {/* Sold count */}
                {deal.soldCount > 0 && (
                    <p className="text-xs text-gray-400 mb-3">🔥 {deal.soldCount.toLocaleString()} bought</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                    <div>
                        {deal.originalPrice && (
                            <span className="text-xs text-gray-400 line-through block">₹{deal.originalPrice.toLocaleString()}</span>
                        )}
                        <span className="text-lg font-bold text-orange-500">
                            {typeof deal.discountedPrice === 'number' ? `₹${deal.discountedPrice.toLocaleString()}` : deal.discountedPrice}
                        </span>
                    </div>

                    {isLocked ? (
                        <Link
                            to="/membership"
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:shadow-md transition-all"
                        >
                            Unlock 👑
                        </Link>
                    ) : (
                        <Link
                            to={`/deal/${deal.id}`}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg hover:shadow-orange-200 transition-all"
                        >
                            View Deal
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
