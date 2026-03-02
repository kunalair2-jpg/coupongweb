import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUser, useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/data';

export default function Navbar() {
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const { cartCount, cartOpen, setCartOpen } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleCategory = (catId) => {
        navigate('/');
        setSearchParams({ cat: catId });
        setMobileOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
            {/* Top Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                {/* Logo */}
                <Link to="/" className="font-display font-extrabold text-xl flex items-center gap-2 mr-4 flex-shrink-0">
                    <span className="text-2xl">🏷️</span>
                    <span>Cou-<span className="text-orange-500">pong</span></span>
                </Link>

                {/* Desktop Category Pills */}
                <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategory(cat.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-600 whitespace-nowrap transition-colors"
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Cart */}
                    <Link
                        to="/cart"
                        className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Signed-in: show Clerk UserButton + dashboard link */}
                    <SignedIn>
                        <Link to="/my-dashboard" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors">
                            My Deals
                        </Link>
                        {/* Clerk's built-in user avatar + dropdown */}
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: 'w-9 h-9',
                                    userButtonPopoverCard: 'shadow-xl rounded-2xl border border-gray-100',
                                    userButtonPopoverFooter: 'hidden',
                                },
                            }}
                        />
                    </SignedIn>

                    {/* Signed-out: Sign In button */}
                    <SignedOut>
                        <button
                            onClick={() => openSignIn()}
                            className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors"
                        >
                            Sign In
                        </button>
                        <Link
                            to="/sign-up"
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:shadow-md hover:shadow-orange-200 transition-all whitespace-nowrap"
                        >
                            Get Started
                        </Link>
                    </SignedOut>

                    {/* Vendor Portal Link */}
                    <Link
                        to="/vendor-login"
                        className="hidden md:flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-xl transition-all"
                    >
                        🏪 Vendors
                    </Link>

                    {/* Mobile menu toggle */}
                    <button
                        className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4 shadow-lg animate-slide-up">
                    <div className="flex flex-wrap gap-2 pt-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategory(cat.id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-4 border-t border-gray-100 pt-4">
                        <Link to="/my-dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-600 hover:text-orange-500 py-2">My Dashboard</Link>
                        <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-600 hover:text-orange-500 py-2">Cart ({cartCount})</Link>
                        <Link to="/vendor-login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-400 hover:text-orange-500 py-2">Vendor Portal 🏪</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
