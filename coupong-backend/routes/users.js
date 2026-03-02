import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';

const router = Router();

// ── GET /api/users/me ───────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).lean();
        if (!user) return res.status(404).json({ error: 'User not found. Call /api/auth/sync first.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/users/save-deal/:couponId ─────────────────────────────────────
router.post('/save-deal/:couponId', protect, async (req, res) => {
    try {
        const { couponId } = req.params;
        const coupon = await Coupon.findById(couponId);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

        const user = await User.findOneAndUpdate(
            { clerkId: req.auth.userId },
            { $addToSet: { savedDeals: coupon._id } },
            { new: true }
        );
        res.json({ ok: true, savedDeals: user.savedDeals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /api/users/save-deal/:couponId ───────────────────────────────────
router.delete('/save-deal/:couponId', protect, async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { clerkId: req.auth.userId },
            { $pull: { savedDeals: req.params.couponId } },
            { new: true }
        );
        res.json({ ok: true, savedDeals: user.savedDeals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/users/saved-deals ──────────────────────────────────────────────
router.get('/saved-deals', protect, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('savedDeals');
        if (!user) return res.json([]);
        res.json(user.savedDeals || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
