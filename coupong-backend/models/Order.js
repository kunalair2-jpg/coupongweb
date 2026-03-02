import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },  // Clerk userId
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    couponTitle: { type: String },
    vendorId: { type: String },
    vendorName: { type: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'redeemed', 'refunded'], default: 'pending' },
    voucherCode: { type: String, default: () => Math.random().toString(36).substr(2, 8).toUpperCase() },
    redeemedAt: { type: Date, default: null },
}, {
    timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
