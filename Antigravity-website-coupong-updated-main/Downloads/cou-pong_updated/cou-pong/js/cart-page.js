/* =========================================
   Cart Page Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    renderRecommended();
});

function renderCart() {
    const cartItems = cart.getCart();
    const listContainer = document.getElementById('cart-list');
    const emptyState = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');

    if (cartItems.length === 0) {
        if (listContainer) listContainer.innerHTML = '';
        if (cartContent) cartContent.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (cartContent) cartContent.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    let subtotal = 0;

    cartItems.forEach((item, index) => {
        const deal = DEALS.find(d => d.id === item.dealId);
        if (!deal) return; // Skip invalid

        // Determine price based on option
        let price = deal.discountedPrice;
        let title = deal.title;
        let originalPrice = deal.originalPrice;

        if (item.optionId) {
            // Find option in deal.options
            // If deal.options is undefined, check if we generated default options in deal page logic?
            // Ideally data.js has options. If not, we fallback to main price.
            if (deal.options) {
                const opt = deal.options.find(o => o.id === item.optionId);
                if (opt) {
                    price = opt.discountedPrice;
                    title = `${deal.title} - ${opt.title}`;
                    originalPrice = opt.originalPrice;
                }
            }
        }

        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        const locationStr = item.locationId ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;"><i class="ph-fill ph-map-pin"></i> ${item.locationId}</div>` : '';

        html += `
            <div class="cart-item">
                <img src="${deal.image}" alt="${title}" class="item-image">
                <div class="item-details">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${title}</h3>
                    <div style="color: var(--text-light); font-size: 0.9rem;">Valid until: ${new Date(deal.expiryDate).toLocaleDateString()}</div>
                    ${locationStr}
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem;">
                        <div class="quantity-controls">
                            <div class="qty-btn" onclick="updateItemQty(${index}, ${item.quantity - 1})">-</div>
                            <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                            <div class="qty-btn" onclick="updateItemQty(${index}, ${item.quantity + 1})">+</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; color: var(--primary-color);">₹${itemTotal}</div>
                            <div style="font-size: 0.8rem; text-decoration: line-through; color: var(--text-light);">₹${originalPrice * item.quantity}</div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-text" onclick="removeItem(${index})" style="color: var(--danger-color); align-self: flex-start; padding: 0.5rem;"><i class="ph-fill ph-trash"></i></button>
            </div>
        `;
    });

    listContainer.innerHTML = html;

    // Update Summary
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    const total = subtotal + 20; // Service Fee
    document.getElementById('total').textContent = `₹${total}`;
}

function updateItemQty(index, newQty) {
    cart.updateQuantity(index, newQty);
    renderCart();
}

function removeItem(index) {
    if (confirm('Remove this item from cart?')) {
        cart.removeItem(index);
        renderCart();
    }
}

function renderRecommended() {
    const container = document.getElementById('cart-recommended');
    if (!container) return;

    // Simple logic: exclude current cart items
    const cartItems = cart.getCart();
    const cartIds = cartItems.map(i => i.dealId);

    const recommended = DEALS.filter(d => !cartIds.includes(d.id)).slice(0, 4);

    container.innerHTML = recommended.map(deal => `
        <div class="deal-card">
            <div class="deal-image-wrapper">
                <img src="${deal.image}" class="deal-image">
                <div class="discount-badge">${deal.discountPercentage}% OFF</div>
            </div>
            <div class="deal-content">
                <h4 class="deal-title" style="font-size: 1rem;">${deal.title}</h4>
                <div class="deal-footer">
                    <span class="active-price">₹${deal.discountedPrice}</span>
                    <a href="deal.html?id=${deal.id}" class="btn view-btn">View</a>
                </div>
            </div>
        </div>
    `).join('');
}

function applyPromo() {
    alert('Promo code applied! (Simulation)');
}

function proceedToCheckout() {
    const user = auth.getSession();
    if (!user) {
        // save checkout intent
        sessionStorage.setItem('pending_checkout', 'true');
        window.location.href = 'login.html?redirect=cart.html';
        return;
    }

    window.location.href = 'checkout.html';
}

// Check for pending checkout on load
if (sessionStorage.getItem('pending_checkout') === 'true' && auth.getSession()) {
    sessionStorage.removeItem('pending_checkout');
    // window.location.href = 'checkout.html'; // Or just let them proceed nicely
}
