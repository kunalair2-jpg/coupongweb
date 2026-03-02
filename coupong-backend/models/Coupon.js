import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    vendorId: { type: String, required: true, index: true },   // Clerk userId of vendor
    vendorName: { type: String, default: '' },
    vendorEmail: { type: String, default: '' },

    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    primaryImage: { type: String, default: '' },

    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null },
    discountedPrice: { type: Number, default: null },

    city: { type: String, default: '', index: true },
    locality: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },

    membersOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    expiresOn: { type: Date, default: null },

    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 0 },

    tags: [{ type: String }],
}, {
    timestamps: true,
});

// Text search index
couponSchema.index({ title: 'text', shortDescription: 'text', vendorName: 'text', tags: 'text' });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
