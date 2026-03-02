const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'cou-pong-super-secret-key';

/* verifyToken */
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, error: 'Access Denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ success: false, error: 'Invalid Token' });
    }
};

/* checkVendor */
const checkVendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Access Denied. Vendors only.' });
    }
};

module.exports = { verifyToken, checkVendor };
