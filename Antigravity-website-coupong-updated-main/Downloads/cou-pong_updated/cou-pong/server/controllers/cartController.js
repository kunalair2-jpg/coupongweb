const { CartItem, Coupon } = require('../models');

// Get Cart
exports.getCart = async (req, res) => {
    try {
        const cart = await CartItem.findAll({
            where: { userId: req.user.id },
            include: [{ model: Coupon }]
        });
        res.json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { couponId, quantity } = req.body;
        const userId = req.user.id;

        // Find existing
        let cartItem = await CartItem.findOne({ where: { userId, couponId } });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity || 1);
            await cartItem.save();
        } else {
            await CartItem.create({ userId, couponId, quantity: quantity || 1 });
        }

        res.json({ success: true, message: 'Added to cart.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await CartItem.destroy({ where: { id, userId: req.user.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
