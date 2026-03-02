import { useState, useMemo } from 'react';

function getDaysLeft(d) {
    if (!d) return null;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function ExpiryBadge({ date }) {
    const days = getDaysLeft(date);
    if (days === null) return <span className="text-gray-600 text-xs">No expiry</span>;
    if (days < 0) return <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Expired</span>;
    if (days === 0) return <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full animate-pulse">Today!</span>;
    if (days <= 3) return <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">🚨 {days}d</span>;
    if (days <= 7) return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">⚠️ {days}d</span>;
    return <span className="text-xs text-gray-400">{days}d left</span>;
}

function PerformanceBadge({ coupon }) {
    if (coupon.soldCount > 50) return <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full ml-1">🔥 Hot</span>;
    if (coupon.viewCount > 200) return <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-1">📈 Trending</span>;
    if (coupon.rating >= 4.8) return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-1">⭐ Top</span>;
    return null;
}

const SORT_FIELDS = { title: 'Title', viewCount: 'Views', soldCount: 'Sold', discountValue: 'Discount', expiresOn: 'Expiry' };

export default function VendorCouponTable({
    coupons, onEdit, onDelete, onDuplicate, onToggleActive, onShare, onViewDetail, onBulkAction
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [sortKey, setSortKey] = useState('createdAt');
    const [sortDir, setSortDir] = useState(-1);
    const [selected, setSelected] = useState(new Set());
    const [page, setPage] = useState(1);
    const PER_PAGE = 15;

    const cities = [...new Set(coupons.map(c => c.city).filter(Boolean))];
    const cats = [...new Set(coupons.map(c => c.category).filter(Boolean))];

    const now = new Date();
    const filtered = useMemo(() => {
        let list = coupons.filter(c => {
            const expired = c.expiresOn && new Date(c.expiresOn) < now;
            const status = expired ? 'expired' : c.isActive ? 'active' : 'paused';
            if (statusFilter !== 'all' && status !== statusFilter) return false;
            if (catFilter !== 'all' && c.category !== catFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return c.title?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
            }
            return true;
        });
        list = [...list].sort((a, b) => {
            const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
            return sortDir * (av < bv ? -1 : av > bv ? 1 : 0);
        });
        return list;
    }, [coupons, search, statusFilter, catFilter, sortKey, sortDir]);

    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const toggleSort = key => {
        if (sortKey === key) setSortDir(d => -d);
        else { setSortKey(key); setSortDir(-1); }
    };

    const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleAll = () => setSelected(s => s.size === paged.length ? new Set() : new Set(paged.map(c => c._id)));

    const expiringCount = coupons.filter(c => { const d = getDaysLeft(c.expiresOn); return d !== null && d >= 0 && d <= 7; }).length;

    function exportCSV() {
        const header = ['Title', 'Category', 'Type', 'Value', 'City', 'Views', 'Sold', 'Status', 'Expiry'];
        const rows = filtered.map(c => [
            c.title, c.category, c.discountType, c.discountValue, c.city || '',
            c.viewCount || 0, c.soldCount || 0,
            c.isActive ? 'Active' : 'Paused',
            c.expiresOn ? new Date(c.expiresOn).toLocaleDateString('en-IN') : ''
        ]);
        const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `coupons-${Date.now()}.csv`; a.click();
    }

    const SortTh = ({ field, label }) => (
        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-orange-400 whitespace-nowrap select-none"
            onClick={() => toggleSort(field)}>
            {label} {sortKey === field ? (sortDir === -1 ? '↓' : '↑') : '↕'}
        </th>
    );

    return (
        <div>
            {/* Expiry warning banner */}
            {expiringCount > 0 && (
                <div className="mb-4 bg-yellow-900/40 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="text-yellow-400 text-base">⚠️</span>
                    <span className="text-yellow-300 font-medium">{expiringCount} coupon{expiringCount > 1 ? 's' : ''} expiring within 7 days</span>
                    <button onClick={() => setStatusFilter('active')} className="ml-auto text-xs text-yellow-400 underline">View →</button>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="🔍 Search title, city, category…"
                    className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                </select>
                <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none capitalize">
                    <option value="all">All Categories</option>
                    {cats.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
                <button onClick={exportCSV} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2">
                    📥 Export CSV
                </button>
                {(search || statusFilter !== 'all' || catFilter !== 'all') && (
                    <button onClick={() => { setSearch(''); setStatusFilter('all'); setCatFilter('all'); setPage(1); }}
                        className="text-xs text-orange-400 underline">Clear filters</button>
                )}
                <span className="text-xs text-gray-500 ml-auto">{filtered.length} of {coupons.length} coupons</span>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
                <div className="mb-3 flex items-center gap-3 bg-orange-900/30 border border-orange-500/30 rounded-xl px-4 py-2.5">
                    <span className="text-orange-400 text-sm font-semibold">{selected.size} selected</span>
                    <button onClick={() => onBulkAction('activate', [...selected])} className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/30">Activate All</button>
                    <button onClick={() => onBulkAction('pause', [...selected])} className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-500/30">Pause All</button>
                    <button onClick={() => onBulkAction('delete', [...selected])} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30">Delete All</button>
                    <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 ml-auto underline">Clear</button>
                </div>
            )}

            {/* Table */}
            {paged.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 py-20 text-center">
                    <div className="text-5xl mb-4">🎟️</div>
                    <p className="text-gray-400 mb-2">No coupons match your filters.</p>
                    <button onClick={() => { setSearch(''); setStatusFilter('all'); setCatFilter('all'); }} className="text-orange-400 text-sm underline">Clear filters</button>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-800 bg-gray-900/80">
                                <tr>
                                    <th className="px-3 py-3">
                                        <input type="checkbox" checked={selected.size === paged.length && paged.length > 0}
                                            onChange={toggleAll} className="accent-orange-500" />
                                    </th>
                                    <SortTh field="title" label="Title" />
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Discount</th>
                                    <SortTh field="viewCount" label="Views" />
                                    <SortTh field="soldCount" label="Sold" />
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                                    <SortTh field="expiresOn" label="Expiry" />
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {paged.map(coupon => {
                                    const expired = coupon.expiresOn && new Date(coupon.expiresOn) < now;
                                    const statusLabel = expired ? 'Expired' : coupon.isActive ? 'Active' : 'Paused';
                                    const statusColor = expired ? 'bg-gray-700 text-gray-400' : coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
                                    return (
                                        <tr key={coupon._id} className={`hover:bg-gray-800/50 transition-colors ${selected.has(coupon._id) ? 'bg-orange-900/10' : ''}`}>
                                            <td className="px-3 py-3">
                                                <input type="checkbox" checked={selected.has(coupon._id)} onChange={() => toggleSelect(coupon._id)} className="accent-orange-500" />
                                            </td>
                                            <td className="px-3 py-3 max-w-[240px]">
                                                <div className="flex items-center gap-3">
                                                    {coupon.primaryImage
                                                        ? <img src={coupon.primaryImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-700" />
                                                        : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🎟️</div>
                                                    }
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-white truncate">{coupon.title}
                                                            <PerformanceBadge coupon={coupon} />
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{coupon.city}{coupon.locality ? `, ${coupon.locality}` : ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-orange-400 font-semibold whitespace-nowrap">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                                {coupon.membersOnly && <span className="ml-1 text-xs text-yellow-400">👑</span>}
                                            </td>
                                            <td className="px-3 py-3 text-gray-300">👁️ {coupon.viewCount || 0}</td>
                                            <td className="px-3 py-3 text-gray-300">🛒 {coupon.soldCount || 0}</td>
                                            <td className="px-3 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
                                            </td>
                                            <td className="px-3 py-3"><ExpiryBadge date={coupon.expiresOn} /></td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => onViewDetail(coupon)} title="View" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">👁️</button>
                                                    <button onClick={() => onEdit(coupon)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all">✏️</button>
                                                    <button onClick={() => onDuplicate(coupon)} title="Duplicate" className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all">📋</button>
                                                    <button onClick={() => onShare(coupon)} title="Copy link" className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">🔗</button>
                                                    <button onClick={() => onToggleActive(coupon)} title={coupon.isActive ? 'Pause' : 'Activate'}
                                                        className={`p-1.5 rounded-lg transition-all ${coupon.isActive ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'}`}>
                                                        {coupon.isActive ? '⏸️' : '▶️'}
                                                    </button>
                                                    <button onClick={() => onDelete(coupon)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
                            <div className="flex gap-2">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 text-sm">← Prev</button>
                                <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 text-sm">Next →</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
