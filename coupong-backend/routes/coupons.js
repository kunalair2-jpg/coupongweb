import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import Coupon from '../models/Coupon.js';

const router = Router();

// ── GET /api/coupons ────────────────────────────────────────────────────────
// Public — list & filter coupons
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { city, category, q, membersOnly, limit = 60, page = 1, sort = 'createdAt' } = req.query;
        const filter = { isActive: true };

        if (city) filter.city = { $regex: city, $options: 'i' };
        if (category) filter.category = category;
        if (membersOnly) filter.membersOnly = membersOnly === 'true';

        // Text search
        if (q) filter.$text = { $search: q };

        const skip = (Number(page) - 1) * Number(limit);
        const sortMap = { newest: { createdAt: -1 }, popular: { soldCount: -1 }, rating: { rating: -1 } };
        const sortObj = sortMap[sort] || { createdAt: -1 };

        const [coupons, total] = await Promise.all([
            Coupon.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
            Coupon.countDocuments(filter),
        ]);

        res.json({ coupons, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/coupons/:id ────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        // Increment view count
        coupon.viewCount += 1;
        await coupon.save();
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/coupons/vendor/my ──────────────────────────────────────────────
// Vendor sees their own coupons
router.get('/vendor/my', protect, async (req, res) => {
    try {
        const coupons = await Coupon.find({ vendorId: req.auth.userId }).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/coupons ───────────────────────────────────────────────────────
// Vendor creates a coupon
router.post('/', protect, async (req, res) => {
    try {
        const {
            title, shortDescription, description, category,
            primaryImage, discountType, discountValue, originalPrice,
            discountedPrice, city, locality, lat, lng,
            membersOnly, expiresOn, tags, vendorName,
        } = req.body;

        if (!title || !category || !discountValue)
            return res.status(400).json({ error: 'title, category and discountValue are required' });

        const coupon = await Coupon.create({
            vendorId: req.auth.userId,
            vendorName: vendorName || '',
            title, shortDescription, description, category,
            primaryImage, discountType, discountValue,
            originalPrice, discountedPrice,
            city, locality, lat, lng,
            membersOnly: !!membersOnly,
            expiresOn: expiresOn ? new Date(expiresOn) : null,
            tags: Array.isArray(tags) ? tags : [],
        });

        res.status(201).json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /api/coupons/:id ──────────────────────────────────────────────────
// Vendor updates their own coupon
router.patch('/:id', protect, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        if (coupon.vendorId !== req.auth.userId)
            return res.status(403).json({ error: 'Not your coupon' });

        const allowed = [
            'title', 'shortDescription', 'description', 'category', 'primaryImage',
            'discountType', 'discountValue', 'originalPrice', 'discountedPrice',
            'city', 'locality', 'lat', 'lng', 'membersOnly', 'expiresOn', 'tags', 'isActive'
        ];
        allowed.forEach(key => { if (req.body[key] !== undefined) coupon[key] = req.body[key]; });
        await coupon.save();
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /api/coupons/:id ─────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        if (coupon.vendorId !== req.auth.userId)
            return res.status(403).json({ error: 'Not your coupon' });

        await coupon.deleteOne();
        res.json({ ok: true, message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
