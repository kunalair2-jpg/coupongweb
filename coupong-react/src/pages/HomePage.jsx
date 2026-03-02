import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DealCard from '../components/DealCard';
import { DEALS, STORES, CITIES, CATEGORIES, POPULAR_KEYWORDS } from '../data/data';
import { couponsAPI } from '../utils/api';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/** Map a MongoDB coupon → DealCard shape */
function mapApiCoupon(c) {
    return {
        id: c._id,
        isDynamic: true,
        fromApi: true,
        title: c.title,
        description: c.shortDescription || c.description || '',
        category: c.category,
        image: c.primaryImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
        discountPercentage: c.discountType === 'percentage' ? c.discountValue : 0,
        discountedPrice: c.discountType === 'fixed'
            ? (c.discountedPrice ? `₹${c.discountedPrice}` : `Save ₹${c.discountValue}`)
            : `${c.discountValue}% OFF`,
        originalPrice: c.originalPrice || null,
        expiryDate: c.expiresOn,
        vendorName: c.vendorName || 'Local Vendor',
        city: c.city || '',
        locality: c.locality || '',
        rating: c.rating || 4.5,
        storeLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.vendorName || 'V')}&background=FF6B35&color=fff`,
        storeLat: c.lat || 18.5204,
        storeLng: c.lng || 73.8567,
        soldCount: c.soldCount || 0,
        membersOnly: c.membersOnly || false,
    };
}

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ── State declarations ─────────────────────────────────────────
    const [apiDeals, setApiDeals] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedLocality, setSelectedLocality] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '');
    const [cityInput, setCityInput] = useState('');
    const [cityDropdown, setCityDropdown] = useState([]);
    const [localityDropdown, setLocalityDropdown] = useState([]);
    const [kwDropdown, setKwDropdown] = useState(false);
    const cityRef = useRef(null);
    const locRef = useRef(null);

    // ── Fetch live coupons from backend API ────────────────────────
    useEffect(() => {
        let cancelled = false;
        async function fetchCoupons() {
            setApiLoading(true);
            try {
                const data = await couponsAPI.getAll({ limit: 200 });
                if (!cancelled) {
                    setApiDeals((data.coupons || []).map(mapApiCoupon));
                }
            } catch (e) {
                console.warn('API unavailable, using static deals:', e.message);
            } finally {
                if (!cancelled) setApiLoading(false);
            }
        }
        fetchCoupons();
        const interval = setInterval(fetchCoupons, 10000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    // Sync category from URL
    useEffect(() => { setActiveCategory(searchParams.get('cat') || ''); }, [searchParams]);

    // ── Derived data (allDeals MUST come before filteredDeals) ─────
    const allDeals = useMemo(() => {
        const seen = new Set(apiDeals.map(d => d.id));
        return [...apiDeals, ...DEALS.filter(d => !seen.has(d.id))];
    }, [apiDeals]);

    const filteredDeals = useMemo(() => {
        let list = allDeals;
        if (activeCategory) list = list.filter(d => d.category === activeCategory);
        if (selectedCity) {
            list = list.filter(d => {
                const store = d.isDynamic ? { city: d.city } : STORES.find(s => s.id === d.storeId) || {};
                return store.city === selectedCity.name;
            });
        }
        if (selectedLocality) {
            list = list.filter(d => {
                const store = d.isDynamic ? { locality: d.locality } : STORES.find(s => s.id === d.storeId) || {};
                return store.locality === selectedLocality;
            });
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(d => {
                const store = d.isDynamic ? { name: d.vendorName } : STORES.find(s => s.id === d.storeId) || {};
                return d.title.toLowerCase().includes(q)
                    || (d.description || '').toLowerCase().includes(q)
                    || (store.name || '').toLowerCase().includes(q)
                    || d.category.toLowerCase().includes(q);
            });
        }
        return list;
    }, [allDeals, activeCategory, selectedCity, selectedLocality, searchQuery]);

    const mapDeals = filteredDeals.slice(0, 20);

    // ── Handlers ──────────────────────────────────────────────────
    const handleCityInput = (val) => {
        setCityInput(val);
        setCityDropdown(val.trim() ? CITIES.filter(c => c.name.toLowerCase().includes(val.toLowerCase())) : CITIES);
        if (!CITIES.find(c => c.name.toLowerCase() === val.toLowerCase())) {
            setSelectedCity(null);
            setSelectedLocality('');
        }
    };
    const selectCity = (city) => { setSelectedCity(city); setCityInput(city.name); setCityDropdown([]); setSelectedLocality(''); };
    const selectLocality = (loc) => { setSelectedLocality(loc); setLocalityDropdown([]); };

    const sectionTitle = selectedLocality
        ? `Deals in ${selectedLocality}, ${selectedCity?.name}`
        : selectedCity ? `Deals in ${selectedCity.name}` : 'Trending Near You';

    // ── RENDER ────────────────────────────────────────────────────
    return (
        <div className="pt-28">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-16 pt-10">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6B3520 0%, transparent 50%), radial-gradient(circle at 80% 20%, #EC489920 0%, transparent 50%)' }} />
                <div className="max-w-4xl mx-auto px-4 text-center relative">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 animate-pulse-soft">
                        🔥 1000+ Deals Updated Daily
                    </div>
                    <h1 className="font-display font-extrabold text-5xl md:text-6xl text-gray-900 mb-4 leading-tight">
                        Discover the Best<br />
                        <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            Deals Around You
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg mb-10">Save up to 80% on dining, wellness, and local experiences.</p>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                        {/* City */}
                        <div className="relative flex-1">
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-text" onClick={() => { setCityDropdown(CITIES); cityRef.current?.focus(); }}>
                                <span className="text-orange-500">📍</span>
                                <input
                                    ref={cityRef}
                                    type="text"
                                    placeholder="Select City"
                                    value={cityInput}
                                    onChange={e => handleCityInput(e.target.value)}
                                    onFocus={() => setCityDropdown(cityInput ? CITIES.filter(c => c.name.toLowerCase().includes(cityInput.toLowerCase())) : CITIES)}
                                    onBlur={() => setTimeout(() => setCityDropdown([]), 200)}
                                    className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm font-medium"
                                />
                            </div>
                            {cityDropdown.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-52 overflow-y-auto">
                                    {cityDropdown.map(city => (
                                        <button key={city.id} onMouseDown={() => selectCity(city)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                                            🏙️ {city.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Locality */}
                        {selectedCity && (
                            <div className="relative flex-1">
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-text" onClick={() => { setLocalityDropdown(selectedCity.localities); locRef.current?.focus(); }}>
                                    <span className="text-blue-500">🗺️</span>
                                    <input
                                        ref={locRef}
                                        type="text"
                                        placeholder="Select Locality"
                                        value={selectedLocality}
                                        onChange={e => { setSelectedLocality(e.target.value); setLocalityDropdown(selectedCity.localities.filter(l => l.toLowerCase().includes(e.target.value.toLowerCase()))); }}
                                        onFocus={() => setLocalityDropdown(selectedCity.localities)}
                                        onBlur={() => setTimeout(() => setLocalityDropdown([]), 200)}
                                        className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm font-medium"
                                    />
                                </div>
                                {localityDropdown.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-52 overflow-y-auto">
                                        {localityDropdown.map(loc => (
                                            <button key={loc} onMouseDown={() => selectLocality(loc)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                                                📌 {loc}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Keyword */}
                        <div className="relative flex-1">
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search 'pizza', 'spa'..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setKwDropdown(true); }}
                                    onFocus={() => setKwDropdown(true)}
                                    onBlur={() => setTimeout(() => setKwDropdown(false), 200)}
                                    className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm font-medium"
                                />
                            </div>
                            {kwDropdown && !searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-3">
                                    <p className="text-xs text-gray-400 font-semibold mb-2 px-1">POPULAR SEARCHES</p>
                                    <div className="flex flex-wrap gap-2">
                                        {POPULAR_KEYWORDS.map(kw => (
                                            <button key={kw} onMouseDown={() => { setSearchQuery(kw); setKwDropdown(false); }} className="text-xs bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                                                {kw}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { }}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all whitespace-nowrap"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category Filter Pills */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveCategory('')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${!activeCategory ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
                    >
                        🔥 All Deals
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id === activeCategory ? '' : cat.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Section Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="font-display font-bold text-3xl text-gray-900">{sectionTitle}</h2>
                        <p className="text-gray-500 mt-1">
                            {apiLoading
                                ? <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin inline-block" /> Loading live deals…</span>
                                : <>{filteredDeals.length} deals available {apiDeals.length > 0 && <span className="text-green-500 text-xs font-semibold ml-2">● {apiDeals.length} live from vendors</span>}</>}
                        </p>
                    </div>
                    {(selectedCity || activeCategory || searchQuery) && (
                        <button
                            onClick={() => { setSelectedCity(null); setSelectedLocality(''); setCityInput(''); setSearchQuery(''); setActiveCategory(''); setSearchParams({}); }}
                            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                        >
                            ✕ Clear filters
                        </button>
                    )}
                </div>

                {filteredDeals.length === 0 && !apiLoading ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <h3 className="font-display font-bold text-xl text-gray-700 mb-2">No deals found here yet</h3>
                        <p className="text-gray-400 mb-6">Try a different city or category.</p>
                        <button onClick={() => { setSelectedCity(null); setSelectedLocality(''); setCityInput(''); setSearchQuery(''); setActiveCategory(''); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold">
                            View All Deals
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDeals.map((deal, i) => (
                            <DealCard key={deal.id} deal={deal} index={i} />
                        ))}
                    </div>
                )}
            </section>

            {/* Map Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">Explore on Map</h2>
                <p className="text-gray-500 mb-6">Find deals within walking distance.</p>
                <div className="h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <MapContainer center={selectedCity ? [selectedCity.lat, selectedCity.lng] : [20.59, 78.96]} zoom={selectedCity ? 12 : 5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {mapDeals.map(deal => {
                            const store = deal.isDynamic
                                ? { name: deal.vendorName, locality: deal.locality, lat: deal.storeLat, lng: deal.storeLng }
                                : STORES.find(s => s.id === deal.storeId);
                            if (!store?.lat) return null;
                            return (
                                <Marker key={deal.id} position={[store.lat, store.lng]}>
                                    <Popup><b>{store.name}</b><br />{deal.title}<br />{deal.discountedPrice}</Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </section>

            {/* Popular Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">Popular Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm">{cat.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{DEALS.filter(d => d.category === cat.id).length}+ Deals</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }} />
                    <h2 className="font-display font-extrabold text-3xl mb-3 relative">Get Weekly Top Deals</h2>
                    <p className="text-white/80 text-lg mb-8 relative">Join 50,000+ others getting the best local offers.</p>
                    <div className="flex gap-3 max-w-md mx-auto relative">
                        <input type="email" placeholder="Your email address" className="flex-1 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-5 py-3 outline-none focus:bg-white/30 transition-colors" />
                        <button className="bg-white text-orange-500 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all">Subscribe</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
