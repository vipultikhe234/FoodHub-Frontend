import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import DashboardCard from '../components/DashboardCard';
import { 
    Package, 
    Clock, 
    CheckCircle2, 
    Activity, 
    IndianRupee, 
    TrendingUp,
    Store,
    Users,
    ChevronRight,
    SearchX,
    ShoppingBag,
    Wallet,
    Calendar,
    Star,
    Zap,
    Utensils,
    Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const MerchantDashboard = () => {
    // We use the same hook but it will automatically detect the merchant role or use selectedMerchantId
    // For a merchant logged in, selectedMerchantId will be their ID.
    const { orders, stats, loading, error } = useDashboardStats();

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-red-100 dark:border-red-900/20 max-w-xl mx-auto shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Sync Interrupted</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all text-sm">Retry Connection</button>
        </div>
    );

    if (loading) return <ApnaCartLoader />;

    const trend = stats?.sales_trend?.map(d => d.total) || [5, 12, 8, 15, 20, 18, 25];

    return (
        <div className="space-y-12 pb-20 font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase flex items-center gap-3 italic">
                        <Store className="text-emerald-500" size={32} />
                        Merchant Hub
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">
                        Performance Analysis & Earnings Tracker
                    </p>
                </div>
                <div className="flex bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                        <Activity className="text-emerald-500 animate-pulse" size={14} />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[9px]">Live Operations</span>
                    </div>
                </div>
            </header>

            {/* 1. Order Stats */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Order Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Orders" value={stats?.total_orders || 0} icon={ShoppingBag} color="zinc" subLabel="Lifetime" trendData={trend} />
                    <DashboardCard label="Today Orders" value={stats?.today_orders || 0} icon={Calendar} color="blue" subLabel="Daily Volume" />
                    <DashboardCard label="Pending" value={stats?.pending_orders || 0} icon={Clock} color="amber" subLabel="Action Required" />
                    <DashboardCard label="Completed" value={stats?.completed_orders || 0} icon={CheckCircle2} color="emerald" subLabel="Success Rate" />
                </div>
            </section>

            {/* 2. Revenue & Live Stats */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Revenue & Live Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Revenue" value={stats?.total_revenue || 0} icon={Wallet} color="emerald" subLabel="Gross Earnings" isCurrency={true} trendData={trend} />
                    <DashboardCard label="Today Revenue" value={stats?.today_revenue || 0} icon={IndianRupee} color="cyan" subLabel="Today Earnings" isCurrency={true} />
                    <DashboardCard label="Active Orders" value={stats?.active_orders || 0} icon={Activity} color="amber" subLabel="Live in System" />
                    <DashboardCard label="In Preparation" value={stats?.preparing_out_for_delivery || 0} icon={Utensils} color="orange" subLabel="Kitchen Load" />
                </div>
            </section>

            {/* 3. Catalog & Customers */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></span>
                    Asset Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard label="Total Products" value={stats?.total_products || 0} icon={Package} color="blue" subLabel="Menu Items" />
                    <DashboardCard label="Critical Stock" value={stats?.low_stock_products || 0} icon={Zap} color="rose" subLabel="Action Required" />
                    <DashboardCard label="Total Customers" value={stats?.total_customers || 0} icon={Users} color="purple" subLabel="Unique Buyers" />
                    <DashboardCard label="Avg Rating" value={stats?.avg_rating || 0} icon={Star} color="amber" subLabel="Customer Trust" />
                </div>
            </section>

            {/* Recent Orders Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-[11px] font-black italic text-zinc-900 dark:text-white uppercase tracking-widest">Active Activity Stream</h3>
                        <Link to="/orders" className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            Go to Console <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {orders.length === 0 ? (
                                <div className="py-24 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 text-center opacity-30">
                                    <SearchX size={48} className="mx-auto text-zinc-400 mb-4" />
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No active sessions found</p>
                                </div>
                            ) : (
                                orders.slice(0, 5).map(order => (
                                    <motion.div 
                                        key={order.id}
                                        layout
                                        className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-zinc-400">
                                                #{String(order.id).slice(-3)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{order.user?.name || 'Customer'}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">₹{order.total_price} • {new Date(order.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <Link to="/orders" className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 group-hover:text-emerald-500 transition-all">
                                            <ChevronRight size={18} />
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[11px] font-black italic text-zinc-900 dark:text-white uppercase tracking-widest px-4">Marketing Health</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 p-8 space-y-8 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                                <Zap size={32} />
                            </div>
                            <h4 className="text-2xl font-black text-zinc-900 dark:text-white">{stats?.active_offers || 0}</h4>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Active Promotions</p>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase px-2">
                                <span>Trust Score</span>
                                <span className="text-zinc-900 dark:text-white">{stats?.avg_rating || 0}/5.0</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((stats?.avg_rating || 0) / 5) * 100}%` }}
                                    className="h-full bg-emerald-500" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard;
