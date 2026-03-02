const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.delete('/:id', cartController.removeFromCart);
router.delete('/remove/:id', cartController.removeFromCart); // Alias

module.exports = router;
