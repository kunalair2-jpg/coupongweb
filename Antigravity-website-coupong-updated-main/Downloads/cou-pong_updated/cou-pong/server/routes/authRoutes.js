const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify', authController.verify);

// Vendor Auth
router.post('/vendor/signup', authController.vendorSignup);
router.post('/vendor/login', authController.vendorLogin);

module.exports = router;
