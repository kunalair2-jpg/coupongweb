const cart = (() => {
    const STORAGE_KEY = 'coupong_cart';

    function getCart() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function saveCart(cartItems) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        updateCartCount();
    }

    function addItem(dealId, optionId = null, locationId = null, quantity = 1) {
        const currentCart = getCart();

        // Find if item already exists with matching options
        const existingItemIndex = currentCart.findIndex(item =>
            item.dealId === dealId &&
            item.optionId === optionId &&
            item.locationId === locationId
        );

        if (existingItemIndex > -1) {
            currentCart[existingItemIndex].quantity += quantity;
        } else {
            currentCart.push({
                dealId,
                optionId,
                locationId,
                quantity,
                addedAt: new Date().toISOString()
            });
        }

        saveCart(currentCart);
        return true;
    }

    function removeItem(index) {
        const currentCart = getCart();
        if (index >= 0 && index < currentCart.length) {
            currentCart.splice(index, 1);
            saveCart(currentCart);
        }
    }

    function updateQuantity(index, newQty) {
        const currentCart = getCart();
        if (index >= 0 && index < currentCart.length) {
            if (newQty <= 0) {
                currentCart.splice(index, 1);
            } else {
                currentCart[index].quantity = parseInt(newQty);
            }
            saveCart(currentCart);
        }
    }

    function clearCart() {
        localStorage.removeItem(STORAGE_KEY);
        updateCartCount();
    }

    function updateCartCount() {
        const currentCart = getCart();
        const count = currentCart.reduce((sum, item) => sum + item.quantity, 0);

        // Update UI Badge if it exists
        const badges = document.querySelectorAll('.cart-count-badge');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Initialize count on load
    document.addEventListener('DOMContentLoaded', updateCartCount);

    return {
        getCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        updateCartCount
    };
})();
