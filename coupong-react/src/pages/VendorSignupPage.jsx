import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignUp, useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../utils/api';

export default function VendorSignupPage() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const navigate = useNavigate();
    const [syncing, setSyncing] = useState(false);
    const [step, setStep] = useState('auth');        // 'auth' | 'details' | 'done'
    const [form, setForm] = useState({ businessName: '', phone: '', city: '', category: '' });
    const [error, setError] = useState('');

    const CATEGORIES = [
        'restaurants', 'wellness', 'entertainment', 'retail',
        'travel', 'fitness', 'beauty', 'services',
    ];

    // Once Clerk sign-up completes, move to business-details step
    useEffect(() => {
        if (isLoaded && isSignedIn && step === 'auth') {
            setStep('details');
        }
    }, [isLoaded, isSignedIn]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.businessName || !form.city || !form.category)
            return setError('Please fill in all required fields.');

        setSyncing(true);
        setError('');
        try {
            // Sync + register as vendor with business details
            await apiFetch('/api/auth/vendor-register', {
                method: 'POST',
                body: form,
            }, getToken);

            setStep('done');
            setTimeout(() => navigate('/vendor-dashboard', { replace: true }), 1500);
        } catch (err) {
            setError(err.message);
            setSyncing(false);
        }
    };

    // ── Step 2: Business Details Form ──────────────────────────────────────────
    if (step === 'details' || step === 'done') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-16">
                <div className="text-center mb-8">
                    <Link to="/" className="font-display font-bold text-2xl inline-flex items-center gap-2 text-white">
                        <span className="text-3xl">🏷️</span>
                        Cou-<span className="text-orange-400">pong</span>
                    </Link>
                    <h1 className="font-display font-bold text-2xl text-white mt-5 mb-1">
                        {step === 'done' ? '🎉 You\'re all set!' : 'Tell us about your business'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {step === 'done' ? 'Redirecting to your dashboard…' : 'Step 2 of 2 — Business info'}
                    </p>
                </div>

                {step === 'done' ? (
                    <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">
                                ⚠️ {error}
                            </div>
                        )}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                    Business Name <span className="text-orange-400">*</span>
                                </label>
                                <input
                                    type="text" required
                                    value={form.businessName}
                                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                                    placeholder="e.g. Bella Italia, Urban Spa"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                    City <span className="text-orange-400">*</span>
                                </label>
                                <input
                                    type="text" required
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    placeholder="Mumbai, Pune, Bangalore…"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                                    Business Category <span className="text-orange-400">*</span>
                                </label>
                                <select
                                    required
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all capitalize"
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c} className="capitalize">{c}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={syncing}
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-display font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-70 mt-2"
                            >
                                {syncing ? 'Saving…' : 'Complete Registration →'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        );
    }

    // ── Step 1: Clerk SignUp ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-16">
            <div className="text-center mb-8">
                <Link to="/" className="font-display font-bold text-2xl inline-flex items-center gap-2 text-white">
                    <span className="text-3xl">🏷️</span>
                    Cou-<span className="text-orange-400">pong</span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-normal">
                        Business
                    </span>
                </Link>
                <h1 className="font-display font-bold text-3xl text-white mt-5 mb-2">Register Your Business</h1>
                <p className="text-gray-400 text-sm">Step 1 of 2 — Create your account</p>
            </div>

            <SignUp
                routing="hash"
                signInUrl="/vendor-login"
                afterSignUpUrl="/vendor-signup"
                appearance={{
                    variables: {
                        colorPrimary: '#f97316',
                        colorBackground: 'rgba(255,255,255,0.05)',
                        colorText: '#f3f4f6',
                        colorTextSecondary: '#9ca3af',
                        colorInputBackground: 'rgba(255,255,255,0.08)',
                        colorInputText: '#f3f4f6',
                        borderRadius: '0.875rem',
                    },
                    elements: {
                        rootBox: 'w-full max-w-md',
                        card: 'bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl',
                        headerTitle: 'text-white font-display font-bold',
                        headerSubtitle: 'text-gray-400',
                        formFieldLabel: 'text-gray-300',
                        formButtonPrimary:
                            'bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-opacity font-bold',
                        footerActionLink: 'text-orange-400 hover:text-orange-300',
                        dividerLine: 'bg-white/10',
                        dividerText: 'text-gray-500',
                    },
                }}
            />

            <p className="text-gray-600 text-xs mt-6">
                Already registered?{' '}
                <Link to="/vendor-login" className="text-gray-400 hover:text-orange-400 underline">
                    Sign in →
                </Link>
            </p>
        </div>
    );
}
