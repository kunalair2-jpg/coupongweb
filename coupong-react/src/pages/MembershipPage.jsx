import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

const TIERS = [
    {
        id: 'free', name: 'Free', price: '₹0', period: 'forever',
        badge: 'bg-gray-100 text-gray-600',
        border: 'border-gray-200',
        button: 'border-2 border-gray-200 text-gray-700 hover:border-orange-300',
        features: ['Browse all public deals', 'City & locality search', 'Cart & wishlist', 'Basic email support'],
    },
    {
        id: 'plus', name: 'Plus', price: '₹299', period: '/month',
        badge: 'bg-orange-100 text-orange-600',
        border: 'border-orange-400 shadow-2xl shadow-orange-100',
        button: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-200',
        popular: true,
        features: ['Everything in Free', '👑 All members-only deals', 'Up to 70% additional savings', 'Priority customer support', 'Early flash sale access'],
    },
    {
        id: 'premium', name: 'Premium', price: '₹599', period: '/month',
        badge: 'bg-pink-100 text-pink-600',
        border: 'border-pink-400 shadow-2xl shadow-pink-100',
        button: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-200',
        features: ['Everything in Plus', '💎 Exclusive 5-star deals', 'Concierge deal finder', 'Dedicated account manager', 'VIP event invites'],
    },
];

export default function MembershipPage() {
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const currentTier = user?.publicMetadata?.membershipTier || 'free';

    const handleUpgrade = (tierId) => {
        if (!user) { openSignIn(); return; }
        // In production, this would redirect to a payment page (Razorpay / Stripe)
        alert(`Upgrade to ${tierId} — payment integration coming soon!`);
    };

    return (
        <div className="pt-28 pb-20 bg-gradient-to-b from-orange-50 via-white to-white min-h-screen">
            {/* Header */}
            <div className="max-w-3xl mx-auto px-4 text-center mb-14">
                <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
                    👑 Membership Plans
                </span>
                <h1 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
                    Save More,<br />
                    <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Unlock More</span>
                </h1>
                <p className="text-gray-500 text-lg">
                    Choose the plan that works for you. Upgrade anytime, cancel anytime.
                </p>
            </div>

            {/* Cards */}
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {TIERS.map(tier => {
                    const isActive = currentTier === tier.id;
                    return (
                        <div key={tier.id} className={`bg-white rounded-3xl border-2 ${tier.border} p-8 relative transition-all duration-300 hover:-translate-y-1`}>
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-orange-200">
                                    ⭐ Most Popular
                                </div>
                            )}

                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-5 ${tier.badge}`}>
                                {tier.name}
                            </span>

                            <div className="mb-6">
                                <span className="font-display font-extrabold text-4xl text-gray-900">{tier.price}</span>
                                <span className="text-gray-400 text-sm">{tier.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {tier.features.map(f => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                                        <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {isActive ? (
                                <div className="w-full bg-green-50 border-2 border-green-200 text-green-700 font-display font-bold py-3 rounded-xl text-center text-sm">
                                    ✅ Your Current Plan
                                </div>
                            ) : tier.id === 'free' ? (
                                <Link to="/" className={`block w-full font-display font-bold py-3.5 rounded-xl text-center text-sm transition-all ${tier.button}`}>
                                    Browse Free Deals
                                </Link>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(tier.id)}
                                    className={`w-full font-display font-bold py-3.5 rounded-xl text-sm transition-all ${tier.button}`}
                                >
                                    Get {tier.name} →
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <div className="max-w-2xl mx-auto px-4 mt-20">
                <h2 className="font-display font-bold text-2xl text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your membership at any time with no extra charges.' },
                        { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, and net banking via Razorpay.' },
                        { q: 'Do member-only deals expire?', a: 'Member-only deals are valid as long as your membership is active.' },
                        { q: 'Can I upgrade from Plus to Premium?', a: "Absolutely! You'll only pay the difference for the remaining billing period." },
                    ].map(({ q, a }) => (
                        <div key={q} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="font-semibold text-gray-800 mb-1.5">{q}</p>
                            <p className="text-gray-500 text-sm">{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
