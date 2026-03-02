const CATEGORIES = ['restaurants', 'wellness', 'entertainment', 'retail', 'travel', 'fitness', 'beauty', 'services'];

export const EMPTY_FORM = {
    title: '', shortDescription: '', description: '',
    category: '', primaryImage: '',
    discountType: 'percentage', discountValue: '',
    originalPrice: '', discountedPrice: '',
    city: '', locality: '',
    membersOnly: false, expiresOn: '', tags: '',
};

export default function VendorCouponForm({ form, setForm, onSave, onClose, saving, error, editId }) {
    const field = (label, key, type = 'text', placeholder = '', required = false, extra = {}) => (
        <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
                {label}{required && <span className="text-orange-400 ml-1">*</span>}
            </label>
            <input
                type={type} required={required} placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'checkbox' ? e.target.checked : e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                {...extra}
            />
        </div>
    );

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-bold text-lg text-white">
                    {editId ? '✏️ Edit Coupon' : '➕ New Coupon'}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>

            {error && (
                <div className="mb-4 bg-red-900/50 border border-red-500/30 text-red-300 rounded-xl px-4 py-2 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">{field('Title', 'title', 'text', 'e.g. 50% off every Wednesday!', true)}</div>
                <div className="md:col-span-2">{field('Short Description', 'shortDescription', 'text', 'One-liner shown on the deal card')}</div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Category <span className="text-orange-400">*</span></label>
                    <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 capitalize">
                        <option value="">Select…</option>
                        {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                </div>

                {/* Discount Type */}
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Discount Type</label>
                    <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                </div>

                {field('Discount Value *', 'discountValue', 'number', 'e.g. 50', true, { min: 0 })}
                {field('Original Price (₹)', 'originalPrice', 'number', '1000', false, { min: 0 })}
                {field('Discounted Price (₹)', 'discountedPrice', 'number', '500', false, { min: 0 })}
                {field('City', 'city', 'text', 'Mumbai')}
                {field('Locality', 'locality', 'text', 'Bandra West')}
                {field('Expires On', 'expiresOn', 'date')}

                <div className="md:col-span-2">{field('Image URL', 'primaryImage', 'url', 'https://…')}</div>
                <div className="md:col-span-2">{field('Tags (comma-separated)', 'tags', 'text', 'pasta, dine-in, weekday')}</div>

                {/* Members Only */}
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="membersOnly" checked={form.membersOnly}
                        onChange={e => setForm(f => ({ ...f, membersOnly: e.target.checked }))}
                        className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="membersOnly" className="text-sm text-gray-300 cursor-pointer">👑 Members Only deal</label>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 text-sm">
                        {saving ? 'Saving…' : editId ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                    <button type="button" onClick={onClose}
                        className="px-5 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition-all text-sm">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
