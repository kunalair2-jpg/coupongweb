import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

const clerkConfigured = process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes('PASTE');

// Helper: fetch Clerk user data (only possible when secret key is configured)
async function getClerkUserData(userId) {
    if (!clerkConfigured) {
        // Return minimal data when clerk secret key not set
        return { email: '', name: 'Vendor', photo: '' };
    }
    const { clerkClient } = await import('@clerk/express');
    const u = await clerkClient.users.getUser(userId);
    return {
        email: u.emailAddresses[0]?.emailAddress || '',
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        photo: u.imageUrl || '',
    };
}

// Helper: update Clerk public metadata
async function updateClerkMeta(userId, metadata) {
    if (!clerkConfigured) return; // skip if no secret key
    const { clerkClient } = await import('@clerk/express');
    await clerkClient.users.updateUserMetadata(userId, { publicMetadata: metadata });
}

// ── POST /api/auth/sync ────────────────────────────────────────────────────
router.post('/sync', protect, async (req, res) => {
    try {
        const { userId } = req.auth;
        const { email, name, photo } = await getClerkUserData(userId);

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { $setOnInsert: { clerkId: userId, email, name, photo } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (name) user.name = name;
        if (photo) user.photo = photo;
        await user.save();

        res.json({ ok: true, user });
    } catch (err) {
        console.error('sync error', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) return res.status(404).json({ error: 'User not found. Call /sync first.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PATCH /api/auth/membership ─────────────────────────────────────────────
router.patch('/membership', protect, async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['free', 'plus', 'premium'].includes(tier))
            return res.status(400).json({ error: 'Invalid membership tier' });

        const user = await User.findOneAndUpdate(
            { clerkId: req.auth.userId },
            { membershipTier: tier },
            { new: true }
        );

        await updateClerkMeta(req.auth.userId, { membershipTier: tier, role: user.role });
        res.json({ ok: true, membershipTier: tier, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/set-role ────────────────────────────────────────────────
router.post('/set-role', protect, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['customer', 'vendor'].includes(role))
            return res.status(400).json({ error: 'Invalid role' });

        const user = await User.findOneAndUpdate(
            { clerkId: req.auth.userId },
            { role },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await updateClerkMeta(req.auth.userId, { role, membershipTier: user.membershipTier });
        res.json({ ok: true, role, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/auth/vendor-register ────────────────────────────────────────
router.post('/vendor-register', protect, async (req, res) => {
    try {
        const { businessName, phone, city, category } = req.body;
        const { userId } = req.auth;
        const { email, name, photo } = await getClerkUserData(userId);

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { $set: { email, name, photo, role: 'vendor', businessName, phone, city, category } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await updateClerkMeta(userId, { role: 'vendor', membershipTier: user.membershipTier });
        res.json({ ok: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
