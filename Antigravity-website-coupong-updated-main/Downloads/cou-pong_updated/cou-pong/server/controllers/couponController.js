const { Coupon, Vendor } = require('../models');

// Get All (Filterable)
exports.getCoupons = async (req, res) => {
    try {
        const { city, category, status } = req.query;
        let where = { status: 'active' }; // Only active by default

        if (city) where.city = city;
        if (category) where.category = category;
        if (status) where.status = status;

        const coupons = await Coupon.findAll({ where, include: Vendor });
        res.json({ success: true, coupons });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get By ID
exports.getCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id, { include: Vendor });

        if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found.' });

        // Increment Views
        await coupon.increment('views');

        res.json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
