/* =========================================
   Authentication System (Token-Based w/ Simulation)
   ========================================= */

const auth = (() => {
    const API_URL = 'http://localhost:5000/api';
    const SESSION_KEY = 'coupong_session';
    const SIM_USERS_KEY = 'coupong_sim_users';

    function getSession() {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    }

    /* 
       1. User Signup
    */
    async function requestSignup(name, email, password) {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            return await response.json();
        } catch (err) {
            console.warn('Backend unavailable. Using Simulation.');
            return { success: true, message: 'Simulated verification link (User).' };
        }
    }

    /* 
       1b. Vendor Signup
    */
    async function requestVendorSignup(data) {
        try {
            const response = await fetch(`${API_URL}/vendor/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (err) {
            console.warn('Backend unavailable. Using Simulation.');
            // [FIX]: Auto-create session for seamless testing if requested
            // but strictly, signup returns success -> verify.
            alert("[DEV] Backend offline. Pretend email sent.");
            return { success: true };
        }
    }

    /*
       2. User Login
    */
    async function requestLogin(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success && data.user) {
                createSession(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            // Simulation Fallback
            createSession({ name: 'Test User', email, type: 'user' });
            return { success: true };
        }
    }

    /*
       2b. Vendor Login
    */
    async function requestVendorLogin(email, password) {
        try {
            const response = await fetch(`${API_URL}/vendor/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success && data.vendor) {
                createSession(data.vendor);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            // Simulation Fallback: Auto-login for testing
            console.warn('Backend offline. Auto-logging in as Vendor.');
            createSession({
                ownerName: 'Test Vendor',
                businessName: 'Business Inc (Sim)',
                email,
                type: 'vendor'
            });
            return { success: true };
        }
    }

    /*
       3. Verify Token
    */
    async function verifyToken(email, token) {
        try {
            const response = await fetch(`${API_URL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token })
            });
            return await response.json();
        } catch (err) {
            return { success: false, error: 'Backend offline.' };
        }
    }

    // --- Session Management ---

    function createSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }

    function getUsers() { return []; }

    return {
        getSession,
        requestSignup,
        requestVendorSignup, // [FIX]: Added to export
        requestLogin,
        requestVendorLogin,  // [FIX]: Added to export
        verifyToken,
        logout,
        getUsers
    };
})();
