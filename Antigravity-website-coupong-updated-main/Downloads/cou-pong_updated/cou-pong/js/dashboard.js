/* =========================================
   Dashboard Logic & Data Management
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getSession();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    initDashboard(user);
    setupNavigation();
});

function initDashboard(user) {
    // Update user info
    document.getElementById('user-name').textContent = user.name.split(' ')[0];
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-since').textContent = new Date(user.createdAt).toLocaleDateString();

    // Membership badge
    const membershipBadge = document.getElementById('membership-badge');
    if (user.membershipTier === 'premium' || user.membershipTier === 'plus') {
        membershipBadge.innerHTML = '<span class="badge premium"><i class="ph-fill ph-crown"></i> Cou-pong Plus</span>';
    } else {
        membershipBadge.innerHTML = '<span class="badge" style="background: var(--surface-color); color: var(--text-secondary);">Free Member</span>';
    }

    // Load all data
    loadWalletData();
    loadCouponsData();
    loadSavedDeals();
    loadReferrals();
    loadNotifications();
    loadMembershipSection(user);
    updateStats();
}

function loadWalletData() {
    const wallet = auth.getWallet();
    if (!wallet) return;

    // Overview cards
    document.getElementById('overview-cashback').textContent = wallet.cashback;
    document.getElementById('overview-points').textContent = wallet.rewardPoints;
    document.getElementById('overview-credits').textContent = wallet.couponCredits;

    // Wallet section
    document.getElementById('wallet-cashback').textContent = wallet.cashback;
    document.getElementById('wallet-points').textContent = wallet.rewardPoints;
    document.getElementById('wallet-credits').textContent = wallet.couponCredits;

    // Transactions
    const transactionsList = document.getElementById('transactions-list');
    if (wallet.transactions && wallet.transactions.length > 0) {
        transactionsList.innerHTML = wallet.transactions.slice(0, 10).map(t => `
            <div class="transaction-item">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${t.reason}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">${new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div style="text-align: right;">
                    ${t.cashback > 0 ? `<div style="color: var(--success-color); font-weight: 600;">+₹${t.cashback}</div>` : ''}
                    ${t.points > 0 ? `<div style="color: #4f46e5; font-size: 0.9rem;">+${t.points} pts</div>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        transactionsList.innerHTML = '<div class="empty-state"><i class="ph ph-wallet"></i><p>No transactions yet</p></div>';
    }
}

function loadCouponsData() {
    const redemptions = auth.getRedemptions();
    if (!redemptions) return;

    // Active coupons
    const activeList = document.getElementById('active-coupons-list');
    if (redemptions.active && redemptions.active.length > 0) {
        activeList.innerHTML = redemptions.active.map(coupon => `
            <div class="coupon-card">
                <div style="flex: 1;">
                    <h3 style="margin-bottom: 0.5rem;">${coupon.dealTitle}</h3>
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
                        <span class="badge active">Active</span>
                        <span style="font-size: 0.9rem; color: var(--text-light);">Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div class="coupon-code">${coupon.code}</div>
                    <div style="margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-secondary);">
                        <i class="ph-fill ph-gift"></i> Earn ₹${coupon.cashbackEarned} cashback + ${coupon.pointsEarned} points on use
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="markCouponAsUsed('${coupon.id}')">
                        <i class="ph-fill ph-check-circle"></i> Mark as Used
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        activeList.innerHTML = '<div class="empty-state"><i class="ph ph-ticket"></i><p>No active coupons. Browse deals to get started!</p><a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Deals</a></div>';
    }

    // Used coupons
    const usedList = document.getElementById('used-coupons-list');
    if (redemptions.used && redemptions.used.length > 0) {
        usedList.innerHTML = redemptions.used.slice(0, 5).map(coupon => `
            <div class="coupon-card" style="opacity: 0.7;">
                <div style="flex: 1;">
                    <h3 style="margin-bottom: 0.5rem;">${coupon.dealTitle}</h3>
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                        <span class="badge used">Used</span>
                        <span style="font-size: 0.9rem; color: var(--text-light);">Used on: ${new Date(coupon.usedAt).toLocaleDateString()}</span>
                    </div>
                    <div style="font-size: 0.9rem; color: var(--success-color);">
                        <i class="ph-fill ph-check-circle"></i> ₹${coupon.cashbackEarned} cashback credited
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        usedList.innerHTML = '<div class="empty-state"><i class="ph ph-check-circle"></i><p>No used coupons yet</p></div>';
    }
}

function loadSavedDeals() {
    const user = auth.getSession();
    if (!user || !user.savedDeals || user.savedDeals.length === 0) {
        document.getElementById('saved-deals-list').innerHTML = '<div class="empty-state"><i class="ph ph-heart"></i><p>No saved deals yet</p><a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Deals</a></div>';
        return;
    }

    const savedDeals = DEALS.filter(d => user.savedDeals.includes(d.id));
    document.getElementById('saved-deals-list').innerHTML = savedDeals.map(deal => {
        const store = STORES.find(s => s.id === deal.storeId);
        return `
            <div class="deal-card">
                <div class="deal-image-wrapper">
                    <img src="${deal.image}" alt="${deal.title}" class="deal-image">
                    <div class="discount-badge">${deal.discountPercentage}% OFF</div>
                </div>
                <div class="deal-content">
                    <div class="store-info">
                        <img src="${store.logo}" class="store-logo">
                        <div class="store-name">${store.name}</div>
                    </div>
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-footer">
                        <span class="active-price">₹${deal.discountedPrice}</span>
                        <a href="deal.html?id=${deal.id}" class="btn view-btn">View</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadReferrals() {
    const user = auth.getSession();
    if (!user) return;

    // Display referral code
    document.getElementById('referral-code').textContent = user.referralCode;

    // Display referrals list
    const referrals = auth.getReferrals();
    const referralsList = document.getElementById('referrals-list');

    if (referrals && referrals.length > 0) {
        const totalEarned = referrals.reduce((sum, r) => sum + r.reward, 0);
        referralsList.innerHTML = `
            <div style="background: var(--surface-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; text-align: center;">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Total Referral Earnings</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">₹${totalEarned}</div>
            </div>
            ${referrals.map(r => `
                <div class="transaction-item">
                    <div>
                        <div style="font-weight: 600;">${r.userName}</div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">${new Date(r.date).toLocaleDateString()}</div>
                    </div>
                    <div style="color: var(--success-color); font-weight: 600;">+₹${r.reward}</div>
                </div>
            `).join('')}
        `;
    } else {
        referralsList.innerHTML = '<div class="empty-state"><i class="ph ph-users-three"></i><p>No referrals yet. Share your code to start earning!</p></div>';
    }
}

function loadNotifications() {
    const user = auth.getSession();
    if (!user || !user.notifications || user.notifications.length === 0) {
        document.getElementById('notifications-list').innerHTML = '<div class="empty-state"><i class="ph ph-bell"></i><p>No notifications</p></div>';
        return;
    }

    const unreadCount = user.notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        const badge = document.getElementById('notif-badge');
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
        badge.style.background = 'var(--danger-color)';
        badge.style.color = 'white';
    }

    document.getElementById('notifications-list').innerHTML = user.notifications.map(notif => `
        <div class="notification-item ${notif.type}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${notif.message}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">${new Date(notif.date).toLocaleString()}</div>
                </div>
                ${!notif.read ? '<span class="badge" style="background: var(--primary-color); color: white;">New</span>' : ''}
            </div>
        </div>
    `).join('');
}

function loadMembershipSection(user) {
    const section = document.getElementById('membership-section');
    const isMember = (user.membershipTier === 'premium' || user.membershipTier === 'plus');

    if (isMember) {
        let expiryDate = user.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString() : 'Lifetime';
        let planName = user.membershipPlan ? (user.membershipPlan.charAt(0).toUpperCase() + user.membershipPlan.slice(1)) : 'Annual';

        section.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #FFB30F, #FF5A1F); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">👑</div>
                <h3 style="margin-bottom: 0.5rem;">Cou-pong Plus Member</h3>
                <p style="color: var(--success-color); margin-bottom: 0.5rem; font-weight: 600;">Status: Active</p>
                <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 0.9rem;">Plan: ${planName} • Expires: ${expiryDate}</p>
                
                <div style="background: var(--surface-color); padding: 1.5rem; border-radius: var(--radius-md); text-align: left; border: 1px solid #e5e7eb;">
                    <h4 style="margin-bottom: 1rem; color: var(--primary-color);">Your Active Benefits:</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 0.5rem 0; display:flex; align-items:center; gap:0.5rem;"><i class="ph-fill ph-check-circle" style="color: var(--success-color);"></i> <strong>10% Cashback</strong> on all deals (vs 5%)</li>
                        <li style="padding: 0.5rem 0; display:flex; align-items:center; gap:0.5rem;"><i class="ph-fill ph-check-circle" style="color: var(--success-color);"></i> Access to <strong>Exclusive Member Deals</strong></li>
                        <li style="padding: 0.5rem 0; display:flex; align-items:center; gap:0.5rem;"><i class="ph-fill ph-check-circle" style="color: var(--success-color);"></i> Premium Support</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        section.innerHTML = `
            <div style="text-align: center; max-width: 600px; margin: 0 auto; padding: 2rem; background: linear-gradient(135deg, #fff 0%, #fff7ed 100%); border-radius: var(--radius-lg); border: 1px solid #fed7aa;">
                <h3 style="margin-bottom: 0.5rem; color: #9a3412;">Unlock Cou-pong Plus</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Double your cashback and get exclusive access!</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left; margin-bottom: 2rem;">
                    <div><i class="ph-fill ph-crown" style="color: #f59e0b;"></i> Members-only deals</div>
                    <div><i class="ph-fill ph-trend-up" style="color: #f59e0b;"></i> 10% Extra Cashback</div>
                    <div><i class="ph-fill ph-star" style="color: #f59e0b;"></i> Priority Support</div>
                    <div><i class="ph-fill ph-gift" style="color: #f59e0b;"></i> Bonus Points</div>
                </div>

                <a href="membership.html" class="btn btn-primary" style="background: linear-gradient(135deg, #FFB30F 0%, #FF5A1F 100%); width: 100%; display: block; text-decoration: none;">
                    View Plans & Upgrade
                </a>
            </div>
        `;
    }
}

function updateStats() {
    const redemptions = auth.getRedemptions();
    const user = auth.getSession();

    if (redemptions) {
        document.getElementById('stat-active').textContent = redemptions.active ? redemptions.active.length : 0;
        document.getElementById('stat-used').textContent = redemptions.used ? redemptions.used.length : 0;
    }

    if (user && user.savedDeals) {
        document.getElementById('stat-saved').textContent = user.savedDeals.length;
    }
}

function setupNavigation() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.dashboard-section');

    links.forEach(link => {
        link.addEventListener('click', () => {
            const targetSection = link.dataset.section;

            // Update active states
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Global functions
window.markCouponAsUsed = async function (redemptionId) {
    if (!confirm('Mark this coupon as used? Cashback will be credited to your wallet.')) return;

    try {
        await auth.markAsUsed(redemptionId);
        alert('Coupon marked as used! Cashback credited to your wallet.');
        location.reload();
    } catch (err) {
        alert('Error: ' + err);
    }
};

window.copyReferralCode = function () {
    const user = auth.getSession();
    if (!user) return;

    navigator.clipboard.writeText(user.referralCode).then(() => {
        alert('Referral code copied! Share it with friends.');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = user.referralCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Referral code copied!');
    });
};

window.upgradeToPremium = function () {
    window.location.href = 'membership.html';
};
