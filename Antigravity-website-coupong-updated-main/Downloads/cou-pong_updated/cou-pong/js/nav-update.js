/* =========================================
   Navigation Update for Auth State
   ========================================= */

function updateNavigation() {
    const navContainer = document.querySelector('.nav-actions');
    if (!navContainer) return;

    const user = auth.getSession();

    if (user) {
        const wallet = auth.getWallet();
        const isMember = (user.membershipTier === 'plus' || user.membershipTier === 'premium');
        const badge = isMember ? '<span class="badge premium" style="margin-left:5px; font-size:0.7em"><i class="ph-fill ph-crown"></i> PLUS</span>' : '';

        navContainer.innerHTML = `
            <a href="my-dashboard.html" class="nav-link" style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="ph-fill ph-wallet"></i>
                <span style="font-weight: 600; color: var(--success-color);">₹${wallet ? wallet.cashback : 0}</span>
            </a>
            <a href="my-dashboard.html" class="btn btn-text" style="display: flex; align-items: center;">
                <i class="ph-fill ph-user-circle"></i> ${user.name.split(' ')[0]} ${badge}
            </a>
            <button onclick="auth.logout()" class="btn btn-secondary">Log Out</button>
        `;
    } else {
        navContainer.innerHTML = `
            <a href="login.html" class="btn btn-text">Log In</a>
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Auto-run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
}
