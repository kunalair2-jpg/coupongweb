const DB_KEY = 'coupong_coupons';
const AUTH_KEY = 'coupong_user';
const CART_KEY = 'coupong_cart';

// ── Coupon DB ──────────────────────────────────────────────
export function getAllCoupons() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
    catch { return []; }
}

export function saveCoupon(coupon) {
    const coupons = getAllCoupons();
    const existing = coupons.findIndex(c => c.id === coupon.id);
    if (existing >= 0) coupons[existing] = coupon;
    else coupons.push({ ...coupon, id: coupon.id || 'dyn-' + Date.now() });
    localStorage.setItem(DB_KEY, JSON.stringify(coupons));
    return coupon;
}

export function deleteCoupon(id) {
    const coupons = getAllCoupons().filter(c => c.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(coupons));
}

// ── Auth ────────────────────────────────────────────────────
export function getSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
    catch { return null; }
}

export function login(userData) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
}

export function signup(userData) {
    const user = { ...userData, id: 'user-' + Date.now(), membershipTier: 'free', joinedAt: new Date().toISOString() };
    login(user);
    return user;
}

// ── Cart ────────────────────────────────────────────────────
export function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}

export function addToCart(item) {
    const cart = getCart();
    const exists = cart.find(c => c.id === item.id);
    if (!exists) cart.push({ ...item, qty: 1 });
    else exists.qty += 1;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(id) {
    const cart = getCart().filter(c => c.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}
