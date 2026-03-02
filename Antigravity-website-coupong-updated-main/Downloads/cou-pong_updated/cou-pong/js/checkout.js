/* =========================================
   Checkout Logic with Secure Verification
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getSession();
    if (!user) {
        sessionStorage.setItem('pending_checkout', 'true');
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }
    renderCheckoutSummary();

    // Attach Enter key for OTP
    const otpInput = document.getElementById('otp-input');
    if (otpInput) {
        otpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyOtp();
        });
    }
});

let selectedPaymentMethod = 'card';

window.selectPayment = function (method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    const cardForm = document.getElementById('card-form');
    const upiSection = document.getElementById('upi-section');

    if (cardForm) cardForm.style.display = 'none';
    if (upiSection) upiSection.style.display = 'none';

    if (method === 'card' && cardForm) cardForm.style.display = 'block';
    if (method === 'upi' && upiSection) upiSection.style.display = 'block';
};

function renderCheckoutSummary() {
    const cartItems = cart.getCart();
    if (cartItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    const container = document.getElementById('checkout-items-list');
    if (container) {
        container.innerHTML = '';
        let subtotal = 0;
        cartItems.forEach(item => {
            const deal = DEALS.find(d => d.id === item.dealId);
            if (!deal) return;
            let price = deal.discountedPrice;
            let title = deal.title;
            if (item.optionId && deal.options) {
                const opt = deal.options.find(o => o.id === item.optionId);
                if (opt) { price = opt.discountedPrice; title = `${deal.title} - ${opt.title}`; }
            }
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            container.innerHTML += `
                <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
                    <img src="${deal.image}" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${title}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Qty: ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 700;">₹${itemTotal}</div>
                </div>`;
        });
        document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
        document.getElementById('summary-total').textContent = `₹${subtotal + 20}`;
    }
}

// 1. User clicks Pay
window.placeOrder = function () {
    const btn = event.currentTarget || document.querySelector('.btn-primary');

    if (!selectedPaymentMethod) { alert('Please select a payment method'); return; }

    // Validate Card Inputs if Card
    if (selectedPaymentMethod === 'card') {
        const inputs = document.querySelectorAll('#card-form input');
        let valid = true;
        inputs.forEach(i => { if (!i.value) valid = false; });
        if (!valid && inputs.length > 0) {
            alert('Please fill in card details (Simulated)');
            // return; // Uncomment to enforce
        }
    }

    // Trigger Verification UI
    if (selectedPaymentMethod === 'card') {
        openOtpModal();
    } else if (selectedPaymentMethod === 'upi') {
        startUpiVerification();
    } else {
        // Wallet - Instant
        finalizeTransaction(selectedPaymentMethod);
    }
};

// --- CARD FLOW ---
function openOtpModal() {
    const modal = document.getElementById('otp-modal');
    const input = document.getElementById('otp-input');
    const error = document.getElementById('otp-error');
    if (modal) {
        modal.style.display = 'flex';
        input.value = '';
        error.style.display = 'none';
        input.focus();
    }
}

window.closeOtpModal = function () {
    document.getElementById('otp-modal').style.display = 'none';
};

window.verifyOtp = function () {
    const input = document.getElementById('otp-input');
    const error = document.getElementById('otp-error');

    // Simulate Verification
    if (input.value === '1234') {
        closeOtpModal();
        finalizeTransaction('card');
    } else {
        error.style.display = 'block';
        error.textContent = 'Invalid OTP. Please try 1234.';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
};

// --- UPI FLOW ---
function startUpiVerification() {
    const modal = document.getElementById('upi-modal');
    modal.style.display = 'flex';

    // Simulate polling for payment confirmation
    let checks = 0;
    const interval = setInterval(() => {
        checks++;
        if (checks > 2) { // 3rd check succeeds (approx 3-4 seconds)
            clearInterval(interval);
            modal.style.display = 'none';
            finalizeTransaction('upi');
        }
    }, 1500);
}

// --- FINALIZATION ---
async function finalizeTransaction(method) {
    // Show global processing spinner if needed, or redirect
    const user = auth.getSession();
    const cartItems = cart.getCart();
    const subtotal = parseFloat(document.getElementById('summary-subtotal').textContent.replace('₹', ''));
    const total = subtotal + 20;

    const order = {
        id: 'ORD-' + Date.now() + Math.floor(Math.random() * 1000),
        userId: user.email,
        date: new Date().toISOString(),
        items: cartItems,
        amount: total,
        status: 'Paid',
        payment: {
            transactionId: 'TXN-' + Date.now(),
            method: method,
            paidAt: new Date().toISOString()
        }
    };

    // Save
    let allOrders = JSON.parse(localStorage.getItem('coupong_orders_' + user.email) || '[]');
    allOrders.unshift(order);
    localStorage.setItem('coupong_orders_' + user.email, JSON.stringify(allOrders));

    // Clear
    cart.clearCart();

    // Redirect
    window.location.href = `order-confirmation.html?orderId=${order.id}&verified=true`;
}
