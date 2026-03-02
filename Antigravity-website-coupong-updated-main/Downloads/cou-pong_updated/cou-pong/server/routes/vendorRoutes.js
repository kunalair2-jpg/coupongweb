const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyToken, checkVendor } = require('../middleware/auth');

// Protected Vendor Routes
router.use(verifyToken, checkVendor);

router.post('/coupons', vendorController.createCoupon);
router.get('/coupons', vendorController.getCoupons);
router.put('/coupons/:id', vendorController.updateCoupon);
router.delete('/coupons/:id', vendorController.deleteCoupon);
router.get('/analytics', vendorController.getAnalytics);

module.exports = router;
