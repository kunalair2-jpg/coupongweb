/* 
   Vendor Simulation Store 
   Handles data persistence in localStorage when Backend is offline.
*/
const VendorSim = {
    // Get all coupons for a vendor
    getCoupons: (email) => {
        const key = `coupong_vendor_${email}_coupons`;
        const data = localStorage.getItem(key);
        if (!data) {
            // Default Demo Data if empty
            const demos = [
                { id: 101, title: 'Summer Lunch Special', type: 'percentage', value: 20, endDate: '2024-09-30', status: 'active', views: 45, redemptions: 12 },
                { id: 102, title: 'Buy 1 Get 1 Free Pizza', type: 'b1g1', value: 0, endDate: '2024-10-15', status: 'pending', views: 10, redemptions: 0 }
            ];
            localStorage.setItem(key, JSON.stringify(demos));
            return demos;
        }
        return JSON.parse(data);
    },

    // Add a new coupon
    addCoupon: (email, couponData) => {
        const list = VendorSim.getCoupons(email);
        const newCoupon = {
            id: Date.now(),
            ...couponData,
            status: 'active', // Auto-activate for demo
            views: 0,
            redemptions: 0,
            createdAt: new Date().toISOString()
        };
        list.unshift(newCoupon); // Add to top
        localStorage.setItem(`coupong_vendor_${email}_coupons`, JSON.stringify(list));
        return newCoupon;
    },

    // Get Analytics
    getAnalytics: (email) => {
        const list = VendorSim.getCoupons(email);
        return {
            totalCoupons: list.length,
            activeCoupons: list.filter(c => c.status === 'active').length,
            totalViews: list.reduce((sum, c) => sum + (c.views || 0), 0),
            totalRedemptions: list.reduce((sum, c) => sum + (c.redemptions || 0), 0)
        };
    },

    // Get Single Coupon
    getCouponById: (email, id) => {
        const list = VendorSim.getCoupons(email);
        return list.find(c => c.id == id);
    },

    // Update Coupon
    updateCoupon: (email, id, updatedData) => {
        const list = VendorSim.getCoupons(email);
        const index = list.findIndex(c => c.id == id);
        if (index > -1) {
            list[index] = { ...list[index], ...updatedData };
            localStorage.setItem(`coupong_vendor_${email}_coupons`, JSON.stringify(list));
            return true;
        }
        return false;
    },

    // Delete Coupon
    deleteCoupon: (email, id) => {
        const list = VendorSim.getCoupons(email);
        const newList = list.filter(c => c.id != id);
        localStorage.setItem(`coupong_vendor_${email}_coupons`, JSON.stringify(newList));
        return true;
    }
};
