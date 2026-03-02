import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

const router = Router();

// ── POST /api/orders ─────────────────────────────────────────────────────────
// Customer places an order for a coupon
router.post('/', protect, async (req, res) => {
    try {
        const { couponId } = req.body;
        const coupon = await Coupon.findById(couponId);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        if (!coupon.isActive) return res.status(400).json({ error: 'This deal is no longer available' });

        const order = await Order.create({
            userId: req.auth.userId,
            couponId: coupon._id,
            couponTitle: coupon.title,
            vendorId: coupon.vendorId,
            vendorName: coupon.vendorName,
            price: coupon.discountedPrice || coupon.discountValue,
            status: 'paid',  // In production, set 'pending' until payment gateway confirms
        });

        // Increment sold count
        coupon.soldCount += 1;
        await coupon.save();

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/orders/my ───────────────────────────────────────────────────────
// Customer views their orders
router.get('/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.auth.userId })
            .populate('couponId', 'title primaryImage category city locality discountedPrice discountValue discountType')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/orders/vendor ───────────────────────────────────────────────────
// Vendor sees orders on their coupons
router.get('/vendor', protect, async (req, res) => {
    try {
        const orders = await Order.find({ vendorId: req.auth.userId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /api/orders/:id/redeem ─────────────────────────────────────────────
// Vendor redeems (marks as used) an order
router.patch('/:id/redeem', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.vendorId !== req.auth.userId)
            return res.status(403).json({ error: 'Only the vendor can redeem this order' });

        order.status = 'redeemed';
        order.redeemedAt = new Date();
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
