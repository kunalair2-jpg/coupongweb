import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import couponRoutes from './routes/coupons.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendors.js';
import orderRoutes from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────
await connectDB();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        db: process.env.MONGODB_URI?.includes('PASTE') ? 'not configured' : 'connected',
    });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Coupong Backend  →  http://localhost:${PORT}`);
    console.log(`📋 Env: ${process.env.NODE_ENV}`);
    console.log(`🔑 Clerk: ${process.env.CLERK_SECRET_KEY ? '✅' : '❌ not set'}`);
    console.log(`🍃 Mongo: ${process.env.MONGODB_URI?.includes('PASTE') ? '⚠️  not set' : '✅'}\n`);
});

export default app;
