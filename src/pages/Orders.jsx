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
    History as HistoryIcon,
    Store,
    Calendar
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
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [merchantCategories, setMerchantCategories] = useState([]);
    const [selectedMerchantCategoryId, setSelectedMerchantCategoryId] = useState('');

    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isMerchant = user.role === 'merchant' || user.role === 'Merchant';

    useEffect(() => {
        fetchOrders();
        if (!isMerchant) {
            merchantCategoryService.adminGetAll().then(res => setMerchantCategories(res.data.data || []));
        }
    }, [selectedMerchantId, startDate, endDate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                merchant_id: selectedMerchantId,
                start_date: `${startDate} 00:00:00`,
                end_date: `${endDate} 23:59:59`
            };
            const response = await orderService.getAllOrders(params);
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
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Order Records</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">View and manage all your merchant orders</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 border-r border-zinc-100 dark:border-zinc-800">
                                <Calendar size={14} className="text-zinc-900 dark:text-white" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none text-[10px] font-black uppercase outline-none text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none text-[10px] font-black uppercase outline-none text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={fetchOrders}
                            className="p-3 bg-zinc-900 dark:bg-emerald-500 border border-transparent rounded-none text-white shadow-xl active:scale-95 transition-all"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>

                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="SEARCH BY ID, CUSTOMER OR PHONE..."
                                className="w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-none flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <HistoryIcon size={18} strokeWidth={3} />
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
                                className={`p-4 rounded-none border transition-all text-left relative overflow-hidden group ${isActive
                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className={`w-1 h-1 rounded-none ${isActive ? 'bg-white animate-pulse' : cfg.dot}`}></div>
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-white/70' : 'text-zinc-400'}`}>{cfg.label}</span>
                                </div>
                                <p className={`text-xl font-black tracking-tight leading-none ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                    {count}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Order Table Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
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
                                                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-none flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px] font-black text-zinc-500 group-hover:text-emerald-500 transition-colors uppercase">
                                                                {order.user?.name?.[0] || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black text-zinc-900 dark:text-white text-[11px] truncate uppercase tracking-tight">{order.user?.name || 'Guest User'}</p>
                                                                <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mt-0.5">{order.user?.phone || 'Private'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-[15px]">
                                                                ₹{parseFloat(isMerchant ? (order.calculations?.merchant_payout || 0) : order.total_price).toFixed(2)}
                                                            </span>
                                                            <div className="w-1 h-1 rounded-none bg-zinc-200 dark:bg-zinc-800" />
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                                {isMerchant ? 'Payout' : 'Total'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`px-4 py-2 rounded-none text-[9px] font-black uppercase tracking-widest border border-dashed ${PAY_STATUS_COLORS[order.payment_status] || PAY_STATUS_COLORS.pending}`}>
                                                                {order.payment_status?.toUpperCase() || 'PENDING'}
                                                            </span>
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{order.payment_method || 'COD'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} border border-transparent shadow-sm`}>
                                                            <span className={`w-1.5 h-1.5 rounded-none ${cfg.dot}`}></span>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                            className={`w-10 h-10 flex items-center justify-center rounded-none transition-all ${isExpanded ? 'bg-zinc-900 dark:bg-emerald-500 text-white shadow-xl' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500 border border-zinc-100 dark:border-zinc-700'}`}
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
                                                                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Order Items</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-2.5">
                                                                            {order.items?.map(item => {
                                                                                const product = item.product;
                                                                                const imageUrl = product?.image?.startsWith('http') ? product.image : (product?.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${product.image}` : null);
                                                                                return (
                                                                                    <div key={item.id} className="group flex items-center gap-4 bg-white dark:bg-zinc-800/40 px-3 py-3 rounded-none border border-zinc-100 dark:border-zinc-800/60 hover:border-emerald-500/20 transition-all">
                                                                                        <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-none overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                                                                                            {imageUrl ? (
                                                                                                <img src={imageUrl} className="w-full h-full object-cover" alt={item.product_name || product?.name} />
                                                                                            ) : (
                                                                                                <Package size={16} className="text-zinc-400 opacity-40" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="font-black text-zinc-900 dark:text-white text-[11px] uppercase tracking-tight truncate">
                                                                                                {item.product_name || product?.name || 'Item'}
                                                                                            </p>
                                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">{item.quantity}x Units</span>
                                                                                                {(item.variant_name || item.variant?.name) && (item.variant_name !== 'Standard' && item.variant?.name !== 'Standard') && (
                                                                                                    <span className="text-[8px] font-bold text-zinc-400 capitalize tracking-widest">• {item.variant_name || item.variant?.name}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="text-right shrink-0">
                                                                                            <p className="text-[13px] font-black text-zinc-900 dark:text-white tracking-tight">₹{parseFloat(item.price * item.quantity).toFixed(2)}</p>
                                                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase mt-0.5 tracking-tighter">₹{parseFloat(item.price).toFixed(2)}/u</p>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-8">
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center gap-3 px-2">
                                                                                <MapPin size={16} className="text-rose-500" />
                                                                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Delivery Address</span>
                                                                            </div>
                                                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                                                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase leading-loose tracking-wider">
                                                                                    {order.address || 'Direct Merchant Handover Protocol'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* 1. MERCHANT SETTLEMENT (Unified Calculation) */}
                                                                        <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-8 rounded-none border border-zinc-100 dark:border-zinc-800/50 space-y-6">
                                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                                                                <span>Merchant Settlement</span>
                                                                                <Store size={14} className="text-emerald-500" />
                                                                            </div>

                                                                            <div className="space-y-4 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                                                                    <span>Items Subtotal</span>
                                                                                    <span>₹{parseFloat(order.calculations?.base_subtotal || 0).toFixed(2)}</span>
                                                                                </div>

                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                                                                                    <span>GST on Items ({order.calculations?.items_gst_percent || 0}%)</span>
                                                                                    <span>₹{parseFloat(order.calculations?.items_gst || 0).toFixed(2)}</span>
                                                                                </div>

                                                                                <div className="space-y-1">
                                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                                                                        <span>Packaging Fee</span>
                                                                                        <span>₹{parseFloat(order.calculations?.packaging_fee || 0).toFixed(2)}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                                                                                        <span>GST on Packaging</span>
                                                                                        <span>₹{parseFloat(order.calculations?.packaging_tax || 0).toFixed(2)}</span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-rose-500 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                                                    <span>Commission ({order.calculations?.commission_rate})</span>
                                                                                    <span className="font-bold">-₹{parseFloat(order.calculations?.merchant_commission || 0).toFixed(2)}</span>
                                                                                </div>

                                                                                {parseFloat(order.calculations?.merchant_adjustment || 0) < 0 && (
                                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-rose-500">
                                                                                        <span>Merchant Coupon Discount</span>
                                                                                        <span className="font-bold">-₹{Math.abs(parseFloat(order.calculations?.merchant_adjustment)).toFixed(2)}</span>
                                                                                    </div>
                                                                                )}

                                                                                <div className="pt-6 mt-2 border-t-2 border-zinc-900 dark:border-zinc-100 flex justify-between items-end">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Final Payout</span>
                                                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Settled to Wallet</span>
                                                                                    </div>
                                                                                    <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{parseFloat(order.calculations?.merchant_payout || 0).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* 2. ADMIN REVENUE (Only for Admin) */}
                                                                        {!isMerchant && (
                                                                            <div className="bg-zinc-950 dark:bg-black p-8 rounded-none text-white space-y-6 shadow-2xl border border-white/5 relative overflow-hidden">
                                                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-5 rounded-none" />
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                                                                    <span>Platform Profit</span>
                                                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                                                </div>

                                                                                <div className="space-y-4 pt-1 border-t border-white/5">
                                                                                    <div className="space-y-1">
                                                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                                                            <span>Platform Service Fee</span>
                                                                                            <span className="text-white">₹{parseFloat(order.calculations?.platform_fee || 0).toFixed(2)}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-4 border-l border-zinc-800">
                                                                                            <span>GST on Platform</span>
                                                                                            <span>₹{parseFloat(order.calculations?.platform_tax || 0).toFixed(2)}</span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                                                        <span>Commission from Merchant</span>
                                                                                        <span>+₹{parseFloat(order.calculations?.merchant_commission || 0).toFixed(2)}</span>
                                                                                    </div>

                                                                                    {order.calculations?.is_admin_coupon && (
                                                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-rose-400">
                                                                                            <span>Platform Funded Coupon</span>
                                                                                            <span>-₹{parseFloat(order.coupon_discount || 0).toFixed(2)}</span>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="pt-6 mt-2 border-t border-white/10 flex justify-between items-end">
                                                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Net Platform Profit</span>
                                                                                        <div className="text-right">
                                                                                            <span className="text-xl font-black text-white tracking-tighter block">₹{parseFloat(order.calculations?.admin_profit || 0).toFixed(2)}</span>
                                                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                                                                {Math.round((parseFloat(order.calculations?.admin_profit || 0) / parseFloat(order.total_price)) * 100)}% Margin
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* 3. CUSTOMER TOTAL (Admin Only) */}
                                                                        {!isMerchant && (
                                                                            <div className="flex justify-between items-center px-4 py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-none opacity-60">
                                                                                <span className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Paid by Customer</span>
                                                                                <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">₹{parseFloat(order.total_price).toFixed(2)}</span>
                                                                            </div>
                                                                        )}
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
