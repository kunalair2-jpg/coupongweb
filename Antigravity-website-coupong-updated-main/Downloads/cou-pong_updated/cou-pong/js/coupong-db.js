/**
 * SHARED DATABASE FUNCTIONS (coupong-db.js)
 * Acts as a centralized LocalStorage manager for the Cou-pong platform.
 */

const DB_KEY = 'coupong_coupons';

// Initialize with sample data if empty
function initializeDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        console.log('🔄 Initializing Database with Sample Data...');
        const sampleCoupons = [
            {
                id: 1700000000001,
                vendor_id: 1,
                vendor_name: "South Indian Restaurant",
                title: "Idli Sambar Special",
                short_description: "Authentic breakfast with unlimited sambar",
                long_description: "Enjoy our famous feather-light idlis with spicy sambar and coconut chutney.",
                category: "food",
                subcategory: "breakfast",
                discount_type: "percentage",
                discount_value: 15,
                min_purchase_amount: 100,
                max_discount_cap: 50,
                total_coupons: 100,
                coupons_redeemed: 12,
                remaining_coupons: 88,
                per_user_limit: 1,
                valid_from: new Date().toISOString(), // Valid from now
                expires_on: new Date(Date.now() + 86400000 * 30).toISOString(), // +30 days
                active_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                active_time_from: "08:00",
                active_time_to: "11:00",
                city: "Pune",
                locality: "Shivajinagar",
                images: [],
                primary_image: "https://source.unsplash.com/random/400x300/?idli",
                status: "active",
                is_featured: true,
                is_trending: true,
                total_views: 150,
                total_clicks: 45,
                rating: 4.8,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 1700000000002,
                vendor_id: 2,
                vendor_name: "Gold's Gym",
                title: "Free 3-Day Trial",
                short_description: "Experience our premium equipment",
                long_description: "Full access to cardio, weights, and steam room for 3 consecutive days.",
                category: "health",
                subcategory: "gym",
                discount_type: "fixed",
                discount_value: 0,
                min_purchase_amount: 0,
                max_discount_cap: 0,
                total_coupons: 50,
                coupons_redeemed: 5,
                remaining_coupons: 45,
                per_user_limit: 1,
                valid_from: new Date().toISOString(),
                expires_on: new Date(Date.now() + 86400000 * 15).toISOString(),
                active_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                active_time_from: "10:00",
                active_time_to: "20:00",
                city: "Pune",
                locality: "Koregaon Park",
                images: [],
                primary_image: "https://source.unsplash.com/random/400x300/?gym",
                status: "active",
                is_featured: true,
                is_trending: false,
                total_views: 80,
                total_clicks: 20,
                rating: 4.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        localStorage.setItem(DB_KEY, JSON.stringify(sampleCoupons));
    }
}

// Get all coupons
function getAllCoupons() {
    initializeDatabase();
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
}

// Get coupon by ID
function getCouponById(id) {
    const coupons = getAllCoupons();
    return coupons.find(c => c.id === parseInt(id));
}

// Save new coupon
function saveCoupon(couponData) {
    const coupons = getAllCoupons();
    const newCoupon = {
        id: Date.now(),
        vendor_id: 1, // Simulated current vendor
        vendor_name: "Current Vendor (You)",
        ...couponData,
        coupons_redeemed: 0,
        remaining_coupons: couponData.total_coupons || null,
        total_views: 0,
        total_clicks: 0,
        rating: 0,
        status: "active", // Auto-activate for demo
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
    };
    coupons.unshift(newCoupon); // Add to top
    localStorage.setItem(DB_KEY, JSON.stringify(coupons));
    console.log('💾 Coupon Saved:', newCoupon);
    return newCoupon;
}

// Update existing coupon
function updateCoupon(id, updates) {
    const coupons = getAllCoupons();
    const index = coupons.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
        coupons[index] = {
            ...coupons[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(DB_KEY, JSON.stringify(coupons));
        console.log('💾 Coupon Updated:', coupons[index]);
        return coupons[index];
    }
    return null;
}

// Delete coupon
function deleteCoupon(id) {
    const coupons = getAllCoupons();
    const filtered = coupons.filter(c => c.id !== parseInt(id));
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    console.log('🗑️ Coupon Deleted:', id);
    return true;
}

// Search coupons with filters
function searchCoupons(filters = {}) {
    let coupons = getAllCoupons();

    // 1. Text Search (Title, Desc, Vendor)
    if (filters.query) {
        const q = filters.query.toLowerCase();
        coupons = coupons.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.short_description.toLowerCase().includes(q) ||
            c.vendor_name.toLowerCase().includes(q)
        );
    }

    // 2. City Filter
    if (filters.city) {
        coupons = coupons.filter(c => c.city.toLowerCase() === filters.city.toLowerCase());
    }

    // 3. Locality Filter
    if (filters.locality) {
        coupons = coupons.filter(c => c.locality.toLowerCase().includes(filters.locality.toLowerCase()));
    }

    // 4. Category Filter
    if (filters.category && filters.category !== 'all') {
        coupons = coupons.filter(c => c.category === filters.category);
    }

    // 5. Active Status & Expiry
    const now = new Date();
    coupons = coupons.filter(c => c.status === 'active' && new Date(c.expires_on) > now);

    // 6. Day of Week Check
    const todayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = todayMap[now.getDay()];
    // If active_days is defined and not empty, check if today is included
    coupons = coupons.filter(c => !c.active_days || c.active_days.length === 0 || c.active_days.includes(today));

    // 7. Time Check
    const currentHM = now.toTimeString().slice(0, 5); // "14:30"
    coupons = coupons.filter(c => {
        if (!c.active_time_from || !c.active_time_to) return true;
        return currentHM >= c.active_time_from && currentHM <= c.active_time_to;
    });

    // 8. Sorting
    if (filters.sortBy === 'discount') {
        coupons.sort((a, b) => b.discount_value - a.discount_value);
    } else if (filters.sortBy === 'expiring') {
        coupons.sort((a, b) => new Date(a.expires_on) - new Date(b.expires_on));
    } else {
        // Default: Featured first, then newest
        coupons.sort((a, b) => {
            if (a.is_featured === b.is_featured) return new Date(b.created_at) - new Date(a.created_at);
            return b.is_featured ? 1 : -1;
        });
    }

    return coupons;
}

// Increment Analytics
function incrementViews(id) {
    const coupons = getAllCoupons();
    const coupon = coupons.find(c => c.id === parseInt(id));
    if (coupon) {
        coupon.total_views++;
        localStorage.setItem(DB_KEY, JSON.stringify(coupons));
    }
}

function incrementClicks(id) {
    const coupons = getAllCoupons();
    const coupon = coupons.find(c => c.id === parseInt(id));
    if (coupon) {
        coupon.total_clicks++;
        localStorage.setItem(DB_KEY, JSON.stringify(coupons));
    }
}
