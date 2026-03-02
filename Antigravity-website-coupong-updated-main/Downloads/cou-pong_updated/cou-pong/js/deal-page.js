/* =========================================
   Deal Page Logic (Enhanced)
   ========================================= */

let currentDeal = null;
let currentStore = null;
let selectedOption = null;
let selectedLocation = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const dealId = params.get('id');
        const deal = DEALS.find(d => d.id === dealId);

        if (!deal) {
            document.body.innerHTML = '<div class="container" style="padding-top: 5rem; text-align: center;"><h1>Deal Not Found</h1><p>We could not find the deal you are looking for.</p><a href="index.html" class="btn btn-primary">Go Home</a></div>';
            return;
        }

        currentDeal = deal;
        const store = STORES.find(s => s.id === deal.storeId);

        if (!store) {
            console.error('Store not found for deal:', dealId);
            document.body.innerHTML = '<div class="container" style="padding-top: 5rem; text-align: center;"><h1>Store Not Found</h1><p>The store associated with this deal is missing.</p><a href="index.html" class="btn btn-primary">Go Home</a></div>';
            return;
        }
        currentStore = store;

        // Populate Basic Info
        document.title = `${deal.title} | Cou-pong`;
        document.getElementById('deal-title').textContent = deal.title;
        document.getElementById('deal-breadcrumb-title').textContent = deal.title;
        document.getElementById('deal-category').textContent = deal.category.charAt(0).toUpperCase() + deal.category.slice(1);
        document.getElementById('deal-image').src = deal.image;
        document.getElementById('deal-description').textContent = deal.description;
        document.getElementById('store-name').textContent = currentStore.name;
        document.getElementById('store-logo').src = currentStore.logo;
        document.getElementById('store-rating').textContent = '★' + currentStore.rating;

        // Mock Expiry
        const expiry = new Date(deal.expiryDate || Date.now() + 86400000);
        document.getElementById('deal-expiry').textContent = expiry.toLocaleDateString();

        // 1. Render Options
        renderOptions(deal);

        // 2. Render Locations
        renderLocations(deal);

        // 3. Render Map (Initial)
        if (currentStore.lat && currentStore.lng) {
            initMap(currentStore.lat, currentStore.lng, currentStore.name);
        }

        // 4. Render Recommended
        renderRecommended(deal.category);

        // Update Cart Count
        if (typeof cart !== 'undefined') cart.updateCartCount();

    } catch (err) {
        console.error('Error loading deal page:', err);
        document.body.innerHTML = `<div class="container" style="padding-top: 5rem; text-align: center;"><h1>Something went wrong</h1><p>${err.message}</p><a href="index.html" class="btn btn-primary">Go Home</a></div>`;
    }
});

function renderOptions(deal) {
    const container = document.getElementById('deal-options-container');
    container.innerHTML = '';

    let options = deal.options || [];

    // If no explicit options, create a default one from the main deal properties
    if (options.length === 0) {
        options = [{
            id: 'default',
            title: deal.title,
            originalPrice: deal.originalPrice,
            discountedPrice: deal.discountedPrice,
            discount: deal.discountPercentage,
            bought: deal.soldCount
        }];
    }

    options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = `deal-option-card ${index === 0 ? 'selected' : ''}`;
        div.onclick = () => selectOption(opt, div);

        div.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${opt.title}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                    <span style="text-decoration: line-through; margin-right: 0.5rem;">₹${opt.originalPrice}</span>
                    <span style="color: var(--primary-color); font-weight: 700;">₹${opt.discountedPrice}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--success-color); background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
                    ${opt.discount}% OFF
                </div>
            </div>
        `;
        container.appendChild(div);

        // Select first option by default
        if (index === 0) {
            selectOption(opt, div);
        }
    });
}

function selectOption(option, element) {
    selectedOption = option;

    // Update UI Selection
    document.querySelectorAll('.deal-option-card').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    // Update Price Display
    document.getElementById('final-original-price').textContent = `₹${option.originalPrice}`;
    document.getElementById('final-price').textContent = `₹${option.discountedPrice}`;
    document.getElementById('final-discount').textContent = `You Save ₹${option.originalPrice - option.discountedPrice} (${option.discount}%)`;
}

function renderLocations(deal) {
    const select = document.getElementById('deal-location-select');
    const container = document.getElementById('location-select-container');

    let locations = deal.locations || [];

    if (locations.length === 0) {
        // Use store location
        locations = [{
            name: currentStore.locality,
            address: currentStore.location || 'See map',
            phone: 'Not Available'
        }];
        // Hide dropdown if only 1 location (optional, but requested to show info)
        // If it's just the default store location, maybe hide the selector but show info below
        if (!deal.locations) {
            container.style.display = 'none'; // distinct from 'empty'
        }
    }

    select.innerHTML = '';
    locations.forEach((loc, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = loc.name;
        select.appendChild(opt);
    });

    // Handle change
    select.onchange = () => {
        const loc = locations[select.value];
        selectedLocation = loc;
        updateLocationDisplay(loc);
    };

    // Default Select
    if (locations.length > 0) {
        selectedLocation = locations[0];
        updateLocationDisplay(locations[0]);
    }
}

function updateLocationDisplay(loc) {
    document.getElementById('store-location-name').textContent = loc.name;
    document.getElementById('store-address').innerHTML = `<i class="ph-fill ph-map-pin"></i> ${loc.address}`;
    if (loc.phone) {
        document.getElementById('store-phone').innerHTML = `<i class="ph-fill ph-phone"></i> ${loc.phone}`;
        document.getElementById('store-phone').style.display = 'block';
    } else {
        document.getElementById('store-phone').style.display = 'none';
    }
}

function initMap(lat, lng, title) {
    const mapContainer = document.getElementById('detail-map');
    if (!mapContainer) return;

    // reset container
    mapContainer.innerHTML = '';

    const map = L.map('detail-map').setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(title).openPopup();
}

function addToCart() {
    if (!selectedOption) {
        alert('Please select an option');
        return;
    }

    // Add to cart
    cart.addItem(currentDeal.id, selectedOption.id, selectedLocation ? selectedLocation.name : null);

    // Feedback
    const btn = event.currentTarget; // crude way to get button
    const ogText = btn.innerHTML;
    btn.innerHTML = '<i class="ph-fill ph-check"></i> Added';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-success'); // Assuming exists or just turns green
    btn.style.background = 'var(--success-color)';
    btn.style.color = 'white';

    setTimeout(() => {
        btn.innerHTML = ogText;
        btn.style.background = ''; // reset
        btn.style.color = '';
        btn.classList.add('btn-secondary');
    }, 2000);
}

function buyNow() {
    addToCart();
    window.location.href = 'cart.html';
}

function toggleSaveDeal() {
    alert('Create account to save deals!');
}

function renderRecommended(category) {
    const container = document.getElementById('recommended-grid');
    // Filter deals by category, exclude current, logic...
    const recommended = DEALS.filter(d => d.category === category && d.id !== currentDeal.id).slice(0, 3);

    if (recommended.length === 0) {
        // Fallback to any 3 deals
        recommended.push(...DEALS.filter(d => d.id !== currentDeal.id).slice(0, 3));
    }

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
