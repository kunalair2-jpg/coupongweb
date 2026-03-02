import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useMemo } from 'react';

// Generate last 30 days data from coupons (mock trend from real totals)
function generateTrendData(coupons) {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        // Spread views/sold across 30 days proportionally with some variance
        const base = Math.max(1, coupons.length);
        days.push({
            date: label,
            views: Math.round((coupons.reduce((a, c) => a + (c.viewCount || 0), 0) / 30) * (0.5 + Math.random())),
            redemptions: Math.round((coupons.reduce((a, c) => a + (c.soldCount || 0), 0) / 30) * (0.5 + Math.random())),
        });
    }
    return days;
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm shadow-xl">
            <p className="text-gray-400 mb-1">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

export default function VendorAnalytics({ coupons }) {
    const trendData = useMemo(() => generateTrendData(coupons), [coupons]);

    const topPerformers = useMemo(() =>
        [...coupons]
            .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            .slice(0, 5),
        [coupons]
    );

    const categoryData = useMemo(() => {
        const map = {};
        coupons.forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
        return Object.entries(map).map(([name, count]) => ({ name, count }));
    }, [coupons]);

    const totalViews = coupons.reduce((a, c) => a + (c.viewCount || 0), 0);
    const totalSold = coupons.reduce((a, c) => a + (c.soldCount || 0), 0);
    const convRate = totalViews > 0 ? ((totalSold / totalViews) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            <h1 className="font-display font-extrabold text-3xl text-white">📊 Analytics</h1>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Views', value: totalViews, icon: '👁️', color: 'text-blue-400' },
                    { label: 'Total Sold', value: totalSold, icon: '🛒', color: 'text-green-400' },
                    { label: 'Conversion Rate', value: `${convRate}%`, icon: '📈', color: 'text-orange-400' },
                    { label: 'Active Coupons', value: coupons.filter(c => c.isActive).length, icon: '✅', color: 'text-purple-400' },
                ].map(s => (
                    <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="text-2xl mb-2">{s.icon}</div>
                        <div className={`font-display font-extrabold text-3xl ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Views & Redemptions Line Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg text-white mb-5">📉 Views vs Redemptions — Last 30 Days</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval={4} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                        <Line type="monotone" dataKey="views" stroke="#60a5fa" strokeWidth={2} dot={false} name="Views" />
                        <Line type="monotone" dataKey="redemptions" stroke="#34d399" strokeWidth={2} dot={false} name="Redemptions" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Coupons by Category Bar Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg text-white mb-5">🗂️ Coupons by Category</h2>
                {categoryData.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} name="Coupons" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Conversion Funnel */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-display font-bold text-lg text-white mb-5">🔻 Conversion Funnel</h2>
                <div className="space-y-3">
                    {[
                        { label: 'Total Views', value: totalViews, pct: 100, color: 'bg-blue-500' },
                        { label: 'Clicks (est.)', value: Math.round(totalViews * 0.38), pct: 38, color: 'bg-purple-500' },
                        { label: 'Redemptions', value: totalSold, pct: totalViews > 0 ? ((totalSold / totalViews) * 100).toFixed(1) : 0, color: 'bg-green-500' },
                    ].map(f => (
                        <div key={f.label}>
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>{f.label}</span>
                                <span className="font-semibold text-white">{f.value} <span className="text-gray-500 font-normal">({f.pct}%)</span></span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${f.color} rounded-full transition-all duration-700`} style={{ width: `${f.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Performers */}
            {topPerformers.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="font-display font-bold text-lg text-white mb-5">🏆 Top Performers</h2>
                    <div className="space-y-3">
                        {topPerformers.map((c, i) => (
                            <div key={c._id} className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                                    {i + 1}
                                </div>
                                {c.primaryImage
                                    ? <img src={c.primaryImage} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                    : <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">🎟️</div>
                                }
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">{c.title}</p>
                                    <p className="text-xs text-gray-500 capitalize">{c.category}{c.city ? ` · ${c.city}` : ''}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-orange-400 font-bold text-sm">{c.soldCount || 0} sold</p>
                                    <p className="text-xs text-gray-500">👁️ {c.viewCount || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
