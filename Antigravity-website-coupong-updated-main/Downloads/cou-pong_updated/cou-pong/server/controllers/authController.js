const { User, Vendor } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'cou-pong-super-secret-key';

/* Generate Token */
const generateToken = (user, role) => {
    return jwt.sign({ id: user.id, email: user.email, role }, SECRET, { expiresIn: '7d' });
};

/* --- USER AUTH --- */

// Signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Already exists?
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ success: false, error: 'Email already registered.' });

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            verificationToken
        });

        // Email logic (simulated for file-based DB unless user provides key)
        console.log(`[EMAIL] To: ${email} | Token: ${verificationToken}`);

        res.json({ success: true, message: 'Signup successful. Check email.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        if (!user.isVerified) {
            // For strict mode: return error. For development ease: allow login or check config.
            // Following prompt requirement: "Remove 'Backend connection failed' error" -> implies working login.
            // But prompt also said "User must verify".
            // I'll return error but log the verification link in console.
            console.log(`[VERIFY LINK] ${req.protocol}://${req.get('host')}/verify.html?token=${user.verificationToken}&email=${email}&type=user`);
            return res.status(403).json({ success: false, error: 'Please verify your email first.' });
        }

        const token = generateToken(user, 'user');
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: 'user' } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/* --- VENDOR AUTH --- */

// Vendor Signup
exports.vendorSignup = async (req, res) => {
    try {
        const { businessName, ownerName, email, phone, category, city, password } = req.body;

        // Check User & Vendor table for email uniqueness
        const userExists = await User.findOne({ where: { email } });
        const vendorExists = await Vendor.findOne({ where: { email } });

        if (userExists || vendorExists) return res.status(400).json({ success: false, error: 'Email already in use.' });

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await Vendor.create({
            businessName, ownerName, email, phone, category, city, password,
            verificationToken: verificationToken
            // approved: false (default)
        });

        console.log(`[VENDOR EMAIL] To: ${email} | Token: ${verificationToken}`);
        res.json({ success: true, message: 'Vendor application received. Verify email.' });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Vendor Login
exports.vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ where: { email } });

        if (!vendor || !(await vendor.validPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        if (!vendor.isVerified) {
            console.log(`[VERIFY LINK] ${req.protocol}://${req.get('host')}/verify.html?token=${vendor.verificationToken}&email=${email}&type=vendor`);
            return res.status(403).json({ success: false, error: 'Verify your email first.' });
        }

        const token = generateToken(vendor, 'vendor');
        res.json({
            success: true,
            token,
            vendor: {
                id: vendor.id,
                businessName: vendor.businessName,
                ownerName: vendor.ownerName,
                email: vendor.email,
                type: 'vendor'
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/* --- VERIFICATION --- */

exports.verify = async (req, res) => {
    const { email, token } = req.body;

    // Check Vendor
    let vendor = await Vendor.findOne({ where: { email } });
    if (vendor) {
        if (vendor.verificationToken === token) {
            vendor.isVerified = true;
            vendor.verificationToken = null;
            await vendor.save();
            return res.json({ success: true, type: 'vendor', message: 'Business verified!' });
        }
    }

    // Check User
    let user = await User.findOne({ where: { email } });
    if (user) {
        if (user.verificationToken === token) {
            user.isVerified = true;
            user.verificationToken = null;
            await user.save();
            return res.json({ success: true, type: 'user', message: 'Account verified!' });
        }
    }

    return res.status(400).json({ success: false, error: 'Invalid token or email.' });
};
