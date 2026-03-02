/* =========================================
   Enhanced Search & Location System
   ========================================= */

const APP_STATE = {
    city: null,      // Full City Object
    locality: null,  // String Name
    searchQuery: ''
};

let GLOBAL_DEALS = []; // Unified List

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupEnhancedSearch();
    loadAllDeals(); // New Unified Loader
    renderDeals(GLOBAL_DEALS); // Initial Render using GLOBAL_DEALS
    setupStickyNav();
    setupMobileMenu();
    setupMap();
    updateNavAuth(); // Check User Session
}

function updateNavAuth() {
    const user = typeof auth !== 'undefined' ? auth.getSession() : null;
    const navActions = document.querySelector('.nav-actions');

    // We expect navActions to contain the Login/Signup buttons
    // We will dynamically replace them if user is logged in
    // We will dynamically replace them if user is logged in
    // We will dynamically replace them if user is logged in
    if (user && navActions) {
        const avatarHtml = user.photo
            ? `<img src="${user.photo}" alt="Profile">`
            : `<i class="ph-fill ph-user"></i>`;

        navActions.innerHTML = `
            <a href="index.html" class="btn btn-secondary mobile-only" style="display:none;">Home</a>
            <div class="profile-dropdown-container">
                <div class="profile-trigger" onclick="toggleProfileMenu(event)">
                    ${avatarHtml}
                    <span class="profile-trigger-name">${user.name.split(' ')[0]}</span>
                    <i class="ph-fill ph-caret-down"></i>
                </div>
                
                <div class="profile-menu" id="nav-profile-menu">
                    <div class="profile-menu-header">
                        <strong>${user.name}</strong>
                        <small>${user.email}</small>
                    </div>
                    <div class="profile-menu-body">
                        <a href="profile.html" class="profile-menu-item">
                            <i class="ph-fill ph-user-circle"></i> My Profile
                        </a>
                        <div class="profile-menu-divider"></div>
                        <button onclick="auth.logout()" class="profile-menu-item danger">
                            <i class="ph-fill ph-sign-out"></i> Log Out
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// --- Data Loader ---
function loadAllDeals() {
    // 1. Get Static Deals
    const staticDeals = typeof DEALS !== 'undefined' ? DEALS : [];

    // 2. Get Dynamic Coupons from DB
    let dynamicCoupons = [];
    if (typeof getAllCoupons === 'function') {
        dynamicCoupons = getAllCoupons();
    }

    // 3. Normalize Dynamic Coupons to Match App Structure
    const normalizedDynamic = dynamicCoupons.map(c => ({
        id: c.id,
        // Dynamic flag to differentiate handling later
        isDynamic: true,

        // Deal Props
        title: c.title,
        description: c.short_description,
        category: c.category,
        image: c.primary_image || 'https://via.placeholder.com/400x300',

        // Pricing Logic
        discountPercentage: c.discount_type === 'percentage' ? c.discount_value : 0,
        discountedPrice: c.discount_type === 'fixed' ? `Save ₹${c.discount_value}` : 'Special Offer',
        originalPrice: null, // Often not applicable for generic coupons

        expiryDate: c.expires_on,

        // Store/Vendor Props embedded directly
        vendorName: c.vendor_name,
        city: c.city,
        locality: c.locality,
        rating: c.rating || 4.5,
        storeLogo: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.vendor_name) + '&background=random',

        // Map Props (Approximate if real coords missing)
        storeLat: 18.5204, // Default to Pune center if missing
        storeLng: 73.8567
    }));

    // 4. Merge
    GLOBAL_DEALS = [...normalizedDynamic, ...staticDeals];
    console.log('✅ Loaded Deals:', GLOBAL_DEALS.length, '(Dynamic:', normalizedDynamic.length, ')');
}

// Global Dropdown Logic
window.toggleProfileMenu = function (e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('nav-profile-menu');
    const trigger = e ? e.currentTarget : document.querySelector('.profile-trigger');

    if (menu) {
        const isActive = menu.classList.contains('active');
        closeAllDropdowns();

        if (!isActive) {
            menu.classList.add('active');
            if (trigger) trigger.classList.add('active');
        }
    }
};

function closeAllDropdowns() {
    document.querySelectorAll('.profile-menu').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.profile-trigger').forEach(el => el.classList.remove('active'));
}

document.addEventListener('click', () => {
    closeAllDropdowns();
});

function setupEnhancedSearch() {
    const cityInput = document.getElementById('city-input');
    const cityDropdown = document.getElementById('city-suggestions');

    const localityGroup = document.getElementById('locality-group');
    const localityInput = document.getElementById('locality-input');
    const localityDropdown = document.getElementById('locality-suggestions');

    const keywordGroup = document.getElementById('keyword-group');
    const keywordInput = document.getElementById('hero-search-input');

    const searchBtn = document.getElementById('hero-search-btn');
    const searchContainer = document.querySelector('.hero-search-container');

    // Initial Text State
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = "Find deals near you";

    /* --- Flow Logic Helpers --- */
    function updateHeroText(step) {
        const subtitle = document.querySelector('.hero-subtitle');
        if (!subtitle) return;

        switch (step) {
            case 1:
                subtitle.textContent = "Find deals near you"; // Start
                break;
            case 2:
                subtitle.textContent = "Select your area"; // After city
                break;
            case 3:
                subtitle.textContent = "Search for deals"; // After locality
                break;
        }
    }

    function enableLocality() {
        searchContainer.classList.add('step-2');
        localityGroup.classList.add('visible');
        localityInput.disabled = false;
        localityInput.placeholder = "Search locality..."; // More active placeholder
        setTimeout(() => localityInput.focus(), 300);
        disableKeyword();
        updateHeroText(2);
    }

    function disableLocality() {
        localityInput.value = '';
        localityInput.disabled = true;
        localityGroup.classList.remove('visible');
        searchContainer.classList.remove('step-2');
        APP_STATE.locality = null;
        disableKeyword();
        updateHeroText(1);
    }

    function enableKeyword() {
        searchContainer.classList.add('step-3');
        keywordGroup.classList.add('visible');
        keywordInput.disabled = false;
        setTimeout(() => keywordInput.focus(), 300);
        updateHeroText(3);
    }

    function disableKeyword() {
        keywordInput.value = '';
        keywordInput.disabled = true;
        keywordGroup.classList.remove('visible');
        searchContainer.classList.remove('step-3');
        APP_STATE.searchQuery = '';
        if (APP_STATE.locality) updateHeroText(2); // Revert to step 2 text if just keyword disabled
        else if (APP_STATE.city) updateHeroText(2);
    }

    /* --- City Logic --- */
    let currentCityFocus = -1;

    cityInput.addEventListener('focus', () => {
        if (!cityInput.value) renderCitySuggestions(CITIES, true);
    });

    cityInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const matches = CITIES.filter(c => c.name.toLowerCase().includes(val));
        currentCityFocus = -1;
        renderCitySuggestions(matches);

        // Reset flow if cleared or changed significantly
        // Ideally strict selection is better, but soft check:
        const exactMatch = CITIES.find(c => c.name.toLowerCase() === val);
        if (!exactMatch) {
            disableLocality(); // Input changed, invalidate downstream
        }
    });

    cityInput.addEventListener('keydown', (e) => {
        const items = cityDropdown.getElementsByClassName('suggestion-item');
        if (e.key === 'ArrowDown') {
            currentCityFocus++;
            addActive(items);
        } else if (e.key === 'ArrowUp') {
            currentCityFocus--;
            addActive(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentCityFocus > -1) {
                if (items[currentCityFocus]) items[currentCityFocus].click();
            } else if (items.length > 0) {
                items[0].click(); // Select top if enter pressed
            }
        }
    });

    function selectCity(city) {
        APP_STATE.city = city;
        cityInput.value = city.name;
        cityDropdown.classList.remove('active');

        // Reset Locality when city changes
        localityInput.value = '';
        APP_STATE.locality = null;

        enableLocality();
        runGlobalFilter(); // Immediate update
    }

    /* --- Locality Logic --- */
    let currentLocalityFocus = -1;

    localityInput.addEventListener('focus', () => {
        if (APP_STATE.city) renderLocalitySuggestions(APP_STATE.city.localities);
    });

    localityInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if (!APP_STATE.city) return;

        const matches = APP_STATE.city.localities.filter(l => l.toLowerCase().includes(val));
        currentLocalityFocus = -1;
        renderLocalitySuggestions(matches);

        const exactMatch = APP_STATE.city.localities.find(l => l.toLowerCase() === val);
        if (!exactMatch) {
            disableKeyword();
        }
    });

    localityInput.addEventListener('keydown', (e) => {
        const items = localityDropdown.getElementsByClassName('suggestion-item');
        if (e.key === 'ArrowDown') {
            currentLocalityFocus++;
            addActiveLocality(items);
        } else if (e.key === 'ArrowUp') {
            currentLocalityFocus--;
            addActiveLocality(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentLocalityFocus > -1) {
                if (items[currentLocalityFocus]) items[currentLocalityFocus].click();
            } else if (items.length > 0 && localityInput.value) {
                // Try to match current input if no dropdown selection
                items[0].click();
            }
        }
    });

    function selectLocality(locName) {
        APP_STATE.locality = locName;
        localityInput.value = locName;
        localityDropdown.classList.remove('active');
        enableKeyword();
        runGlobalFilter(); // Immediate update
    }

    /* --- Keyword Logic --- */
    const keywordDropdown = document.getElementById('keyword-suggestions');

    // Popular Keywords for Suggestions
    const POPULAR_KEYWORDS = [
        'Pizza', 'Spa', 'Salon', 'Gym', 'Chinese', 'Biryani', 'Massage', 'Buffet',
        'Burger', 'Coffee', 'Bowling', 'Hotel'
    ];

    keywordInput.addEventListener('focus', () => {
        // Show categories if empty, or history? Let's show categories + popular
        if (!keywordInput.value) renderKeywordSuggestions(CATEGORIES, POPULAR_KEYWORDS);
    });

    keywordInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if (!val) {
            renderKeywordSuggestions(CATEGORIES, POPULAR_KEYWORDS);
            return;
        }

        // Filter Categories
        const catMatches = CATEGORIES.filter(c => c.name.toLowerCase().includes(val));
        // Filter Keywords
        const keyMatches = POPULAR_KEYWORDS.filter(k => k.toLowerCase().includes(val));

        renderKeywordSuggestions(catMatches, keyMatches, val);
    });

    keywordInput.addEventListener('keydown', (e) => {
        // Simple enter handling for now, arrow keys could be added similar to others
        if (e.key === 'Enter') {
            APP_STATE.searchQuery = keywordInput.value.trim();
            keywordDropdown.classList.remove('active');
            runGlobalFilter(true);
        }
    });

    function selectKeyword(term) {
        keywordInput.value = term;
        APP_STATE.searchQuery = term;
        keywordDropdown.classList.remove('active');
        runGlobalFilter(true);
    }

    function renderKeywordSuggestions(cats, keys, query = '') {
        keywordDropdown.innerHTML = '';
        const hasContent = (cats.length > 0 || keys.length > 0);

        if (!hasContent) {
            keywordDropdown.classList.remove('active');
            return;
        }

        // Header for Categories
        if (cats.length > 0) {
            const head = document.createElement('div');
            head.textContent = 'Categories';
            head.style.cssText = 'padding: 8px 15px; font-size: 0.75rem; color: var(--text-light); font-weight: 600; background: var(--surface-color);';
            keywordDropdown.appendChild(head);

            cats.forEach(c => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `<i class="ph ${c.icon}"></i> ${c.name}`;
                item.onclick = (e) => { e.stopPropagation(); selectKeyword(c.name); };
                keywordDropdown.appendChild(item);
            });
        }

        // Header for Keywords
        if (keys.length > 0) {
            const head = document.createElement('div');
            head.textContent = 'Popular Searches';
            head.style.cssText = 'padding: 8px 15px; font-size: 0.75rem; color: var(--text-light); font-weight: 600; background: var(--surface-color); border-top: 1px solid var(--border-color);';
            keywordDropdown.appendChild(head);

            keys.forEach(k => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `<i class="ph ph-magnifying-glass"></i> ${k}`;
                item.onclick = (e) => { e.stopPropagation(); selectKeyword(k); };
                keywordDropdown.appendChild(item);
            });
        }

        keywordDropdown.classList.add('active');
        checkDropdownPosition(keywordDropdown, keywordInput);
    }

    /* --- Search Button --- */
    searchBtn.addEventListener('click', () => {
        APP_STATE.searchQuery = keywordInput.value.trim();
        // Also capture current values if user typed but didn't click dropdown
        // (Simplified for now, forcing selection via dropdowns ensures valid data)
        runGlobalFilter(true);
    });

    /* --- Helper Renderers --- */
    function renderCitySuggestions(list) {
        cityDropdown.innerHTML = '';
        if (list.length === 0) {
            cityDropdown.classList.remove('active');
            return;
        }
        // Re-implementing correctly:
        list.forEach(city => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<i class="ph ph-buildings"></i> ${city.name}`;
            item.onclick = (e) => { e.stopPropagation(); selectCity(city); };
            cityDropdown.appendChild(item);
        });
        cityDropdown.classList.add('active');
        checkDropdownPosition(cityDropdown, cityInput);
    }

    function renderLocalitySuggestions(list) {
        localityDropdown.innerHTML = '';

        // Handle "No localities found" or just empty list from filter
        // If list is empty but input has value, show "No results". 
        // If input empty, we show all (which app.js logic does).

        if (list.length === 0) {
            // Check if user has typed something
            if (localityInput.value.trim() !== '') {
                const noRes = document.createElement('div');
                noRes.className = 'suggestion-item';
                noRes.style.cursor = 'default';
                noRes.style.color = 'var(--text-light)';
                noRes.innerHTML = `<i class="ph ph-warning-circle"></i> No localities found`;
                localityDropdown.appendChild(noRes);
                localityDropdown.classList.add('active');
            } else {
                localityDropdown.classList.remove('active');
            }
            return;
        }

        // Add Header
        const header = document.createElement('div');
        header.textContent = 'Suggested Localities';
        header.style.cssText = 'padding: 8px 15px; font-size: 0.75rem; color: var(--text-light); font-weight: 600; letter-spacing: 0.5px; background: var(--surface-color); border-bottom: 1px solid var(--border-color);';
        localityDropdown.appendChild(header);

        list.forEach(loc => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<i class="ph ph-map-pin"></i> ${loc}`;
            item.onclick = (e) => { e.stopPropagation(); selectLocality(loc); };
            localityDropdown.appendChild(item);
        });
        localityDropdown.classList.add('active');
        checkDropdownPosition(localityDropdown, localityInput);
    }

    function checkDropdownPosition(dropdown, input) {
        // Reset to default CSS state first
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.transform = '';

        const rect = dropdown.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.top;
        const reqHeight = Math.min(rect.height, 320); // Max height defined in CSS

        // If not enough space below AND plenty of space above
        if (spaceBelow < reqHeight && rect.top > reqHeight + 100) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = '100%';
            dropdown.style.marginBottom = '12px'; // Add space for flip
            dropdown.style.transformOrigin = 'bottom left';
        }
    }

    // Keyboard Nav Helpers
    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentCityFocus >= items.length) currentCityFocus = 0;
        if (currentCityFocus < 0) currentCityFocus = (items.length - 1);
        items[currentCityFocus].classList.add('suggestion-active');
        items[currentCityFocus].scrollIntoView({ block: 'nearest', inline: 'start' });
    }
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) items[i].classList.remove('suggestion-active');
    }
    function addActiveLocality(items) {
        if (!items) return false;
        removeActiveLocality(items);
        if (currentLocalityFocus >= items.length) currentLocalityFocus = 0;
        if (currentLocalityFocus < 0) currentLocalityFocus = (items.length - 1);
        items[currentLocalityFocus].classList.add('suggestion-active');
        items[currentLocalityFocus].scrollIntoView({ block: 'nearest', inline: 'start' });
    }
    function removeActiveLocality(items) {
        for (let i = 0; i < items.length; i++) items[i].classList.remove('suggestion-active');
    }

    // Click Outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.group-location')) cityDropdown.classList.remove('active');
        if (!e.target.closest('.group-locality')) localityDropdown.classList.remove('active');
        if (!e.target.closest('.group-keyword') && keywordDropdown) keywordDropdown.classList.remove('active');
    });
}

function runGlobalFilter(shouldScroll = false) {
    const { city, locality, searchQuery } = APP_STATE;
    const lowerQ = searchQuery ? searchQuery.toLowerCase() : '';

    const filtered = GLOBAL_DEALS.filter(deal => {
        let store = {};

        // Helper to get store info whether static or dynamic
        if (deal.isDynamic) {
            store = {
                name: deal.vendorName,
                city: deal.city,
                locality: deal.locality
            };
        } else {
            store = STORES.find(s => s.id === deal.storeId) || {};
        }

        // 1. City Filter
        if (city && store.city !== city.name) return false;

        // 2. Locality Filter
        if (locality && store.locality !== locality) return false;

        // 3. Keyword Filter
        if (lowerQ) {
            const inTitle = deal.title.toLowerCase().includes(lowerQ);
            const inDesc = deal.description.toLowerCase().includes(lowerQ);
            const inStore = store.name.toLowerCase().includes(lowerQ);
            const inCat = deal.category.toLowerCase().includes(lowerQ);
            if (!(inTitle || inDesc || inStore || inCat)) return false;
        }

        return true;
    });

    renderDeals(filtered);
    updateMap(filtered);

    // Scroll only if explicitly requested
    if (shouldScroll) {
        const grid = document.getElementById('deal-grid');
        if (grid) {
            const top = grid.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
}

/* =========================================
   UI Renderers (Reused & Updated)
   ========================================= */

function renderDeals(deals) {
    const grid = document.getElementById('deal-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Header Update
    const secHeader = document.querySelector('.section-title');
    if (secHeader) {
        let locText = 'Near You';
        if (APP_STATE.city) locText = `in ${APP_STATE.city.name}`;
        if (APP_STATE.locality) locText = `in ${APP_STATE.locality}, ${APP_STATE.city.name}`;
        secHeader.textContent = `Deals ${locText}`;
    }

    if (deals.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-light);">
                <h3>No deals found here yet.</h3>
                <p>Try searching "Pune" or "Bangalore" to see demo data.</p>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="runGlobalFilter(false)" style="margin-right: 0.5rem;">Reset Filter</button>
                    <button class="btn btn-primary" onclick="window.location.reload()">View All Deals</button>
                </div>
            </div>
        `;
        return;
    }

    const user = auth.getSession();
    const isMember = user && (user.membershipTier === 'plus' || user.membershipTier === 'premium');

    deals.forEach((deal, idx) => {
        // Resolve Store Info
        let store = {};
        if (deal.isDynamic) {
            store = {
                id: 'dynamic-' + deal.id,
                name: deal.vendorName,
                city: deal.city,
                locality: deal.locality,
                logo: deal.storeLogo,
                lat: deal.storeLat,
                lng: deal.storeLng
            };
        } else {
            store = STORES.find(s => s.id === deal.storeId) || {};
        }

        let cardContent = '';
        let cardClass = 'deal-card fade-in';
        let clickAction = `href="deal.html?id=${deal.id}"`;
        let badge = `<div class="discount-badge">${deal.discountPercentage}% OFF</div>`;
        let overlay = '';

        if (deal.membersOnly) {
            if (!isMember) {
                cardClass += ' locked';
                clickAction = `onclick="window.location.href='membership.html'" style="cursor: pointer;"`;
                overlay = `
                    <div class="locked-overlay">
                        <i class="ph-fill ph-lock-key"></i>
                        <span>Members Only</span>
                    </div>
                `;
                badge = `<div class="discount-badge" style="background: linear-gradient(135deg, #FFB30F, #FF5A1F);"><i class="ph-fill ph-crown"></i> Exclusive</div>`;
            } else {
                badge = `<div class="discount-badge" style="background: linear-gradient(135deg, #FFB30F, #FF5A1F);"><i class="ph-fill ph-crown"></i> Member Deal</div>`;
            }
        }

        const card = document.createElement('div');
        card.className = cardClass;
        card.style.animationDelay = `${idx * 50}ms`;

        // CSS for locked card
        if (deal.membersOnly && !isMember) {
            card.style.position = 'relative';
            card.innerHTML = `
                ${overlay}
                <div class="deal-image-wrapper" style="filter: blur(2px);">
                    <img src="${deal.image}" alt="${deal.title}" class="deal-image" loading="lazy">
                    ${badge}
                </div>
                <div class="deal-content" style="opacity: 0.6;">
                    <div class="store-info">
                        <img src="${store.logo}" class="store-logo">
                        <div>
                            <div class="store-name">${store.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-light);">${store.locality}, ${store.city}</div>
                        </div>
                    </div>
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-footer">
                        <span class="active-price">₹${deal.discountedPrice}</span>
                        <a href="membership.html" class="btn btn-primary" style="background: var(--text-primary);">Unlock</a>
                    </div>
                </div>
            `;
        } else {
            // Normal or Unlocked Member Deal
            card.innerHTML = `
                <div class="deal-image-wrapper">
                    <img src="${deal.image}" alt="${deal.title}" class="deal-image" loading="lazy">
                    ${badge}
                </div>
                <div class="deal-content">
                    <div class="store-info">
                        <img src="${store.logo}" class="store-logo">
                        <div>
                            <div class="store-name">${store.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-light);">${store.locality}, ${store.city}</div>
                        </div>
                    </div>
                    <h3 class="deal-title">${deal.title}</h3>
                    <div class="deal-footer">
                        <span class="active-price">₹${deal.discountedPrice}</span>
                        <a ${clickAction} class="btn view-btn">View</a>
                    </div>
                </div>
            `;
        }

        grid.appendChild(card);
    });
}

function updateMap(deals) {
    // Requires mapInstance from global scope or re-init
    // For this simple impl, we assume mapInstance exists or we grab container
    const mapContainer = document.getElementById('main-map');
    if (!mapContainer || typeof L === 'undefined') return;

    // We need to access the existing map instance properly. 
    // Ideally mapInstance is global. Let's assume re-init safety.
    /* ... (Simple map update logic reserved for brevity) ... */
    // Since we are rewriting file, let's include basic map logic:
    if (!window.mapInstance) {
        window.mapInstance = L.map('main-map').setView([20.59, 78.96], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window.mapInstance);
    }

    // Clear layers
    if (window.markers) window.markers.forEach(m => window.mapInstance.removeLayer(m));
    window.markers = [];

    // Add new
    deals.forEach(d => {
        let s = {};
        if (d.isDynamic) {
            s = {
                name: d.vendorName,
                locality: d.locality,
                lat: d.storeLat,
                lng: d.storeLng
            };
        } else {
            s = STORES.find(x => x.id === d.storeId);
        }

        if (s && s.lat) {
            const m = L.marker([s.lat, s.lng]).addTo(window.mapInstance)
                .bindPopup(`<b>${s.name}</b><br>${s.locality}`);
            window.markers.push(m);
        }
    });

    // Center Map
    if (APP_STATE.city) window.mapInstance.setView([APP_STATE.city.lat, APP_STATE.city.lng], 12);
    else if (deals.length > 0) {
        const s = STORES.find(x => x.id === deals[0].storeId);
        if (s) window.mapInstance.setView([s.lat, s.lng], 5);
    }
}

function resetAll() {
    window.location.reload();
}

function setupStickyNav() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
}

function setupMobileMenu() { /* ... kept simple ... */ }
function setupMap() { /* ... handled in updateMap ... */ }
