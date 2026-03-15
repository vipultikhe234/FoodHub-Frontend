import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
    TrendingUp,
    ArrowUpRight,
    Clock,
    Calendar,
    Wallet,
    Ticket,
    Package,
    Users as UsersIcon,
    ArrowRight,
    Loader2,
    AlertCircle,
    Activity,
    CheckCircle2,
    ShoppingCart,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    pending: { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    preparing: { color: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', icon: Activity },
    dispatched: { color: 'bg-violet-500', text: 'text-violet-600', bg: 'bg-violet-50', icon: TrendingUp },
    delivered: { color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    cancelled: { color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle },
};

const Dashboard = () => {
    const { orders, stats, loading, error, handleStatusChange } = useDashboardStats();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <p className="text-slate-400 font-semibold text-xs tracking-wide animate-pulse">Syncing Data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white dark:bg-[#111827] rounded-2xl shadow-premium max-w-2xl mx-auto border border-rose-100 dark:border-rose-500/10">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-8">
                <AlertCircle className="text-rose-500" size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-['Outfit'] tracking-tighter uppercase ">Error Loading Data</h2>
            <p className="text-slate-500 dark:text-gray-400 font-medium text-sm mb-10 leading-relaxed ">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white font-bold px-12 py-5 rounded-xl shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest"
            >
                Retry Connection <ArrowRight size={18} />
            </button>
        </div>
    );

    const totalOrders = stats?.total_orders ?? orders.length;
    const totalRevenue = stats?.total_revenue ?? orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    const totalUsers = stats?.total_users ?? '—';
    const totalProducts = stats?.total_products ?? '—';
    const recentCount = stats?.recent_orders_count ?? 0;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.created_at?.startsWith(key));
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            total: dayOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0),
        };
    });
    const maxBar = Math.max(...last7Days.map(d => d.total), 1);

    const statusBreakdown = ['pending', 'preparing', 'dispatched', 'delivered', 'cancelled'].map(s => ({
        status: s,
        count: orders.filter(o => o.status === s).length,
    }));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-20"
        >
            {/* Top Toolbar */}
            <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight font-['Outfit'] leading-none">Dashboard</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <Calendar size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-slate-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-widest font-['Outfit'] ">
                            Statistics · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
                <Link to="/orders" className="w-fit group flex items-center gap-4 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95">
                    View Orders <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Main KPI Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Revenue', val: `₹${Number(totalRevenue).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500', sub: '+12% growth' },
                    { label: 'Total Savings', val: `₹${Number(stats?.total_discounts || 0).toLocaleString('en-IN')}`, icon: Ticket, color: 'text-rose-500', bg: 'bg-rose-500', sub: 'Coupon usage' },
                    { label: 'Total Orders', val: totalOrders, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-500', sub: `${recentCount} today` },
                    { label: 'Total Users', val: totalUsers, icon: UsersIcon, color: 'text-violet-500', bg: 'bg-violet-500', sub: 'Active members' },
                    { label: 'Products', val: totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-500', sub: 'Menu items' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#111827] p-4 rounded-xl shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className={`w-10 h-10 ${stat.bg}/10 ${stat.color} rounded-lg flex items-center justify-center mb-4 border border-current/10`}>
                            <stat.icon size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-['Outfit'] ">{stat.label}</h3>
                        <p className="text-lg font-bold text-gray-900 dark:text-white font-['Outfit'] tracking-tight leading-none truncate">{stat.val}</p>
                        <p className="text-[10px] font-bold text-slate-300 dark:text-gray-700 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                            <TrendingUp size={10} /> {stat.sub}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Orders Overview */}
                <motion.div variants={itemVariants} className="xl:col-span-2 bg-white dark:bg-[#111827] rounded-[56px] shadow-premium border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-12 py-10 flex justify-between items-center border-b border-gray-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-premium border border-gray-100 dark:border-white/5 text-indigo-600">
                                <Activity size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight font-['Outfit']">New Orders</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Live Order Stream</p>
                                </div>
                            </div>
                        </div>
                        <button className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white px-6 py-1.5 rounded-xl transition-all border border-indigo-500/20 active:scale-95">Export PDF</button>
                    </div>

                    <div className="p-8">
                        {orders.length === 0 ? (
                            <div className="py-32 text-center bg-slate-50 dark:bg-white/10 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-white/5">
                                <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-premium">
                                    <ShoppingCart size={40} className="text-slate-200" strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter mb-2 font-['Outfit']">No Active Orders</h4>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ">The queue is currently clear</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 5).map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <div key={order.id} className="group p-6 bg-[#F9FAFB] dark:bg-white/[0.03] rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-gray-800 focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-500 flex items-center gap-6">
                                            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-premium border border-slate-100 dark:border-white/5 font-bold text-sm font-['Outfit']  text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                {order.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm tracking-tight font-['Outfit'] uppercase truncate">{order.user?.name || 'Guest User'}</p>
                                                    <div className="px-2 py-0.5 bg-white dark:bg-white/5 rounded-md border border-slate-100 dark:border-white/10">
                                                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">ORD-{String(order.id).padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl ${cfg.bg} ${cfg.text} border border-current/10 shadow-sm`}>
                                                        <StatusIcon size={12} strokeWidth={3} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{order.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Clock size={12} />
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white font-['Outfit'] tracking-tighter mb-2 transition-colors group-hover:text-indigo-600 ">
                                                    ₹{parseFloat(order.total_price).toFixed(0)}
                                                </p>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="appearance-none bg-white dark:bg-gray-900 border-none text-[9px] font-bold rounded-xl px-5 py-1.5 outline-none ring-1 ring-slate-100 dark:ring-white/10 focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase cursor-pointer shadow-sm hover:shadow-xl transition-all"
                                                >
                                                    <option value="pending">Authorize</option>
                                                    <option value="preparing">Prepare</option>
                                                    <option value="dispatched">Dispatch</option>
                                                    <option value="delivered">Complete</option>
                                                    <option value="cancelled">Abort</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Performance Analytics */}
                <div className="space-y-10">
                    <motion.div variants={itemVariants} className="bg-slate-900 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 shadow-indigo-600/10">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex items-center gap-3 mb-10 relative z-10">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <TrendingUp size={20} strokeWidth={3} className="text-white" />
                            </div>
                            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest font-['Outfit']  leading-none">Revenue Growth</p>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tighter font-['Outfit'] mb-10 relative z-10 leading-none uppercase ">Weekly Progress</h3>

                        <div className="flex items-end gap-4 h-44 relative z-10 px-2 group">
                            {last7Days.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max((d.total / maxBar) * 100, 8)}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                            className="w-full bg-white/5 group-hover/bar:bg-indigo-500 rounded-t-xl transition-all duration-700 shadow-[0_0_30px_rgba(79,70,229,0)] group-hover/bar:shadow-[0_0_30px_rgba(79,70,229,0.5)] border-t border-white/10"
                                        />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl scale-75 group-hover/bar:scale-100 pointer-events-none">
                                            ₹{(d.total / 1000).toFixed(1)}k
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-['Outfit']">{d.day.slice(0, 1)}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#111827] rounded-[56px] p-10 shadow-premium border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                                <BarChart3 size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest font-['Outfit']  leading-none">Orders by Status</p>
                        </div>

                        <div className="space-y-8">
                            {statusBreakdown.map(({ status, count }) => {
                                if (count === 0 && (status === 'dispatched' || status === 'cancelled')) return null;
                                const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                                return (
                                    <div key={status} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[status]?.color} shadow-sm shadow-current`}></div>
                                                <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest ">{status}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-gray-600 font-['Outfit'] tracking-tighter">{count} orders</span>
                                        </div>
                                        <div className="h-3 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-100 dark:border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${STATUS_CONFIG[status]?.color} shadow-lg shadow-current/20 border-r border-white/20`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
