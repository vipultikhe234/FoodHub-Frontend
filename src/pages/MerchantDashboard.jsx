import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
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
    SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
    placed: { color: 'text-zinc-600', dot: 'bg-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800/50', label: 'Placed' },
    accepted: { color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Accepted' },
    preparing: { color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Preparing' },
    ready: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Ready' },
    out_for_delivery: { color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'On Way' },
    delivered: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Delivered' },
    picked_up: { color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', label: 'Picked Up' },
};

const MerchantDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, orderCount: 0, activeOrders: 0 });
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        fetchMerchantData();
    }, []);

    const fetchMerchantData = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders();
            const allOrders = response.data.data || [];
            
            const merchantOrders = allOrders.filter(o => o.merchant_id === user?.merchant?.id);
            setOrders(merchantOrders);

            const revenue = merchantOrders.reduce((acc, o) => o.status === 'delivered' || o.status === 'picked_up' ? acc + parseFloat(o.total_price) : acc, 0);
            const active = merchantOrders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).length;

            setStats({
                revenue,
                orderCount: merchantOrders.length,
                activeOrders: active
            });
        } catch (error) {
            console.error("Merchant fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusMove = async (orderId, currentStatus, type) => {
        const flow = ['placed', 'accepted', 'preparing', 'ready'];
        if (type === 'pickup' && currentStatus === 'ready') {
            try {
                await orderService.updateStatus(orderId, 'picked_up');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'picked_up' } : o));
                toast.success("Order picked up");
            } catch (e) { toast.error("Pickup termination failed"); }
            return;
        }

        const currentIndex = flow.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === flow.length - 1) return;

        const nextStatus = flow[currentIndex + 1];
        try {
            await orderService.updateStatus(orderId, nextStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
            toast.success("Status advanced");
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    return (
        <div className="space-y-8 pb-20 font-sans">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Store size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight italic uppercase italic">Merchant Stats Dashboard</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest italic">Performance Analysis & Earnings Tracker</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center">
                        <ApnaCartLoader centered={true} size={60} />
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{stats.revenue.toFixed(0)}</h2>
                                <div className="mt-4 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                                    <TrendingUp size={12} /> +18.4% this week
                                </div>
                            </div>
                            <IndianRupee className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 -rotate-12" />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Kitchen Load</p>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.activeOrders}</h2>
                                <div className="mt-4 flex items-center gap-1.5 text-blue-500 text-[10px] font-bold">
                                    <Activity size={12} className="animate-pulse" /> Active Sessions
                                </div>
                            </div>
                            <Clock className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 rotate-12" />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Lifetime Orders</p>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.orderCount}</h2>
                                <div className="mt-4 flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
                                    <CheckCircle2 size={12} /> Completed Fleet
                                </div>
                            </div>
                            <Package className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-zinc-50 dark:text-white/5 -rotate-12" />
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[11px] font-black italic text-zinc-900 dark:text-white uppercase tracking-widest">Recent Activity Queue</h3>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="py-24 text-center">
                                    <ApnaCartLoader centered={true} size={80} />
                                </div>
                            ) : orders.slice(0, 5).map(order => {
                                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                                return (
                                    <motion.div 
                                        key={order.id}
                                        layout
                                        className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-zinc-300">
                                                #{String(order.id).slice(-3)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{order.user?.name || 'Customer'}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">₹{order.total_price}</p>
                                            </div>
                                        </div>
                                        <Link to="/orders" className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[11px] font-black italic text-zinc-900 dark:text-white uppercase tracking-widest px-2">Top Performance</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 p-8 space-y-6">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <SearchX size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No detailed analytics available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard; 
