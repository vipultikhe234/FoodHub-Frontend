import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
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
    SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STATUS_CONFIG = {
    pending: { color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', label: 'Pending' },
    preparing: { color: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', label: 'Preparing' },
    dispatched: { color: 'text-violet-600', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', label: 'Dispatched' },
    delivered: { color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Delivered' },
    cancelled: { color: 'text-rose-600', dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', label: 'Cancelled' },
};

const PAY_STATUS = {
    paid: 'bg-emerald-500 text-white',
    pending: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-400',
    failed: 'bg-rose-500 text-white',
    refunded: 'bg-indigo-500 text-white',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [stripeModal, setStripeModal] = useState({ show: false, orderId: null });
    const [clientSecret, setClientSecret] = useState('');
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAllOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
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
                alert(`Failed to initiate payment: ${error.message}`);
                setUpdatingId(null);
                return;
            }
        }

        const prevStatus = order.status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, newStatus);
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
            alert(`Status update failed`);
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
        } catch (error) {
            alert(`Update failed`);
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
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPayStatus } : o));
            alert(`Payment update failed`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Orders...</p>
        </div>
    );

    return (
        <Elements stripe={stripePromise}>
            <div className="space-y-12 pb-20 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white dark:bg-[#111827] p-10 rounded-[48px] shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                    <div className="space-y-2 relative z-10">
                        <h1 className="text-4xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter italic font-['Outfit'] leading-none">Orders</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]"></div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">{orders.length} Records in Cloud</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchOrders}
                        className="relative z-10 group flex items-center gap-4 bg-slate-900 dark:bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-600/10 active:scale-95 italic"
                    >
                        <RefreshCw size={18} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-500" /> Sync Database
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {['pending', 'preparing', 'dispatched', 'delivered', 'cancelled'].map((key) => {
                        const cfg = STATUS_CONFIG[key];
                        const count = statusCounts[key] || 0;
                        const isActive = filterStatus === key;
                        return (
                            <motion.button
                                key={key}
                                whileHover={{ y: -5 }}
                                onClick={() => setFilterStatus(isActive ? 'all' : key)}
                                className={`p-8 rounded-[40px] border-2 transition-all text-left relative overflow-hidden ${isActive
                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20'
                                    : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#111827] hover:border-indigo-600/30 shadow-premium'
                                    }`}
                            >
                                <div className={`flex items-center gap-3 mb-4`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_8px_white]' : cfg.dot}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest leading-none italic ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{cfg.label}</span>
                                </div>
                                <p className={`text-4xl font-[900] italic tracking-tighter font-['Outfit'] leading-none ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {count}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Order Table Card */}
                <div className="bg-white dark:bg-[#111827] rounded-[56px] shadow-premium border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                                    <th className="px-12 py-8">Order ID</th>
                                    <th className="py-8 px-6">Customer</th>
                                    <th className="py-8 px-6">Total Amount</th>
                                    <th className="py-8 px-6">Payment</th>
                                    <th className="py-8 px-6">Status</th>
                                    <th className="py-8 px-6">Action</th>
                                    <th className="px-12 py-8 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-32 text-center text-slate-300">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <SearchX size={64} strokeWidth={1} />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6">No matching records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const isExpanded = expandedId === order.id;
                                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                        const isUpdating = updatingId === order.id;

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className={`group transition-all duration-500 ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-600/5' : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'}`}>
                                                    <td className="px-12 py-7">
                                                        <div className="flex flex-col">
                                                            <p className="font-[900] text-gray-900 dark:text-white uppercase tracking-tighter text-xl italic leading-none font-['Outfit']">#ORD-{String(order.id).padStart(4, '0')}</p>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">
                                                                {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-7 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-premium border border-slate-100 dark:border-white/5 font-[900] text-lg font-['Outfit'] italic text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                {order.user?.name?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-widest leading-none mb-1">{order.user?.name || 'Guest'}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold italic truncate max-w-[140px] uppercase leading-none">{order.user?.email || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-7 px-6">
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-xs font-black text-indigo-600 mb-1">₹</span>
                                                            <span className="font-[900] text-gray-900 dark:text-white tracking-tighter text-3xl font-['Outfit'] italic leading-none">
                                                                {parseFloat(order.total_price).toFixed(0)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-7 px-6">
                                                        <div className="space-y-2">
                                                            <select
                                                                value={order.payment_status || 'pending'}
                                                                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                                disabled={isUpdating}
                                                                className={`appearance-none px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic w-fit outline-none cursor-pointer border-none shadow-sm ${PAY_STATUS[order.payment_status] || PAY_STATUS.pending}`}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="paid">Paid</option>
                                                                <option value="failed">Failed</option>
                                                                <option value="refunded">Refunded</option>
                                                            </select>
                                                            <div className="flex items-center gap-1.5 pl-2">
                                                                <div className={`w-1 h-1 rounded-full ${order.payment?.payment_method === 'cod' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
                                                                <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">{order.payment?.payment_method || 'COD'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-7 px-6">
                                                        <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.color}`}>
                                                            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${order.status === 'pending' ? 'animate-pulse shadow-[0_0_6px_currentColor]' : ''}`}></span>
                                                            {cfg.label}
                                                        </div>
                                                    </td>
                                                    <td className="py-7 px-6">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            disabled={isUpdating}
                                                            className="bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-300 text-[10px] font-black uppercase rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-indigo-600/5 border border-slate-100 dark:border-white/5 tracking-widest cursor-pointer shadow-inner"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="preparing">Prepare</option>
                                                            <option value="dispatched">Dispatch</option>
                                                            <option value="delivered">Deliver</option>
                                                            <option value="cancelled">Cancel</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-12 py-7 text-right">
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-gray-800 text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 dark:border-white/5'}`}
                                                        >
                                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                        </motion.button>
                                                    </td>
                                                </tr>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.tr
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-slate-50/30 dark:bg-white/[0.01]"
                                                        >
                                                            <td colSpan={7} className="px-12 py-10">
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                    {/* Order Items Section */}
                                                                    <div className="space-y-6">
                                                                        <div className="flex items-center gap-3 pl-2">
                                                                            <Package size={16} className="text-indigo-600" />
                                                                            <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-[0.4em] italic leading-none">Order Content</p>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            {order.items?.map(item => (
                                                                                <div key={item.id} className="flex items-center gap-6 bg-white dark:bg-[#111827] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-premium group/item">
                                                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-gray-900 rounded-2xl overflow-hidden shrink-0 border border-slate-50 dark:border-white/5 group-hover/item:scale-110 transition-transform">
                                                                                        {item.product?.image_url ? (
                                                                                            <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex items-center justify-center opacity-30"><Package size={24} /></div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="font-[900] text-gray-900 dark:text-white text-base tracking-tight font-['Outfit'] italic uppercase leading-none mb-2">{item.product?.name || 'Product'}</p>
                                                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Quantity: {item.quantity}</p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-xl font-[900] text-indigo-600 font-['Outfit'] italic tracking-tighter">₹{parseFloat(item.price * item.quantity).toFixed(0)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Metadata Section */}
                                                                    <div className="space-y-8">
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center gap-3 pl-2">
                                                                                <MapPin size={16} className="text-indigo-600" />
                                                                                <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-[0.4em] italic leading-none">Delivery Target</p>
                                                                            </div>
                                                                            <div className="bg-white dark:bg-[#111827] p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-premium">
                                                                                <p className="text-sm font-bold text-slate-600 dark:text-gray-300 italic leading-relaxed">{order.address || 'Standard System Location'}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center gap-3 pl-2">
                                                                                <IndianRupee size={16} className="text-indigo-600" />
                                                                                <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-[0.4em] italic leading-none">Financial Breakdown</p>
                                                                            </div>
                                                                            <div className="bg-white dark:bg-[#111827] p-8 rounded-[36px] border border-slate-100 dark:border-white/5 shadow-premium space-y-4">
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                                                    <span className="text-slate-400">Net Method</span>
                                                                                    <span className="text-slate-700 dark:text-white italic">{order.payment?.payment_method?.toUpperCase() || 'COD'}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                                                    <span className="text-slate-400">Order Subtotal</span>
                                                                                    <span className="text-slate-700 dark:text-white italic">₹{parseFloat(order.total_price + parseFloat(order.discount || 0)).toFixed(0)}</span>
                                                                                </div>
                                                                                {order.coupon && (
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon Bonus</span>
                                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-600/10 rounded-xl border border-indigo-100 dark:border-indigo-600/20">
                                                                                            <Ticket size={12} className="text-indigo-600" />
                                                                                            <span className="text-[10px] font-black text-indigo-600 uppercase italic leading-none">{order.coupon.code}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {parseFloat(order.discount) > 0 && (
                                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                                                        <span className="text-slate-400">Campaign Discount</span>
                                                                                        <span className="text-rose-500 italic">-₹{parseFloat(order.discount).toFixed(0)}</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-end">
                                                                                    <span className="text-[11px] font-[900] uppercase tracking-[0.3em] font-['Outfit'] italic">Grand Total</span>
                                                                                    <div className="flex items-end gap-1">
                                                                                        <span className="text-lg font-black text-indigo-600 mb-2 italic">₹</span>
                                                                                        <span className="text-5xl font-[900] text-gray-900 dark:text-white tracking-tighter font-['Outfit'] italic leading-none">
                                                                                            {parseFloat(order.total_price).toFixed(0)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                {order.payment?.transaction_id && (
                                                                                    <div className="pt-4 mt-2 flex justify-between items-center border-t border-slate-50 dark:border-white/5">
                                                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Txn Index</span>
                                                                                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">{order.payment.transaction_id}</span>
                                                                                    </div>
                                                                                )}
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
                <StripePayment
                    clientSecret={clientSecret}
                    orderId={stripeModal.orderId}
                    onSucceeded={handlePaymentSuccess}
                    onCancel={() => {
                        setStripeModal({ show: false, orderId: null });
                        setUpdatingId(null);
                    }}
                />
            )}
        </Elements>
    );
};

export default Orders;
