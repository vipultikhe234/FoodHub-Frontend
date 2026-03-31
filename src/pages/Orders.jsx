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
    Archive
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

const PAY_STATUS = {
    paid: 'bg-emerald-500 text-white',
    pending: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
    failed: 'bg-red-500 text-white',
    refunded: 'bg-zinc-900 text-white',
};

import { useMerchant } from '../contexts/MerchantContext';

const Orders = () => {
    const { selectedMerchantId } = useMerchant();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [stripeModal, setStripeModal] = useState({ show: false, orderId: null });
    const [clientSecret, setClientSecret] = useState('');
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
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

    const handleStatusChange = async (id, newStatus) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        if (newStatus === 'delivered' && order.payment_status !== 'paid') {
            setUpdatingId(id);
            try {
                const response = await orderService.initiatePayment(id);
                setClientSecret(response.data.data.client_secret);
                setPendingStatusUpdate({ id, status: newStatus });
                setStripeModal({ show: true, orderId: id });
                return;
            } catch (error) {
                toast.error(`Failed to initiate payment: ${error.message}`);
                setUpdatingId(null);
                return;
            }
        }

        const prevStatus = order.status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, newStatus);
            toast.success("Order status updated");
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
            toast.error(`Status update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentSuccess = async () => {
        if (!pendingStatusUpdate) return;
        const { id, status } = pendingStatusUpdate;

        try {
            await orderService.updateStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status, payment_status: 'paid' } : o));
            setStripeModal({ show: false, orderId: null });
            setPendingStatusUpdate(null);
            toast.success("Payment verified and order updated");
        } catch (error) {
            toast.error(`Update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentStatusChange = async (id, newPayStatus) => {
        const prevPayStatus = orders.find(o => o.id === id)?.payment_status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newPayStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updatePaymentStatus(id, newPayStatus);
            toast.success("Payment status updated");
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPayStatus } : o));
            toast.error(`Payment update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
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
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Order Management</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Monitor and manage live customer transactions.</p>
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
                                placeholder="SEARCH TRANSACTIONS..."
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-56 transition-all dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {!isMerchant && (
                            <div className="relative group hidden md:block">
                                <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <select
                                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer dark:text-white"
                                    value={selectedMerchantCategoryId}
                                    onChange={(e) => setSelectedMerchantCategoryId(e.target.value)}
                                >
                                    <option value="">ALL SEGMENTS</option>
                                    {merchantCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                            </div>
                        )}
                        
                        <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <Package size={20} strokeWidth={3} />
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
                                <div className={`absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform ${isActive ? 'text-white' : 'text-emerald-500'}`}>
                                    <Package size={32} />
                                </div>
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
                                    <th className="px-8 py-6">Reference</th>
                                    <th className="py-6 px-4">Customer</th>
                                    <th className="py-6 px-4">Valuation</th>
                                    <th className="py-6 px-4 text-center">Payment</th>
                                    <th className="py-6 px-4 text-center">Status</th>
                                    <th className="py-6 px-4 text-center">Update</th>
                                    <th className="px-8 py-6 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <ApnaCartLoader centered={true} size={80} />
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <SearchX size={48} className="text-zinc-400" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">No matching transactions</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const isExpanded = expandedId === order.id;
                                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                                        const isUpdating = updatingId === order.id;

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className={`group transition-all duration-300 ${isExpanded ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <p className="font-black text-zinc-900 dark:text-white tracking-tighter text-sm mb-1 uppercase">#ORD-{String(order.id).padStart(4, '0')}</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                                {order.merchant && (
                                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                                        {order.merchant.name}
                                                                    </span>
                                                                )}
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
                                                                <p className="text-[9px] text-zinc-400 font-bold tracking-widest truncate max-w-[120px] uppercase mt-0.5">{order.user?.phone || 'Private Number'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-[15px]">₹{parseFloat(order.total_price).toFixed(0)}</span>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <select
                                                                value={order.payment_status || 'pending'}
                                                                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                                disabled={isUpdating}
                                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border-none shadow-sm cursor-pointer ${PAY_STATUS[order.payment_status] || PAY_STATUS.pending}`}
                                                            >
                                                                <option value="pending" className="bg-white text-zinc-900">Pending</option>
                                                                <option value="paid" className="bg-white text-zinc-900">Paid</option>
                                                                <option value="failed" className="bg-white text-zinc-900">Failed</option>
                                                                <option value="refunded" className="bg-white text-zinc-900">Refunded</option>
                                                            </select>
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{order.payment?.payment_method || 'COD'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} border border-transparent shadow-sm`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 px-4 text-center">
                                                        <div className="relative group/select">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                disabled={isUpdating}
                                                                className="w-24 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[9px] font-black uppercase rounded-xl px-3 py-2 outline-none border border-zinc-200 dark:border-zinc-700 tracking-widest cursor-pointer shadow-inner appearance-none text-center"
                                                            >
                                                                <option value="placed">Placed</option>
                                                                <option value="accepted">Accept</option>
                                                                <option value="preparing">Prep</option>
                                                                <option value="ready">Ready</option>
                                                                <option value="out_for_delivery">Ship</option>
                                                                <option value="delivered">Done</option>
                                                                <option value="picked_up">Pick</option>
                                                                <option value="cancelled">Void</option>
                                                            </select>
                                                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none opacity-0 group-hover/select:opacity-100 transition-opacity" />
                                                        </div>
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
                                                            <td colSpan={7} className="p-10">
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-3 px-2">
                                                                            <Package size={16} className="text-emerald-500" />
                                                                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Package Manifest</span>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {order.items?.map(item => (
                                                                                <div key={item.id} className="flex items-center gap-5 bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group hover:shadow-md transition-shadow">
                                                                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform">
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
                                                                                            {item.variant_name && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter truncate max-w-[100px]">{item.variant_name}</span>}
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
                                                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner relative overflow-hidden">
                                                                                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase leading-loose tracking-wider relative z-10">
                                                                                    {order.address || 'Standard Handover Protocol'}
                                                                                </p>
                                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[60px] rounded-full" />
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-zinc-950 dark:bg-black p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden border border-white/5">
                                                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
                                                                            
                                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                                                                <span>Ledger Summary</span>
                                                                                <ShieldCheck size={14} />
                                                                            </div>

                                                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                                                    <span>Value Flow</span>
                                                                                    <span className="text-white">₹{(order.total_price + (parseFloat(order.discount) || 0)).toFixed(0)}</span>
                                                                                </div>
                                                                                {parseFloat(order.discount) > 0 && (
                                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                                                        <span>Reward Offset</span>
                                                                                        <span>-₹{parseFloat(order.discount).toFixed(0)}</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                                                    <span>Settlement</span>
                                                                                    <span className="text-white">{(order.payment?.payment_method || 'COD').toUpperCase()}</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="pt-8 mt-4 border-t-4 border-white/10 flex justify-between items-end">
                                                                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500">Net total</span>
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

            {stripeModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
                        <StripePayment
                            clientSecret={clientSecret}
                            orderId={stripeModal.orderId}
                            onSucceeded={handlePaymentSuccess}
                            onCancel={() => {
                                setStripeModal({ show: false, orderId: null });
                                setUpdatingId(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </Elements>
    );
};

export default Orders;
