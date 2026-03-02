const { Order, CartItem, Coupon } = require('../models');

// Create Order (Checkout)
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User's Cart
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{ model: Coupon }]
        });

        if (cartItems.length === 0) return res.status(400).json({ success: false, error: 'Cart is empty.' });

        // Calculate Total
        let total = 0;
        const items = cartItems.map(item => {
            const price = item.Coupon.discountValue; // Assuming discountValue is price if flat. If percentage, assume original price is stored elsewhere... 
            // For simplicity, let's treat discountValue as PRICE TO PAY if flat, or calculation needed.
            // Simplified: Assume `discountValue` is Price.
            total += (price * item.quantity);
            return {
                couponId: item.couponId,
                title: item.Coupon.title,
                price: price,
                quantity: item.quantity
            };
        });

        // Create Order
        const order = await Order.create({
            userId,
            items: JSON.stringify(items),
            totalAmount: total,
            status: 'pending',
            paymentStatus: 'unpaid'
        });

        // Clear Cart
        await CartItem.destroy({ where: { userId } });

        res.json({ success: true, orderId: order.id, totalAmount: total });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Confirm Payment (Mock)
exports.confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findByPk(orderId);

        if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
        if (order.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Access denied.' });

        // Simulate Payment Check
        order.paymentStatus = 'paid';
        order.status = 'completed';
        await order.save();

        // Increment Redemptions for Coupons
        const items = JSON.parse(order.items);
        for (const item of items) {
            const coupon = await Coupon.findByPk(item.couponId);
            if (coupon) await coupon.increment('redemptions');
        }

        res.json({ success: true, message: 'Order confirmed!' });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get User Orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { userId: req.user.id } });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
