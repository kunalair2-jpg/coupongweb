import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="font-display font-bold text-xl text-white flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏷️</span>
                            Cou-<span className="text-orange-400">pong</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The smartest way to discover and save on local businesses. Smart deals for smart shoppers.
                        </p>
                        <div className="flex gap-3 mt-5">
                            {['📘', '🐦', '📸'].map((icon, i) => (
                                <button key={i} className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors text-sm">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">For Customers</h4>
                        <ul className="space-y-2.5">
                            {[['/', 'Browse Deals'], ['/membership', 'Membership'], ['/extra-discounts', 'Extra Discounts'], ['/cart', 'My Cart']].map(([to, label]) => (
                                <li key={to}><Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">For Businesses</h4>
                        <ul className="space-y-2.5">
                            {[['/vendor-login', 'Vendor Login'], ['/vendor-signup', 'List Your Business'], ['/vendor-dashboard', 'Dashboard']].map(([to, label]) => (
                                <li key={to}><Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-4">Join 50,000+ others getting the best local offers.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                                →
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2024 Cou-pong Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
