import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignIn, useAuth, useUser } from '@clerk/clerk-react';
import { apiFetch } from '../utils/api';

export default function VendorLoginPage() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');

    // After Clerk sign-in succeeds, set vendor role on backend then go to dashboard
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const activateVendor = async () => {
            setSyncing(true);
            try {
                // 1. Sync user to MongoDB
                await apiFetch('/api/auth/sync', { method: 'POST' }, getToken);
                // 2. Set role to vendor
                await apiFetch('/api/auth/set-role', { method: 'POST', body: { role: 'vendor' } }, getToken);
                // 3. Go to vendor dashboard
                navigate('/vendor-dashboard', { replace: true });
            } catch (err) {
                setError('Account setup failed: ' + err.message);
                setSyncing(false);
            }
        };

        activateVendor();
    }, [isLoaded, isSignedIn]);

    // Already signed in and syncing
    if (syncing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-300 font-medium">Setting up your vendor account…</p>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-16">
            {/* Header */}
            <div className="text-center mb-8">
                <Link to="/" className="font-display font-bold text-2xl inline-flex items-center gap-2 text-white">
                    <span className="text-3xl">🏷️</span>
                    Cou-<span className="text-orange-400">pong</span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-normal">
                        Business
                    </span>
                </Link>
                <h1 className="font-display font-bold text-3xl text-white mt-5 mb-2">Vendor Portal</h1>
                <p className="text-gray-400 text-sm">Sign in to manage your deals and grow your business.</p>
            </div>

            {/* Clerk SignIn with dark/vendor styling */}
            <SignIn
                routing="hash"
                signUpUrl="/vendor-signup"
                afterSignInUrl="/vendor-dashboard"
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
                        identityPreviewText: 'text-gray-300',
                        dividerLine: 'bg-white/10',
                        dividerText: 'text-gray-500',
                    },
                }}
            />

            <p className="text-gray-600 text-xs mt-6">
                Not a vendor?{' '}
                <Link to="/" className="text-gray-400 hover:text-orange-400 underline">
                    Browse deals instead
                </Link>
            </p>
        </div>
    );
}
