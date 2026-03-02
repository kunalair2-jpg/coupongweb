import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';

const router = Router();

// ── GET /api/vendors/profile ────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).lean();
        if (!user) return res.status(404).json({ error: 'Vendor not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /api/vendors/profile ──────────────────────────────────────────────
router.patch('/profile', protect, async (req, res) => {
    try {
        const allowed = ['businessName', 'phone', 'city', 'category', 'name'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const user = await User.findOneAndUpdate(
            { clerkId: req.auth.userId },
            { $set: updates },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/vendors/stats ──────────────────────────────────────────────────
// Quick stats for vendor dashboard
router.get('/stats', protect, async (req, res) => {
    try {
        const [totalCoupons, activeCoupons, totalViews, totalSold] = await Promise.all([
            Coupon.countDocuments({ vendorId: req.auth.userId }),
            Coupon.countDocuments({ vendorId: req.auth.userId, isActive: true }),
            Coupon.aggregate([
                { $match: { vendorId: req.auth.userId } },
                { $group: { _id: null, total: { $sum: '$viewCount' } } },
            ]),
            Coupon.aggregate([
                { $match: { vendorId: req.auth.userId } },
                { $group: { _id: null, total: { $sum: '$soldCount' } } },
            ]),
        ]);

        res.json({
            totalCoupons,
            activeCoupons,
            totalViews: totalViews[0]?.total || 0,
            totalSold: totalSold[0]?.total || 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
