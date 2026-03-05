/**
 * API utility — all calls to the Express backend go through here.
 * Automatically attaches the Clerk session token as a Bearer token.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make an authenticated API call.
 * @param {string} path - API path e.g. '/api/auth/me'
 * @param {object} options - fetch options (method, body, etc.)
 * @param {function|null} getToken - Clerk's getToken() function (pass from useAuth hook)
 */
export async function apiFetch(path, options = {}, getToken = null) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    if (getToken) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
    syncUser: (getToken) => apiFetch('/api/auth/sync', { method: 'POST' }, getToken),
    getMe: (getToken) => apiFetch('/api/auth/me', {}, getToken),
    updateMembership: (tier, getToken) => apiFetch('/api/auth/membership', { method: 'PATCH', body: { tier } }, getToken),
    setRole: (role, getToken) => apiFetch('/api/auth/set-role', { method: 'POST', body: { role } }, getToken),
    registerVendor: (data, getToken) => apiFetch('/api/auth/vendor-register', { method: 'POST', body: data }, getToken),
};

// ── Coupons API ───────────────────────────────────────────────
export const couponsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiFetch(`/api/coupons${params ? '?' + params : ''}`);
    },
    getOne: (id) => apiFetch(`/api/coupons/${id}`),
    getMyCoupons: (getToken) => apiFetch('/api/coupons/vendor/my', {}, getToken),
    create: (data, getToken) => apiFetch('/api/coupons', { method: 'POST', body: data }, getToken),
    update: (id, data, getToken) => apiFetch(`/api/coupons/${id}`, { method: 'PATCH', body: data }, getToken),
    delete: (id, getToken) => apiFetch(`/api/coupons/${id}`, { method: 'DELETE' }, getToken),  // getToken required for auth
};

// ── Users API ─────────────────────────────────────────────────
export const usersAPI = {
    getMe: (getToken) => apiFetch('/api/users/me', {}, getToken),
    saveDeal: (dealId, getToken) => apiFetch(`/api/users/save-deal/${dealId}`, { method: 'POST' }, getToken),
    unsaveDeal: (dealId, getToken) => apiFetch(`/api/users/save-deal/${dealId}`, { method: 'DELETE' }, getToken),
    getSavedDeals: (getToken) => apiFetch('/api/users/saved-deals', {}, getToken),
};

// ── Vendors API ───────────────────────────────────────────────
export const vendorsAPI = {
    getProfile: (getToken) => apiFetch('/api/vendors/profile', {}, getToken),
    updateProfile: (data, getToken) => apiFetch('/api/vendors/profile', { method: 'PATCH', body: data }, getToken),
    getStats: (getToken) => apiFetch('/api/vendors/stats', {}, getToken),
};

// ── Orders API ────────────────────────────────────────────────
export const ordersAPI = {
    create: (couponId, getToken) => apiFetch('/api/orders', { method: 'POST', body: { couponId } }, getToken),
    getMy: (getToken) => apiFetch('/api/orders/my', {}, getToken),
    getVendorOrders: (getToken) => apiFetch('/api/orders/vendor', {}, getToken),
    redeem: (orderId, getToken) => apiFetch(`/api/orders/${orderId}/redeem`, { method: 'PATCH' }, getToken),
};
