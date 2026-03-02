import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

import VendorToast from '../components/vendor/VendorToast';
import { useToast } from '../components/vendor/useToast';
import VendorCouponForm, { EMPTY_FORM } from '../components/vendor/VendorCouponForm';
import VendorCouponTable from '../components/vendor/VendorCouponTable';
import VendorAnalytics from '../components/vendor/VendorAnalytics';
import { DetailModal, DeleteModal } from '../components/vendor/VendorModals';
import { couponsAPI, vendorsAPI, ordersAPI } from '../utils/api';

const TABS = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'coupons', icon: '🎟️', label: 'My Coupons' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'activity', icon: '🔔', label: 'Activity' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
];

// ── Animated counter ──────────────────────────────────────────
function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        let start = 0;
        const step = Math.ceil(value / 30);
        const t = setInterval(() => { start += step; if (start >= value) { setDisplay(value); clearInterval(t); } else setDisplay(start); }, 30);
        return () => clearInterval(t);
    }, [value]);
    return <>{display.toLocaleString()}</>;
}

export default function VendorDashboard() {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const { user } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const { toasts, toast, dismiss } = useToast();

    const [tab, setTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalViews: 0, totalSold: 0 });
    const [orders, setOrders] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [detailCoupon, setDetailCoupon] = useState(null);
    const [deleteCoupon, setDeleteCoupon] = useState(null);
    const [profileForm, setProfileForm] = useState({ businessName: '', phone: '', city: '', category: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const prevCountRef = useRef(0);
    const autoRefreshRef = useRef(null);

    // ── Auth guard ────────────────────────────────────────────────
    useEffect(() => {
        if (isLoaded && !isSignedIn) navigate('/vendor-login', { replace: true });
    }, [isLoaded, isSignedIn]);

    // ── Keyboard shortcuts ────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            if (e.key === 'n' && !e.ctrlKey) { setTab('coupons'); openCreate(); }
            if (e.key === 'f') document.querySelector('input[placeholder*="Search"]')?.focus();
            if (e.key === 'Escape') { setFormOpen(false); setDetailCoupon(null); setDeleteCoupon(null); }
            if (e.key === '1') setTab('overview');
            if (e.key === '2') setTab('coupons');
            if (e.key === '3') setTab('analytics');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ── Load data ─────────────────────────────────────────────────
    const loadData = useCallback(async (silent = false) => {
        if (!isSignedIn) return;
        if (!silent) setLoading(true);
        try {
            const [myCoupons, vendorStats] = await Promise.allSettled([
                couponsAPI.getMyCoupons(getToken),
                vendorsAPI.getStats(getToken),
            ]);

            const newCoupons = myCoupons.status === 'fulfilled' ? (Array.isArray(myCoupons.value) ? myCoupons.value : []) : [];

            // Detect new coupons added from another session
            if (silent && prevCountRef.current > 0 && newCoupons.length > prevCountRef.current) {
                toast(`🎉 ${newCoupons.length - prevCountRef.current} new coupon(s) detected!`, 'info');
            }
            prevCountRef.current = newCoupons.length;
            setCoupons(newCoupons);

            if (vendorStats.status === 'fulfilled') setStats(vendorStats.value);
            else {
                // Compute stats from coupon list if endpoint unavailable
                setStats({
                    totalCoupons: newCoupons.length,
                    activeCoupons: newCoupons.filter(c => c.isActive).length,
                    totalViews: newCoupons.reduce((a, c) => a + (c.viewCount || 0), 0),
                    totalSold: newCoupons.reduce((a, c) => a + (c.soldCount || 0), 0),
                });
            }
        } catch (e) {
            if (!silent) toast('Failed to load data: ' + e.message, 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isSignedIn, getToken]);

    // Initial load
    useEffect(() => { if (isLoaded && isSignedIn) loadData(); }, [isLoaded, isSignedIn, loadData]);

    // Auto-refresh every 5s
    useEffect(() => {
        autoRefreshRef.current = setInterval(() => loadData(true), 5000);
        return () => clearInterval(autoRefreshRef.current);
    }, [loadData]);

    // Load orders when tab changes
    useEffect(() => {
        if (tab === 'orders' && isSignedIn) {
            ordersAPI.getVendorOrders(getToken).then(setOrders).catch(() => { });
        }
    }, [tab, isSignedIn]);

    // Profile form init
    useEffect(() => {
        if (user) {
            setProfileForm({
                businessName: user.publicMetadata?.businessName || '',
                phone: user.publicMetadata?.phone || '',
                city: user.publicMetadata?.city || '',
                category: user.publicMetadata?.category || '',
            });
        }
    }, [user]);

    // ── Coupon CRUD ───────────────────────────────────────────────
    const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setFormError(''); setFormOpen(true); };
    const openEdit = (c) => {
        setEditId(c._id);
        setForm({
            title: c.title || '', shortDescription: c.shortDescription || '', description: c.description || '',
            category: c.category || '', primaryImage: c.primaryImage || '',
            discountType: c.discountType || 'percentage', discountValue: c.discountValue || '',
            originalPrice: c.originalPrice || '', discountedPrice: c.discountedPrice || '',
            city: c.city || '', locality: c.locality || '',
            membersOnly: c.membersOnly || false,
            expiresOn: c.expiresOn ? c.expiresOn.slice(0, 10) : '',
            tags: Array.isArray(c.tags) ? c.tags.join(', ') : '',
        });
        setFormError(''); setFormOpen(true); setTab('coupons');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.discountValue)
            return setFormError('Title, category and discount value are required.');
        setSaving(true); setFormError('');
        try {
            const payload = {
                ...form,
                discountValue: parseFloat(form.discountValue),
                originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
                discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : null,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                vendorName: user?.fullName || user?.firstName || '',
            };
            if (editId) {
                await couponsAPI.update(editId, payload, getToken);
                toast('Coupon updated!', 'success');
            } else {
                await couponsAPI.create(payload, getToken);
                toast('Coupon created!', 'success');
            }
            setFormOpen(false); setEditId(null); setForm(EMPTY_FORM);
            loadData();
        } catch (err) { setFormError(err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await couponsAPI.delete(id, getToken);
            toast('Coupon deleted.', 'success');
            loadData();
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleDuplicate = async (coupon) => {
        try {
            const { _id, viewCount, soldCount, createdAt, updatedAt, __v, ...rest } = coupon;
            await couponsAPI.create({ ...rest, title: rest.title + ' (Copy)', isActive: false, soldCount: 0, viewCount: 0 }, getToken);
            toast('Coupon duplicated!', 'success');
            loadData();
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleToggleActive = async (coupon) => {
        try {
            await couponsAPI.update(coupon._id, { isActive: !coupon.isActive }, getToken);
            toast(coupon.isActive ? 'Coupon paused.' : 'Coupon activated!', 'success');
            loadData(true);
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleShare = (coupon) => {
        const url = `${window.location.origin}/deals/${coupon._id}`;
        navigator.clipboard.writeText(url).then(() => toast('Link copied to clipboard!', 'info'));
    };

    const handleBulkAction = async (action, ids) => {
        try {
            if (action === 'delete') {
                if (!window.confirm(`Delete ${ids.length} coupon(s)?`)) return;
                await Promise.all(ids.map(id => couponsAPI.delete(id, getToken)));
                toast(`${ids.length} coupon(s) deleted.`, 'success');
            } else {
                const isActive = action === 'activate';
                await Promise.all(ids.map(id => couponsAPI.update(id, { isActive }, getToken)));
                toast(`${ids.length} coupon(s) ${isActive ? 'activated' : 'paused'}.`, 'success');
            }
            loadData();
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleRedeemOrder = async (orderId) => {
        try {
            await ordersAPI.redeem(orderId, getToken);
            toast('Order marked as redeemed!', 'success');
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'redeemed', redeemedAt: new Date() } : o));
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault(); setProfileSaving(true);
        try {
            await vendorsAPI.updateProfile(profileForm, getToken);
            toast('Profile updated!', 'success');
        } catch (err) { toast(err.message, 'error'); }
        finally { setProfileSaving(false); }
    };

    // ── Loading State ─────────────────────────────────────────────
    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading dashboard…</p>
            </div>
        );
    }

    const displayName = user?.fullName || user?.firstName || 'Vendor';
    const expiringCount = coupons.filter(c => { const d = c.expiresOn ? Math.ceil((new Date(c.expiresOn) - new Date()) / 86400000) : null; return d !== null && d >= 0 && d <= 7; }).length;

    // ── RENDER ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            <VendorToast toasts={toasts} dismiss={dismiss} />

            {/* ── MOBILE OVERLAY ── */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* ── SIDEBAR ── */}
            <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo */}
                <div className="p-5 border-b border-gray-800">
                    <Link to="/" className="font-display font-bold text-lg text-white flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                        🏷️ Cou-<span className="text-orange-400">pong</span>
                        <span className="ml-auto text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Vendor</span>
                    </Link>
                    {/* Profile */}
                    <div className="mt-4 flex items-center gap-3">
                        {user?.imageUrl
                            ? <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full border border-orange-500/30 flex-shrink-0" />
                            : <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">{displayName[0]}</div>
                        }
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                    {/* LIVE indicator */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                        <span className="text-xs text-green-400 font-medium">LIVE</span>
                        <span className="text-xs text-gray-600 ml-1">· auto-refresh</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {TABS.map(({ id, icon, label }) => (
                        <button key={id}
                            onClick={() => { setTab(id); setSidebarOpen(false); setFormOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative
                ${tab === id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            <span>{icon}</span> {label}
                            {id === 'activity' && expiringCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{expiringCount}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Shortcuts hint */}
                <div className="px-4 pb-2">
                    <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-500 mb-1">Shortcuts</p>
                        <p><kbd className="bg-gray-700 px-1 rounded">N</kbd> New coupon</p>
                        <p><kbd className="bg-gray-700 px-1 rounded">F</kbd> Search</p>
                        <p><kbd className="bg-gray-700 px-1 rounded">1–3</kbd> Switch tabs</p>
                        <p><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Close modals</p>
                    </div>
                </div>

                {/* Sign out */}
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => signOut().then(() => navigate('/'))}
                        className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors px-4 py-2 rounded-xl hover:bg-red-900/10">
                        🚪 Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main className="flex-1 lg:ml-64">
                {/* Mobile topbar */}
                <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white text-xl">☰</button>
                    <span className="font-display font-bold text-white">Vendor Dashboard</span>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400">LIVE</span>
                    </div>
                </div>

                <div className="p-6 lg:p-8 max-w-7xl mx-auto">

                    {/* ── OVERVIEW ─────────────────────────────────────────── */}
                    {tab === 'overview' && (
                        <div>
                            <div className="mb-8">
                                <h1 className="font-display font-extrabold text-3xl text-white">
                                    Welcome back, {user?.firstName || 'Vendor'} 👋
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">Here's how your deals are performing today.</p>
                            </div>

                            {/* Stats cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Total Coupons', value: stats.totalCoupons, icon: '🎟️', from: 'from-orange-500/20', to: 'to-pink-500/20', text: 'text-orange-400' },
                                    { label: 'Active Deals', value: stats.activeCoupons, icon: '✅', from: 'from-green-500/20', to: 'to-teal-500/20', text: 'text-green-400' },
                                    { label: 'Total Views', value: stats.totalViews, icon: '👁️', from: 'from-blue-500/20', to: 'to-cyan-500/20', text: 'text-blue-400' },
                                    { label: 'Total Sold', value: stats.totalSold, icon: '💰', from: 'from-yellow-500/20', to: 'to-orange-500/20', text: 'text-yellow-400' },
                                ].map(s => (
                                    <div key={s.label}
                                        className={`bg-gradient-to-br ${s.from} ${s.to} border border-white/5 rounded-2xl p-6 relative overflow-hidden hover:scale-105 transition-transform`}>
                                        <div className="absolute top-4 right-4 text-2xl opacity-30">{s.icon}</div>
                                        <div className="text-3xl mb-1">{s.icon}</div>
                                        <div className={`font-display font-extrabold text-3xl ${s.text}`}>
                                            <AnimatedNumber value={s.value} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Expiry warning */}
                            {expiringCount > 0 && (
                                <div className="mb-6 bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <p className="text-yellow-300 font-semibold text-sm">{expiringCount} coupon{expiringCount > 1 ? 's' : ''} expiring within 7 days</p>
                                        <p className="text-yellow-600 text-xs mt-0.5">Extend expiry dates to keep deals live for customers.</p>
                                    </div>
                                    <button onClick={() => setTab('coupons')} className="ml-auto text-xs text-yellow-400 underline whitespace-nowrap">View →</button>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <h2 className="font-display font-bold text-lg text-white mb-4">⚡ Quick Actions</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { icon: '➕', label: 'Create Coupon', sub: 'Add a new deal', action: () => { setTab('coupons'); openCreate(); } },
                                    { icon: '👁️', label: 'Preview as Customer', sub: 'See customer view', action: () => window.open('/', '_blank') },
                                    { icon: '📊', label: 'View Analytics', sub: 'Performance charts', action: () => setTab('analytics') },
                                    { icon: '📥', label: 'Export Data', sub: 'Download CSV report', action: () => { setTab('coupons'); /* triggers CSV export */ } },
                                ].map(a => (
                                    <button key={a.label} onClick={a.action}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left hover:border-orange-500/40 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all group">
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{a.icon}</div>
                                        <p className="font-semibold text-white text-sm">{a.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{a.sub}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Recent coupons preview */}
                            {coupons.length > 0 && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="font-display font-bold text-lg text-white">🕒 Recent Coupons</h2>
                                        <button onClick={() => setTab('coupons')} className="text-sm text-orange-400 hover:underline">View all →</button>
                                    </div>
                                    <div className="space-y-3">
                                        {coupons.slice(0, 5).map(c => (
                                            <div key={c._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-all">
                                                {c.primaryImage
                                                    ? <img src={c.primaryImage} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                                    : <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">🎟️</div>
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-white text-sm truncate">{c.title}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{c.category}{c.city ? ` · ${c.city}` : ''}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-orange-400 font-bold text-sm">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</p>
                                                    <span className={`text-xs ${c.isActive ? 'text-green-400' : 'text-gray-500'}`}>{c.isActive ? '● Active' : '● Paused'}</span>
                                                </div>
                                                <button onClick={() => openEdit(c)} className="text-gray-600 hover:text-white p-1.5">✏️</button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── COUPONS ──────────────────────────────────────────── */}
                    {tab === 'coupons' && (
                        <div>
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                                <h1 className="font-display font-extrabold text-3xl text-white">🎟️ My Coupons</h1>
                                <button onClick={openCreate}
                                    className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm">
                                    + Add Coupon
                                </button>
                            </div>
                            {formOpen && (
                                <VendorCouponForm
                                    form={form} setForm={setForm} onSave={handleSave} onClose={() => setFormOpen(false)}
                                    saving={saving} error={formError} editId={editId}
                                />
                            )}
                            {coupons.length === 0 && !formOpen ? (
                                <div className="bg-gray-900 rounded-2xl border border-gray-800 py-24 text-center">
                                    <div className="text-6xl mb-4">🎟️</div>
                                    <h3 className="font-display font-bold text-xl text-white mb-2">No coupons yet</h3>
                                    <p className="text-gray-400 mb-6">Create your first deal to start reaching customers.</p>
                                    <button onClick={openCreate}
                                        className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all">
                                        + Create Your First Coupon
                                    </button>
                                </div>
                            ) : (
                                <VendorCouponTable
                                    coupons={coupons}
                                    onEdit={openEdit}
                                    onDelete={c => setDeleteCoupon(c)}
                                    onDuplicate={handleDuplicate}
                                    onToggleActive={handleToggleActive}
                                    onShare={handleShare}
                                    onViewDetail={c => setDetailCoupon(c)}
                                    onBulkAction={handleBulkAction}
                                />
                            )}
                        </div>
                    )}

                    {/* ── ANALYTICS ────────────────────────────────────────── */}
                    {tab === 'analytics' && <VendorAnalytics coupons={coupons} />}

                    {/* ── ORDERS ───────────────────────────────────────────── */}
                    {tab === 'orders' && (
                        <div>
                            <h1 className="font-display font-extrabold text-3xl text-white mb-6">📦 Customer Orders</h1>
                            {orders.length === 0 ? (
                                <div className="bg-gray-900 rounded-2xl border border-gray-800 py-20 text-center">
                                    <div className="text-5xl mb-4">📦</div>
                                    <p className="text-gray-400">No orders yet. Orders appear here once customers purchase your coupons.</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-gray-800">
                                                <tr className="text-left text-xs text-gray-400">
                                                    {['Coupon', 'Customer', 'Date', 'Price', 'Voucher', 'Status', 'Action'].map(h => (
                                                        <th key={h} className="px-4 py-3">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800">
                                                {orders.map(o => (
                                                    <tr key={o._id} className="hover:bg-gray-800/40">
                                                        <td className="px-4 py-3 font-medium text-white">{o.couponTitle || '—'}</td>
                                                        <td className="px-4 py-3 text-gray-400 truncate max-w-[140px]">{o.userId?.slice(0, 12)}…</td>
                                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </td>
                                                        <td className="px-4 py-3 text-green-400 font-semibold">₹{o.price}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="font-mono text-xs bg-gray-800 text-orange-300 px-2 py-1 rounded">{o.voucherCode}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.status === 'redeemed' ? 'bg-green-500/20 text-green-400' :
                                                                o.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                                                                    'bg-gray-700 text-gray-400'}`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {o.status === 'paid' && (
                                                                <button onClick={() => handleRedeemOrder(o._id)}
                                                                    className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-all">
                                                                    ✓ Redeem
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ACTIVITY / ALERTS ────────────────────────────────── */}
                    {tab === 'activity' && (
                        <div>
                            <h1 className="font-display font-extrabold text-3xl text-white mb-6">🔔 Activity & Alerts</h1>
                            <div className="space-y-4">
                                {expiringCount > 0 && (
                                    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                                        <h3 className="font-semibold text-red-300 mb-3">🚨 Expiring Soon</h3>
                                        <div className="space-y-2">
                                            {coupons.filter(c => { const d = c.expiresOn ? Math.ceil((new Date(c.expiresOn) - new Date()) / 86400000) : null; return d !== null && d >= 0 && d <= 7; }).map(c => (
                                                <div key={c._id} className="flex items-center gap-3 bg-gray-900/50 rounded-xl p-3">
                                                    <span className="text-xl">{Math.ceil((new Date(c.expiresOn) - new Date()) / 86400000) < 3 ? '🚨' : '⚠️'}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{c.title}</p>
                                                        <p className="text-xs text-gray-500">Expires {new Date(c.expiresOn).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    <button onClick={() => openEdit(c)} className="text-xs text-orange-400 underline">Extend →</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top performers alert */}
                                {stats.totalSold > 0 && (
                                    <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-5">
                                        <h3 className="font-semibold text-green-300 mb-2">🏆 Performance Update</h3>
                                        <p className="text-green-400 text-sm">Your coupons have been redeemed <span className="font-bold">{stats.totalSold}</span> times with <span className="font-bold">{stats.totalViews}</span> total views.</p>
                                    </div>
                                )}

                                {coupons.length === 0 && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                                        <div className="text-4xl mb-3">🔔</div>
                                        <p className="text-gray-400">No activity yet. Create coupons to see alerts here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── SETTINGS ─────────────────────────────────────────── */}
                    {tab === 'settings' && (
                        <div>
                            <h1 className="font-display font-extrabold text-3xl text-white mb-6">⚙️ Settings</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Business profile */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                    <h2 className="font-display font-bold text-lg text-white mb-4">🏪 Business Profile</h2>
                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        {[
                                            ['Business Name', 'businessName', 'text', 'e.g. Bella Italia'],
                                            ['Phone', 'phone', 'tel', '+91 98765 43210'],
                                            ['City', 'city', 'text', 'Mumbai'],
                                        ].map(([label, key, type, ph]) => (
                                            <div key={key}>
                                                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                                <input type={type} placeholder={ph} value={profileForm[key]}
                                                    onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                            </div>
                                        ))}
                                        <button type="submit" disabled={profileSaving}
                                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-60">
                                            {profileSaving ? 'Saving…' : 'Save Profile'}
                                        </button>
                                    </form>
                                </div>
                                {/* Account info */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                    <h2 className="font-display font-bold text-lg text-white mb-4">👤 Account</h2>
                                    <div className="space-y-3 text-sm">
                                        {[
                                            ['Name', user?.fullName || '—'],
                                            ['Email', user?.primaryEmailAddress?.emailAddress || '—'],
                                            ['Role', user?.publicMetadata?.role || 'vendor'],
                                            ['Membership', user?.publicMetadata?.membershipTier || 'free'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between py-2 border-b border-gray-800">
                                                <span className="text-gray-500">{label}</span>
                                                <span className="text-white font-medium capitalize">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                                        <p className="text-xs text-gray-500">To update your avatar/password, use Clerk's profile manager.</p>
                                        <Link to="/" className="text-sm text-orange-400 hover:underline block">← Back to marketplace</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* ── MODALS ── */}
            <DetailModal coupon={detailCoupon} onClose={() => setDetailCoupon(null)} onEdit={c => { openEdit(c); setDetailCoupon(null); }} onDelete={c => setDeleteCoupon(c)} />
            <DeleteModal coupon={deleteCoupon} onClose={() => setDeleteCoupon(null)} onConfirm={handleDelete} />
        </div>
    );
}
