// ── Detail Modal ─────────────────────────────────────────────────────────────
export function DetailModal({ coupon, onClose, onEdit, onDelete }) {
    if (!coupon) return null;
    const days = coupon.expiresOn ? Math.ceil((new Date(coupon.expiresOn) - new Date()) / 86400000) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>
                {/* Image */}
                {coupon.primaryImage && (
                    <div className="relative h-48 overflow-hidden rounded-t-3xl">
                        <img src={coupon.primaryImage} alt={coupon.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    </div>
                )}
                <div className="p-7">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                    {coupon.isActive ? '● Active' : '● Paused'}
                                </span>
                                {coupon.membersOnly && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">👑 Members Only</span>}
                                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full capitalize">{coupon.category}</span>
                            </div>
                            <h2 className="font-display font-extrabold text-2xl text-white">{coupon.title}</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none flex-shrink-0 ml-4">✕</button>
                    </div>

                    {coupon.shortDescription && <p className="text-gray-400 mb-4">{coupon.shortDescription}</p>}

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { icon: '💰', label: 'Discount', value: coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}` },
                            { icon: '👁️', label: 'Views', value: coupon.viewCount || 0 },
                            { icon: '🛒', label: 'Sold', value: coupon.soldCount || 0 },
                        ].map(m => (
                            <div key={m.label} className="bg-gray-800 rounded-xl p-3 text-center">
                                <div className="text-xl mb-1">{m.icon}</div>
                                <div className="font-bold text-white text-lg">{m.value}</div>
                                <div className="text-xs text-gray-500">{m.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Details grid */}
                    <div className="space-y-3 mb-5">
                        {coupon.city && (
                            <div className="flex gap-3">
                                <span className="text-gray-500 text-sm w-24 flex-shrink-0">📍 Location</span>
                                <span className="text-gray-300 text-sm">{coupon.city}{coupon.locality ? `, ${coupon.locality}` : ''}</span>
                            </div>
                        )}
                        {coupon.originalPrice && (
                            <div className="flex gap-3">
                                <span className="text-gray-500 text-sm w-24 flex-shrink-0">💵 Original</span>
                                <span className="text-gray-300 text-sm">₹{coupon.originalPrice} → ₹{coupon.discountedPrice || '—'}</span>
                            </div>
                        )}
                        {coupon.expiresOn && (
                            <div className="flex gap-3">
                                <span className="text-gray-500 text-sm w-24 flex-shrink-0">⏳ Expires</span>
                                <span className={`text-sm font-medium ${days !== null && days < 3 ? 'text-red-400' : days !== null && days < 7 ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    {new Date(coupon.expiresOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {days !== null && days >= 0 ? ` (${days} days left)` : ' (Expired)'}
                                </span>
                            </div>
                        )}
                        {coupon.vendorName && (
                            <div className="flex gap-3">
                                <span className="text-gray-500 text-sm w-24 flex-shrink-0">🏪 Vendor</span>
                                <span className="text-gray-300 text-sm">{coupon.vendorName}</span>
                            </div>
                        )}
                    </div>

                    {/* Conversion bar */}
                    {coupon.viewCount > 0 && (
                        <div className="mb-5">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Conversion Rate</span>
                                <span>{(((coupon.soldCount || 0) / coupon.viewCount) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                                    style={{ width: `${Math.min(100, ((coupon.soldCount || 0) / coupon.viewCount) * 100)}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button onClick={() => onEdit(coupon)} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all text-sm">
                            ✏️ Edit Coupon
                        </button>
                        <button onClick={() => { onDelete(coupon); onClose(); }}
                            className="px-5 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-900/20 transition-all text-sm">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
export function DeleteModal({ coupon, onConfirm, onClose }) {
    if (!coupon) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-red-500/30 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center"
                onClick={e => e.stopPropagation()}>
                <div className="text-5xl mb-4">🗑️</div>
                <h2 className="font-display font-bold text-2xl text-white mb-2">Delete Coupon?</h2>
                <p className="text-gray-400 mb-1">You are about to permanently delete:</p>
                <p className="text-orange-400 font-semibold mb-1">"{coupon.title}"</p>
                <div className="flex gap-3 text-xs text-gray-500 justify-center mb-6">
                    <span>👁️ {coupon.viewCount || 0} views</span>
                    <span>🛒 {coupon.soldCount || 0} sold</span>
                </div>
                <p className="text-red-400 text-sm mb-6 bg-red-900/20 rounded-xl px-4 py-3">
                    ⚠️ This action cannot be undone. All performance data will be lost.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-xl hover:bg-gray-800 transition-all text-sm">
                        Cancel
                    </button>
                    <button onClick={() => { onConfirm(coupon._id); onClose(); }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all text-sm">
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
