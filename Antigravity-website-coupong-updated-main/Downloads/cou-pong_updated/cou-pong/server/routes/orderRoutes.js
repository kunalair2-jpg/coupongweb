const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.post('/create', orderController.createOrder); // /api/orders/create
router.post('/confirm', orderController.confirmOrder); // /api/orders/confirm
router.get('/', orderController.getOrders);

module.exports = router;
