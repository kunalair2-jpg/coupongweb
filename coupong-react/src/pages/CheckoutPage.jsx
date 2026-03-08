import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, useUser } from '@clerk/clerk-react';

const STEPS = ['Details', 'Payment', 'Confirm'];

function StepBar({ step }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((label, i) => (
                <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                            ${i < step ? 'bg-gradient-to-br from-orange-500 to-pink-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                                : i === step ? 'border-orange-500 text-orange-500 bg-white shadow-md'
                                    : 'border-gray-200 text-gray-300 bg-white'}`}>
                            {i < step ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1.5 font-semibold ${i <= step ? 'text-orange-500' : 'text-gray-300'}`}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`w-20 h-0.5 mx-1 mb-5 transition-all duration-500 ${i < step ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-100'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function InputField({ label, type = 'text', placeholder, value, onChange, required, icon }) {
    return (
        <div className="group">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
            <div className="relative">
                {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    className={`w-full border border-gray-200 rounded-xl py-3 ${icon ? 'pl-10 pr-4' : 'px-4'} text-gray-700 text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
                        bg-gray-50 hover:bg-white placeholder-gray-300`}
                />
            </div>
        </div>
    );
}

// Step 1 — Contact & Delivery Details
function StepDetails({ form, setForm, onNext }) {
    const { user } = useUser();

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h2 className="font-display font-bold text-xl text-gray-800 mb-1">Contact Information</h2>
                <p className="text-sm text-gray-400 mb-5">Your vouchers will be delivered to this email instantly.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="First Name" placeholder="Rahul" icon="👤"
                        value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} required />
                    <InputField label="Last Name" placeholder="Sharma" icon="👤"
                        value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} required />
                </div>
            </div>
            <InputField label="Email Address" type="email" placeholder={user?.primaryEmailAddress?.emailAddress || 'you@example.com'} icon="✉️"
                value={form.email || user?.primaryEmailAddress?.emailAddress || ''}
                onChange={v => setForm(f => ({ ...f, email: v }))} required />
            <InputField label="Phone Number" type="tel" placeholder="+91 98765 43210" icon="📱"
                value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} required />

            <div className="pt-2">
                <h2 className="font-display font-bold text-xl text-gray-800 mb-1">Delivery Preference</h2>
                <p className="text-sm text-gray-400 mb-4">How would you like to receive your vouchers?</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'email', icon: '✉️', label: 'Email', sub: 'Instant delivery' },
                        { id: 'whatsapp', icon: '💬', label: 'WhatsApp', sub: 'Via phone number' },
                    ].map(opt => (
                        <button type="button" key={opt.id}
                            onClick={() => setForm(f => ({ ...f, delivery: opt.id }))}
                            className={`p-4 rounded-2xl border-2 text-left transition-all
                                ${form.delivery === opt.id
                                    ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                            <div className="text-2xl mb-1">{opt.icon}</div>
                            <p className={`font-semibold text-sm ${form.delivery === opt.id ? 'text-orange-600' : 'text-gray-700'}`}>{opt.label}</p>
                            <p className="text-xs text-gray-400">{opt.sub}</p>
                        </button>
                    ))}
                </div>
            </div>

            <button type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-display font-bold py-4 rounded-2xl
                    hover:shadow-xl hover:shadow-orange-200 transition-all text-base mt-2">
                Continue to Payment →
            </button>
        </form>
    );
}

// Step 2 — Payment
function StepPayment({ form, setForm, onNext, onBack, total }) {
    const [cardNum, setCardNum] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = v => {
        const d = v.replace(/\D/g, '').slice(0, 4);
        return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setForm(f => ({ ...f, paymentMethod: form.payMethod }));
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h2 className="font-display font-bold text-xl text-gray-800 mb-1">Payment Method</h2>
                <p className="text-sm text-gray-400 mb-5">All transactions are encrypted and secure.</p>

                {/* Payment method tabs */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {[
                        { id: 'card', icon: '💳', label: 'Card' },
                        { id: 'upi', icon: '📲', label: 'UPI' },
                        { id: 'netbanking', icon: '🏦', label: 'Net Banking' },
                        { id: 'wallet', icon: '👛', label: 'Wallet' },
                    ].map(pm => (
                        <button type="button" key={pm.id}
                            onClick={() => setForm(f => ({ ...f, payMethod: pm.id }))}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                                ${form.payMethod === pm.id
                                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                            {pm.icon} {pm.label}
                        </button>
                    ))}
                </div>

                {/* Card form */}
                {form.payMethod === 'card' && (
                    <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <InputField label="Cardholder Name" placeholder="Rahul Sharma" icon="👤"
                            value={name} onChange={setName} required />
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Card Number</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">💳</span>
                                <input type="text" placeholder="1234 5678 9012 3456"
                                    value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
                                    className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-700 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
                                        bg-white placeholder-gray-300 font-mono tracking-widest" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Expiry</label>
                                <input type="text" placeholder="MM/YY"
                                    value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
                                        bg-white placeholder-gray-300 font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">CVV</label>
                                <input type="password" placeholder="•••"
                                    maxLength={4} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all
                                        bg-white placeholder-gray-300 font-mono tracking-widest" />
                            </div>
                        </div>
                        {/* Card type icons */}
                        <div className="flex gap-2 items-center pt-1">
                            <span className="text-xs text-gray-400">Accepted:</span>
                            {['VISA', 'MC', 'AMEX', 'RuPay'].map(c => (
                                <span key={c} className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded font-mono font-bold">{c}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* UPI */}
                {form.payMethod === 'upi' && (
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                        <InputField label="UPI ID" placeholder="yourname@upi" icon="📲"
                            value={form.upiId || ''} onChange={v => setForm(f => ({ ...f, upiId: v }))} required />
                        <div className="flex gap-3 flex-wrap">
                            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                <button type="button" key={app}
                                    onClick={() => setForm(f => ({ ...f, upiApp: app }))}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all
                                        ${form.upiApp === app ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                    {app}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Net banking / Wallet placeholder */}
                {(form.payMethod === 'netbanking' || form.payMethod === 'wallet') && (
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                        <div className="text-4xl mb-3">{form.payMethod === 'netbanking' ? '🏦' : '👛'}</div>
                        <p className="text-gray-500 text-sm">
                            You'll be redirected to your {form.payMethod === 'netbanking' ? 'bank\'s portal' : 'wallet'} to complete payment.
                        </p>
                    </div>
                )}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="text-green-500 text-lg">🔒</span>
                <p className="text-xs text-green-700 font-medium">256-bit SSL encrypted. Your payment info is never stored.</p>
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={onBack}
                    className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-all text-sm">
                    ← Back
                </button>
                <button type="submit"
                    className="flex-[2] bg-gradient-to-r from-orange-500 to-pink-500 text-white font-display font-bold py-3.5 rounded-2xl
                        hover:shadow-xl hover:shadow-orange-200 transition-all text-sm">
                    Review Order →
                </button>
            </div>
        </form>
    );
}

// Step 3 — Confirm & Place Order
function StepConfirm({ form, cart, total, onBack, onPlace, placing }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display font-bold text-xl text-gray-800 mb-1">Review Your Order</h2>
                <p className="text-sm text-gray-400 mb-5">Please confirm the details before placing your order.</p>
            </div>

            {/* Items */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items ({cart.length})</p>
                {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                        <img src={item.image || 'https://images.unsplash.com/photo-1607082348824?w=80&q=80'}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1607082348824?w=80&q=80'} />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.storeName} · Qty {item.qty}</p>
                        </div>
                        <p className="font-bold text-orange-500 text-sm flex-shrink-0">
                            {typeof item.price === 'number' ? `₹${(item.price * item.qty).toLocaleString()}` : item.price}
                        </p>
                    </div>
                ))}
            </div>

            {/* Details summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                    <p className="text-sm font-semibold text-gray-700">{form.firstName} {form.lastName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{form.email}</p>
                    <p className="text-xs text-gray-400">{form.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery</p>
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                        {form.delivery === 'email' ? '✉️ Email' : '💬 WhatsApp'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Instant digital voucher</p>
                    <p className="text-xs font-bold uppercase text-gray-500 mt-1">{form.payMethod}</p>
                </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-5 border border-orange-100">
                <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-gray-700">Total Amount</span>
                    <span className="font-display font-extrabold text-2xl text-orange-500">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack}
                    className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-all text-sm">
                    ← Back
                </button>
                <button onClick={onPlace} disabled={placing}
                    className="flex-[2] bg-gradient-to-r from-orange-500 to-pink-500 text-white font-display font-bold py-3.5 rounded-2xl
                        hover:shadow-xl hover:shadow-orange-200 transition-all text-sm disabled:opacity-70 relative overflow-hidden">
                    {placing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing…
                        </span>
                    ) : '🎉 Place Order'}
                </button>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────
// ✅ Success screen
// ──────────────────────────────────────────────────────────────
function SuccessScreen({ orderRef, form, cart, total }) {
    const navigate = useNavigate();
    return (
        <div className="text-center py-8 px-4 animate-fade-in">
            {/* Confetti-style animated icon */}
            <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-200 mx-auto animate-bounce-soft">
                    <span className="text-4xl">🎉</span>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow">
                    <span className="text-white text-xs font-bold">✓</span>
                </div>
            </div>

            <h2 className="font-display font-extrabold text-3xl text-gray-900 mb-2">Order Placed! 🎊</h2>
            <p className="text-gray-400 text-sm mb-1">Your vouchers are on their way.</p>
            <p className="text-orange-500 font-semibold text-sm mb-8">
                Check your {form.delivery === 'email' ? 'email inbox' : 'WhatsApp'} for instant delivery.
            </p>

            {/* Order ref box */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 text-left max-w-sm mx-auto">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono font-bold text-gray-700">{orderRef}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Items</span>
                    <span className="font-semibold text-gray-700">{cart.length} coupon{cart.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                    <span className="font-bold text-gray-700">Total Paid</span>
                    <span className="font-extrabold text-orange-500">₹{total.toLocaleString()}</span>
                </div>
            </div>

            {/* Items received */}
            <div className="space-y-2 mb-8 max-w-sm mx-auto">
                {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                        <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">✓</span>
                        </span>
                        <p className="text-sm text-green-800 font-medium text-left truncate">{item.title}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <button onClick={() => navigate('/my-dashboard')}
                    className="flex-1 border-2 border-orange-200 text-orange-500 font-bold py-3 rounded-2xl hover:bg-orange-50 transition-all text-sm">
                    My Orders
                </button>
                <button onClick={() => navigate('/')}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all text-sm">
                    Browse More Deals
                </button>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────
// 🏠 Main CheckoutPage
// ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [placing, setPlacing] = useState(false);
    const [orderRef, setOrderRef] = useState('');
    const [done, setDone] = useState(false);

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: '',
        delivery: 'email',
        payMethod: 'card',
        upiId: '',
        upiApp: '',
    });

    const total = cart.reduce((acc, item) => acc + (typeof item.price === 'number' ? item.price * item.qty : 0), 0);

    // Redirect if cart is empty and not on success screen
    if (cart.length === 0 && !done) {
        return (
            <div className="pt-28 pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-7xl mb-4">🛒</div>
                    <h2 className="font-display font-bold text-2xl text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-400 mb-8">Add some deals before checking out.</p>
                    <Link to="/" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all">
                        Browse Deals
                    </Link>
                </div>
            </div>
        );
    }

    if (!isSignedIn && !done) {
        return (
            <div className="pt-28 pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="font-display font-bold text-2xl text-gray-700 mb-2">Sign in to checkout</h2>
                    <p className="text-gray-400 mb-8">Create a free account to complete your purchase.</p>
                    <Link to="/sign-in" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all">
                        Sign In / Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    const placeOrder = async () => {
        setPlacing(true);
        // Simulate order processing
        await new Promise(r => setTimeout(r, 2000));
        const ref = 'CPN-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        setOrderRef(ref);
        setDone(true);
        clearCart();
        setPlacing(false);
    };

    return (
        <div className="pt-28 pb-20 min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back link */}
                {!done && (
                    <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-6 font-medium">
                        ← Back to Cart
                    </Link>
                )}

                {/* Page title */}
                <div className="mb-8 text-center">
                    <h1 className="font-display font-extrabold text-4xl text-gray-900">
                        {done ? 'Order Confirmed! 🎉' : 'Checkout'}
                    </h1>
                    {!done && <p className="text-gray-400 mt-1 text-sm">Secure, fast, and instant voucher delivery.</p>}
                </div>

                {done ? (
                    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                        <SuccessScreen orderRef={orderRef} form={form} cart={cart.length > 0 ? cart : [{ id: 'done', title: 'Your vouchers', price: total, qty: 1 }]} total={total} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* ── Left — Form ── */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
                                <StepBar step={step} />
                                {step === 0 && <StepDetails form={form} setForm={setForm} onNext={() => setStep(1)} />}
                                {step === 1 && <StepPayment form={form} setForm={setForm} total={total} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
                                {step === 2 && <StepConfirm form={form} cart={cart} total={total} onBack={() => setStep(1)} onPlace={placeOrder} placing={placing} />}
                            </div>
                        </div>

                        {/* ── Right — Order summary ── */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-28">
                                <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-3 mb-5">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <img src={item.image || 'https://images.unsplash.com/photo-1607082348824?w=80&q=80'}
                                                alt={item.title}
                                                className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                                                onError={e => e.target.src = 'https://images.unsplash.com/photo-1607082348824?w=80&q=80'} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-700 truncate leading-tight">{item.title}</p>
                                                <p className="text-xs text-gray-400">{item.storeName}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-800">
                                                    {typeof item.price === 'number' ? `₹${(item.price * item.qty).toLocaleString()}` : item.price}
                                                </p>
                                                <p className="text-xs text-gray-400">× {item.qty}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>🎁 Coupon Savings</span>
                                        <span>Applied ✓</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Delivery</span>
                                        <span className="text-green-600 font-medium">FREE</span>
                                    </div>
                                    <div className="flex justify-between font-display font-extrabold text-xl text-gray-900 border-t border-gray-100 pt-3 mt-1">
                                        <span>Total</span>
                                        <span className="text-orange-500">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                                    {[
                                        { icon: '🔒', text: 'Secure 256-bit SSL checkout' },
                                        { icon: '⚡', text: 'Instant digital voucher delivery' },
                                        { icon: '↩️', text: 'Easy refund within 24 hours' },
                                        { icon: '💬', text: '24/7 customer support' },
                                    ].map(b => (
                                        <div key={b.text} className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{b.icon}</span>
                                            <span>{b.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
