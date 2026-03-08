import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const subtotal = cart.reduce((acc, item) => acc + (typeof item.price === 'number' ? item.price * item.qty : 0), 0);

    return (
        <div className="pt-28 pb-20 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-display font-extrabold text-3xl text-gray-900">🛒 My Cart</h1>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 font-medium transition-colors">
                            Clear all
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 text-center py-24 shadow-sm">
                        <div className="text-7xl mb-4">🛒</div>
                        <h2 className="font-display font-bold text-2xl text-gray-700 mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-8">Discover amazing deals and add them here.</p>
                        <Link to="/" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all">
                            Browse Deals
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                                    <img
                                        src={item.image || 'https://images.unsplash.com/photo-1607082348824?w=200&q=80'}
                                        alt={item.title}
                                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1607082348824?w=200&q=80'}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 leading-snug line-clamp-2">{item.title}</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">{item.storeName}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="font-bold text-orange-500 text-lg">
                                                {typeof item.price === 'number' ? `₹${item.price.toLocaleString()}` : item.price}
                                            </span>
                                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">× {item.qty}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                                        aria-label="Remove item"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-28">
                                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Order Summary</h2>
                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal ({cart.reduce((a, i) => a + i.qty, 0)} items)</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Savings</span>
                                        <span>-₹0</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-display font-bold text-xl text-gray-900">
                                        <span>Total</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-display font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all"
                                >
                                    Proceed to Checkout →
                                </button>

                                <Link to="/" className="block text-center text-sm text-orange-500 hover:underline mt-4 font-medium">
                                    ← Continue Shopping
                                </Link>

                                {/* Trust badges */}
                                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-400">
                                    <p className="flex items-center gap-2">🔒 Secure checkout</p>
                                    <p className="flex items-center gap-2">✅ Instant digital vouchers</p>
                                    <p className="flex items-center gap-2">💬 24/7 support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
