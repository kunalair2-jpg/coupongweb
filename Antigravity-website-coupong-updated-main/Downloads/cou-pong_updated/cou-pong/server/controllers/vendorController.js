const { Coupon, Order, CartItem } = require('../models');

// Create Coupon
exports.createCoupon = async (req, res) => {
    try {
        const { title, discountValue, type, validFrom, expiresOn, category, city } = req.body;
        const vendorId = req.user.id; // From middleware

        const coupon = await Coupon.create({
            vendorId,
            title,
            discountValue,
            type,
            validFrom,
            expiresOn,
            category,
            city,
            status: 'pending' // Admin approval placeholder
        });

        res.status(201).json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Vendor Coupons
exports.getCoupons = async (req, res) => {
    try {
        const email = req.query.email; // From query string
        // Alternatively use req.user.id if logged in

        let query = {};
        if (req.user && req.user.role === 'vendor') {
            query.vendorId = req.user.id;
        } else if (email) {
            // Find vendor by email first? Or assume email lookup
            // Better to rely on Auth token
            query.vendorId = req.user.id;
        }

        const coupons = await Coupon.findAll({ where: query });
        res.json({ success: true, coupons });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const coupon = await Coupon.findOne({ where: { id, vendorId: req.user.id } });
        if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found.' });

        await coupon.update(updates);
        res.json({ success: true, coupon });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findOne({ where: { id, vendorId: req.user.id } });

        if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found.' });

        await coupon.destroy();
        res.json({ success: true, message: 'Deleted coupon.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Vendor Analytics
exports.getAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const coupons = await Coupon.findAll({ where: { vendorId } });
        const totalCoupons = coupons.length;
        const totalViews = coupons.reduce((sum, c) => sum + (c.views || 0), 0);
        const totalRedemptions = coupons.reduce((sum, c) => sum + (c.redemptions || 0), 0);

        res.json({
            success: true,
            analytics: {
                totalCoupons,
                totalViews,
                totalRedemptions
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
