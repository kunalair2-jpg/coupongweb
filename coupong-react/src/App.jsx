import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth, useUser, SignIn, SignUp } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DealPage from './pages/DealPage';
import CartPage from './pages/CartPage';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorSignupPage from './pages/VendorSignupPage';
import MembershipPage from './pages/MembershipPage';
import { CartProvider } from './context/CartContext';

// Pages that hide main Navbar/Footer
const FULL_PAGE_ROUTES = ['/sign-in', '/sign-up', '/vendor-login', '/vendor-signup'];
const VENDOR_DASH_ROUTE = '/vendor-dashboard';

/** Redirect already-signed-in users away from auth pages */
function RedirectIfSignedIn({ children }) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <Navigate to="/" replace />;
  return children;
}

/** Require sign-in to access a page */
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isFullPage = FULL_PAGE_ROUTES.some(r => location.pathname.startsWith(r));
  const isVendorDash = location.pathname === VENDOR_DASH_ROUTE;
  const hideChrome = isFullPage || isVendorDash;

  return (
    <CartProvider>
      {!hideChrome && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/deal/:id" element={<DealPage />} />
        <Route path="/membership" element={<MembershipPage />} />

        {/* Clerk Auth Pages — centered modal style */}
        <Route path="/sign-in/*" element={
          <RedirectIfSignedIn>
            <ClerkAuthPage type="sign-in" />
          </RedirectIfSignedIn>
        } />
        <Route path="/sign-up/*" element={
          <RedirectIfSignedIn>
            <ClerkAuthPage type="sign-up" />
          </RedirectIfSignedIn>
        } />

        {/* Protected Customer */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/my-dashboard" element={
          <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
        } />

        {/* Vendor */}
        <Route path="/vendor-login" element={<VendorLoginPage />} />
        <Route path="/vendor-signup" element={<VendorSignupPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideChrome && <Footer />}
    </CartProvider>
  );
}

/** Centered Clerk auth page */
function ClerkAuthPage({ type }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <a href="/" className="font-display font-bold text-2xl inline-flex items-center gap-2">
          <span className="text-3xl">🏷️</span>
          Cou-<span className="text-orange-500">pong</span>
        </a>
        <p className="text-gray-500 mt-2 text-sm">
          {type === 'sign-in' ? 'Welcome back! Sign in to access your deals.' : 'Join 50,000+ deal hunters today.'}
        </p>
      </div>

      {type === 'sign-in' ? (
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md',
              card: 'shadow-xl rounded-3xl border border-gray-100',
              headerTitle: 'font-display font-bold',
              formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-opacity',
              footerActionLink: 'text-orange-500 hover:text-orange-600',
            },
          }}
        />
      ) : (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md',
              card: 'shadow-xl rounded-3xl border border-gray-100',
              headerTitle: 'font-display font-bold',
              formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-opacity',
              footerActionLink: 'text-orange-500 hover:text-orange-600',
            },
          }}
        />
      )}
    </div>
  );
}

function MembershipPageWrapper() {
  return <MembershipPage />;
}

function NotFoundPage() {
  return (
    <div className="pt-32 text-center py-20 min-h-screen">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="font-display font-extrabold text-4xl text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all inline-block">
        ← Go Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
