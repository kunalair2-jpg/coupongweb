import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';

const clerkConfigured = process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes('PASTE');

if (!clerkConfigured) {
    console.warn('⚠️  CLERK_SECRET_KEY not set — auth middleware in DEV BYPASS mode');
}

/**
 * protect — verifies Clerk JWT.
 * Always sets req.auth = { userId, sessionId } as a plain object
 * so all routes can safely use req.auth.userId.
 */
export const protect = (req, res, next) => {
    if (!clerkConfigured) {
        // DEV BYPASS: decode JWT without verifying signature
        try {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.replace('Bearer ', '');
            if (!token) return res.status(401).json({ error: 'No token provided' });

            const payload = JSON.parse(
                Buffer.from(token.split('.')[1], 'base64').toString('utf8')
            );
            req.auth = { userId: payload.sub, sessionId: payload.sid };
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token (dev bypass): ' + err.message });
        }
    }

    // Full Clerk verification — then normalize req.auth to a plain object
    requireAuth()(req, res, (err) => {
        if (err) return next(err);
        try {
            const auth = getAuth(req);
            req.auth = { userId: auth.userId, sessionId: auth.sessionId };
        } catch {
            // getAuth failed — fall back to calling req.auth() if it's a function
            if (typeof req.auth === 'function') {
                const auth = req.auth();
                req.auth = { userId: auth.userId, sessionId: auth.sessionId };
            }
        }
        return next();
    });
};

/**
 * optionalAuth — attaches auth if token present, never rejects.
 */
export const optionalAuth = (req, res, next) => {
    if (!clerkConfigured) {
        try {
            const token = (req.headers.authorization || '').replace('Bearer ', '');
            if (token) {
                const payload = JSON.parse(
                    Buffer.from(token.split('.')[1], 'base64').toString('utf8')
                );
                req.auth = { userId: payload.sub, sessionId: payload.sid };
            }
        } catch { }
        return next();
    }

    clerkMiddleware()(req, res, (err) => {
        if (err) return next(err);
        try {
            const auth = getAuth(req);
            if (auth?.userId) {
                req.auth = { userId: auth.userId, sessionId: auth.sessionId };
            }
        } catch { }
        return next();
    });
};

export const getClerkAuth = (req) => getAuth(req);
