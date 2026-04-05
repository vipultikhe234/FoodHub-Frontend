import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import api, { MerchantService, merchantCategoryService, orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import { toast } from 'react-hot-toast';
import {
    Clock,
    Activity,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
    RefreshCw,
    User,
    CreditCard,
    ChevronDown,
    ChevronUp,
    MapPin,
    Package,
    IndianRupee,
    Ticket,
    SearchX,
    ShoppingCart,
    Loader2,
    ShieldCheck,
    Target,
    Search,
    XCircle,
    Archive,
    History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Move initialization inside component to prevent top-level module crash if env var is missing
const getStripe = () => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) return null;
    return loadStripe(key);
};
const stripePromise = getStripe();

const STATUS_CONFIG = {
    placed: { color: 'text-zinc-600', dot: 'bg-zinc-500', bg: 'bg-zinc-50 dark:bg-zinc-800/50', label: 'Placed' },
    accepted: { color: 'text-blue-600', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Accepted' },
    preparing: { color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Preparing' },
    ready: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Ready' },
    out_for_delivery: { color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'On Way' },
    delivered: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Delivered' },
    picked_up: { color: 'text-teal-600', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', label: 'Picked Up' },
    cancelled: { color: 'text-red-600', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Cancelled' },
};

const PAY_STATUS_COLORS = {
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    failed: 'bg-red-500/10 text-red-600 border-red-500/20',
    refunded: 'bg-zinc-900 text-white border-zinc-800',
};

import { useMerchant } from '../contexts/MerchantContext';

const Orders = () => {
    const { selectedMerchantId } = useMerchant();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [merchantCategories, setMerchantCategories] = useState([]);
    const [selectedMerchantCategoryId, setSelectedMerchantCategoryId] = useState('');
    
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isMerchant = user.role === 'merchant' || user.role === 'Merchant';

    useEffect(() => {
        fetchOrders();
        if (!isMerchant) {
            merchantCategoryService.adminGetAll().then(res => setMerchantCategories(res.data.data || []));
        }
    }, [selectedMerchantId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders(selectedMerchantId);
            const data = response.data.data || response.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) || 
            (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.merchant?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        
        const matchesMerchantCategory = !selectedMerchantCategoryId || 
                                       order.merchant?.merchant_category_id?.toString() === selectedMerchantCategoryId.toString();

        return matchesSearch && matchesStatus && matchesMerchantCategory;
    });

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <Elements stripe={stripePromise}>
            <div className="space-y-8 pb-20 font-sans">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Order Record Hub</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Professional archive of all merchant transactions.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={fetchOrders}
                            className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH ARCHIVES..."
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-56 transition-all dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <HistoryIcon size={20} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Status KPI Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled'].map((key) => {
                        const cfg = STATUS_CONFIG[key];
                        const count = statusCounts[key] || 0;
                        const isActive = filterStatus === key;
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ y: -4 }}
                                onClick={() => setFilterStatus(isActive ? 'all' : key)}
                                className={`p-5 rounded-[1.5rem] border transition-all text-left relative overflow-hidden group ${isActive
                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : cfg.dot}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-white/70' : 'text-zinc-400'}`}>{cfg.label}</span>
                                </div>
                                <p className={`text-2xl font-black tracking-tight leading-none ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                    {count}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Order Table Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left order-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                    <th className="px-8 py-6">Transaction Ref</th>
                                    <th className="py-6 px-4">Customer Entity</th>
                                    <th className="py-6 px-4">Financials</th>
                                    <th className="py-6 px-4 text-center">Settlement Status</th>
                                    <th className="py-6 px-4 text-center">Current Phase</th>
                                    <th className="px-8 py-6 text-right">View Log</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <ApnaCartLoader centered={true} size={80} />
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <SearchX size={48} className="text-zinc-400" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">No matching records</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const isExpanded = expandedId === order.id;
                                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className={`group transition-all duration-300 ${isExpanded ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <p className="font-black text-zinc-900 dark:text-white tracking-tighter text-sm mb-1 uppercase">#{order.order_number || `ORD-${order.id}`}</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px] font-black text-zinc-500 group-hover:text-emerald-500 transition-colors uppercase">
                                                                {order.user?.name?.[0] || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black text-zinc-900 dark:text-white text-[11px] truncate uppercase tracking-tight">{order.user?.name || 'Guest User'}</p>
                                                                <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mt-0.5">{order.user?.phone || 'Private'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-[15px]">₹{parseFloat(order.total_price).toFixed(0)}</span>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed ${PAY_STATUS_COLORS[order.payment_status] || PAY_STATUS_COLORS.pending}`}>
                                                                {order.payment_status?.toUpperCase() || 'PENDING'}
                                                            </span>
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{order.payment_method || 'COD'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} border border-transparent shadow-sm`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isExpanded ? 'bg-zinc-900 dark:bg-emerald-500 text-white shadow-xl' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500 border border-zinc-100 dark:border-zinc-700'}`}
                                                        >
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </button>
                                                    </td>
                                                </tr>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.tr
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-zinc-50/30 dark:bg-zinc-950/20"
                                                        >
                                                            <td colSpan={6} className="p-10">
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-3 px-2">
                                                                            <Package size={16} className="text-emerald-500" />
                                                                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Full Package Manifest</span>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {order.items?.map(item => (
                                                                                <div key={item.id} className="flex items-center gap-5 bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                                                                                        {item.product?.image_url ? (
                                                                                            <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex items-center justify-center opacity-30 text-zinc-400"><Package size={20} /></div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="font-black text-zinc-900 dark:text-white text-[13px] uppercase tracking-tight truncate">{item.product_name || item.product?.name || 'Deluxe Item'}</p>
                                                                                        <div className="flex items-center gap-3 mt-1.5">
                                                                                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-[15px] font-black text-zinc-900 dark:text-white tracking-widest">₹{parseFloat(item.unit_price * item.quantity).toFixed(0)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-8">
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center gap-3 px-2">
                                                                                <MapPin size={16} className="text-rose-500" />
                                                                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Logistics Terminal</span>
                                                                            </div>
                                                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                                                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase leading-loose tracking-wider">
                                                                                    {order.address || 'Direct Merchant Handover Protocol'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-zinc-950 dark:bg-black p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl border border-white/5 relative">
                                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                                                                <span>Ledger Statement</span>
                                                                                <ShieldCheck size={14} />
                                                                            </div>

                                                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                                                    <span>Settlement Unit</span>
                                                                                    <span className="text-white">{(order.payment_method || 'COD').toUpperCase()}</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="pt-8 mt-4 border-t-4 border-white/10 flex justify-between items-end">
                                                                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500">Gross total</span>
                                                                                <div className="flex items-end gap-2">
                                                                                    <span className="text-3xl font-black tracking-tighter leading-none">₹{parseFloat(order.total_price).toFixed(0)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                             </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Elements>
    );
};

export default Orders; 
