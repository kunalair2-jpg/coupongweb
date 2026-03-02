const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Public
router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCoupon);

module.exports = router;
