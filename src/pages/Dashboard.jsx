import ApnaCartLoader from '../components/ApnaCartLoader';
import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import DashboardCard from '../components/DashboardCard';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    Calendar,
    Wallet,
    IndianRupee,
    Activity,
    Bike,
    Users as UsersIcon,
    UserPlus,
    Store,
    ShieldCheck,
    Navigation,
    Package,
    AlertTriangle,
    ChevronRight,
    SearchX,
    Tag,
    LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMerchant } from '../contexts/MerchantContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { selectedMerchantId } = useMerchant();
    const { orders, stats, loading, error } = useDashboardStats(selectedMerchantId);

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white dark:bg-zinc-900 rounded-none border border-red-100 dark:border-red-900/20 max-w-xl mx-auto shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Sync Interrupted</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white px-8 py-3 rounded-none font-semibold shadow-sm hover:opacity-90 transition-all text-sm">Retry Connection</button>
        </div>
    );

    if (loading) return <ApnaCartLoader />;

    const trend = stats?.sales_trend?.map(d => d.total) || [10, 25, 15, 30, 45, 35, 55];

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-zinc-900 dark:bg-emerald-500 rounded-none" />
                        Platform Control Center
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic ml-4">
                        Master Intelligence & Real-time Node Monitoring
                    </p>
                </div>
                <div className="flex bg-white dark:bg-zinc-900 rounded-none p-1 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-none">
                        <Activity className="text-emerald-500 animate-pulse" size={12} />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </header>

            {/* 1. Orders Ecosystem */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Orders Ecosystem
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Orders" value={stats?.total_orders || 0} icon={ShoppingBag} color="zinc" subLabel="Network Wide" trendData={trend} />
                    <DashboardCard label="Today Orders" value={stats?.today_orders || 0} icon={Calendar} color="blue" subLabel="Daily Volume" />
                    <DashboardCard label="Pending Orders" value={stats?.pending_orders || 0} icon={Clock} color="amber" subLabel="Awaiting Action" />
                    <DashboardCard label="Completed Orders" value={stats?.completed_orders || 0} icon={CheckCircle2} color="emerald" subLabel="Direct Fulfilled" />
                </div>
            </section>

            {/* 2. Revenue & Fintech */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Revenue & Liquidity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Revenue" value={stats?.total_revenue || 0} icon={Wallet} color="emerald" subLabel="Net Volume" isCurrency={true} trendData={trend} />
                    <DashboardCard label="Today Revenue" value={stats?.today_revenue || 0} icon={IndianRupee} color="cyan" subLabel="Daily Income" isCurrency={true} />
                    <DashboardCard label="Active Orders" value={stats?.active_orders || 0} icon={Activity} color="amber" subLabel="Live Sessions" />
                    <DashboardCard label="Failed / Cancelled" value={stats?.failed_orders || 0} icon={AlertTriangle} color="rose" subLabel="Risk Analysis" />
                </div>
            </section>

            {/* 3. Logistics & Infrastructure */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Platform Infrastructure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="In Transit" value={stats?.out_for_delivery || 0} icon={Bike} color="violet" subLabel="Riders En route" />
                    <DashboardCard label="Active Riders" value={stats?.active_riders || 0} icon={Navigation} color="emerald" subLabel="Fleet Capacity" />
                    <DashboardCard label="Total Merchants" value={stats?.total_merchants || 0} icon={Store} color="blue" subLabel="Vendor Nodes" />
                    <DashboardCard label="Active Merchants" value={stats?.active_merchants || 0} icon={ShieldCheck} color="cyan" subLabel="Verification Live" />
                </div>
            </section>

            {/* 4. Users & Inventory */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Growth & Inventory
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Users" value={stats?.total_users || 0} icon={UsersIcon} color="purple" subLabel="Identity Base" />
                    <DashboardCard label="New Today" value={stats?.today_new_users || 0} icon={UserPlus} color="emerald" subLabel="Adoption Rate" />
                    <DashboardCard label="Stock Alerts" value={stats?.low_stock_products || 0} icon={Package} color="rose" subLabel="Restock Needed" />
                    <DashboardCard label="Identity Flow" value="Live" icon={Activity} color="zinc" subLabel="System Secure" />
                </div>
            </section>

            {/* Recent Orders Table (Minimal) */}
            <section className="pt-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                        Recent Transaction Stream
                    </h3>
                    <Link to="/orders" className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                        View Journal <ChevronRight size={12} />
                    </Link>
                </div>
                
                <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                    {orders.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <SearchX size={48} className="mx-auto text-zinc-400 mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">No active sessions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Identity</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Flow State</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Merchant</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {orders.slice(0, 8).map(order => (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-none flex items-center justify-center font-black text-zinc-400 text-xs">#{String(order.id).slice(-3)}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase">{order.user?.name || 'Customer'}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{new Date(order.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest border ${
                                                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">{order.merchant?.name || 'Partner'}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-xs font-black text-zinc-900 dark:text-white">₹{order.total_price}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
