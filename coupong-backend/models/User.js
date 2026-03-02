import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    photo: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    membershipTier: { type: String, enum: ['free', 'plus', 'premium'], default: 'free' },
    // Vendor-specific
    businessName: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    category: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    // Customer wishlist
    savedDeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
}, {
    timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', userSchema);
