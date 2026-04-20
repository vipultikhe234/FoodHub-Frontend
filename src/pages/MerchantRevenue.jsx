import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Search,
    Filter,
    Wallet,
    ArrowRight,
    IndianRupee,
    ReceiptText,
    Percent,
    Package,
    Truck,
    CreditCard,
    ShieldCheck,
    ChevronRight,
    SearchX,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Store,
    LayoutDashboard,
    ClipboardList,
    RefreshCw,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsService, MerchantService } from '../services/api';
import { useMerchant } from '../contexts/MerchantContext';
import ApnaCartLoader from '../components/ApnaCartLoader';
import { toast } from 'react-hot-toast';

const MerchantRevenue = () => {
    const { selectedMerchantId, setSelectedMerchantId, merchants } = useMerchant();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isAdmin = user.role === 'admin';

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRevenueReport();
    }, [startDate, endDate, selectedMerchantId]);

    const fetchRevenueReport = async () => {
        try {
            setLoading(true);
            const params = {
                start_date: `${startDate} 00:00:00`,
                end_date: `${endDate} 23:59:59`,
                merchant_id: selectedMerchantId
            };
            const response = await analyticsService.getRevenueReport(params);
            setSummary(response.data.summary);
            setOrders(response.data.orders);
            if (response.data.orders.length > 0) {
                setSelectedOrder(response.data.orders[0]);
            } else {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error fetching revenue report:', error);
            toast.error('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const search = searchTerm.toLowerCase();
        const orderNum = (order.order_number || '').toLowerCase();
        const userName = (order.user?.name || 'Guest User').toLowerCase();
        return orderNum.includes(search) || userName.includes(search);
    });

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-zinc-900 p-3.5 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rounded-none`} />
            <div className="flex justify-between items-start mb-2.5">
                <div className={`p-2 rounded-none bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-all`}>
                    <Icon size={16} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                {typeof value === 'number' && (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('profit') || title.toLowerCase().includes('payout'))
                    ? `₹${value.toLocaleString()}`
                    : value}
            </h3>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Filter Row */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">Merchant Revenue Intelligence</h1>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500" />
                        Financial settlement & profit analysis module
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 p-1.5 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-zinc-100 dark:border-zinc-800">
                            <Calendar size={16} className="text-zinc-900 dark:text-white" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase outline-none text-zinc-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase outline-none text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={fetchRevenueReport}
                        className="px-6 py-4 bg-zinc-900 dark:bg-emerald-500 text-white rounded-none shadow-xl active:scale-95 transition-all flex items-center justify-center"
                    >
                        <RefreshCw size={18} className={`text-white ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Orders"
                    value={summary?.total_orders || 0}
                    icon={ClipboardList}
                    color="from-blue-500 to-indigo-600"
                />
                <StatCard
                    title={isAdmin ? "Total Gross Revenue" : "My Total Revenue"}
                    value={isAdmin ? (summary?.total_revenue || 0) : (summary?.total_merchant_payout || 0)}
                    icon={TrendingUp}
                    color="from-emerald-500 to-teal-600"
                />
                {isAdmin ? (
                    <>
                        <StatCard
                            title="Total Net Profit"
                            value={summary?.total_admin_profit || 0}
                            icon={ShieldCheck}
                            color="from-purple-500 to-pink-600"
                        />
                        <StatCard
                            title="Total Merchant Payout"
                            value={summary?.total_merchant_payout || 0}
                            icon={Wallet}
                            color="from-amber-500 to-orange-600"
                        />
                    </>
                ) : null}
            </div>

            {/* Main Content: Split Page */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Order List - 5 Columns */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Transaction Feed
                        </h2>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-none">
                            {filteredOrders.length} Records
                        </span>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH BY ORDER ID OR CUSTOMER..."
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all dark:text-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading && orders.length === 0 ? (
                            <div className="py-20 text-center"><ApnaCartLoader size={50} /></div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="py-20 bg-white dark:bg-zinc-900 rounded-none border border-dashed border-zinc-200 dark:border-zinc-800 text-center opacity-40">
                                <SearchX size={40} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No matching transactions</p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    layoutId={`order-${order.id}`}
                                    onClick={() => setSelectedOrder(order)}
                                    whileHover={{ x: 5 }}
                                    className={`p-4 rounded-none border cursor-pointer transition-all ${selectedOrder?.id === order.id
                                        ? 'bg-zinc-900 dark:bg-emerald-500 border-zinc-900 dark:border-emerald-500 text-white shadow-xl shadow-zinc-900/20 dark:shadow-emerald-500/30'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className={`text-[12px] font-black tracking-tighter mb-1 ${selectedOrder?.id === order.id ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                                #{order.order_number}
                                            </p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-white/60' : 'text-zinc-400'}`}>
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-none text-[8px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            PAID
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-none flex items-center justify-center text-[10px] font-black ${selectedOrder?.id === order.id ? 'bg-white/10 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {order.user?.name?.[0]?.toUpperCase() || 'G'}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className={`text-[10px] font-black uppercase tracking-tight truncate max-w-[120px] ${selectedOrder?.id === order.id ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                                    {order.user?.name || 'Guest User'}
                                                </p>
                                                {isAdmin && (
                                                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${selectedOrder?.id === order.id ? 'text-white/40' : 'text-emerald-500'}`}>
                                                        {order.merchant?.name || 'Retail Partner'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[16px] font-black tracking-tighter ${selectedOrder?.id === order.id ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                                ₹{parseFloat(order.total_price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Detailed View - 7 Columns */}
                <div className="lg:col-span-7 sticky top-24">
                    <AnimatePresence mode="wait">
                        {selectedOrder ? (
                            <motion.div
                                key={selectedOrder.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 shadow-sm h-full relative overflow-hidden"
                            >
                                {/* Detail Header */}
                                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-none flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                            <ReceiptText className="text-emerald-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Order Breakdown</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Transaction Ref: {selectedOrder.order_number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <ShieldCheck size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Payment</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedOrder.payment_method}</p>
                                    </div>
                                </div>

                                <div className="p-5 space-y-6">
                                    {/* Order Items */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Order Items</span>
                                            <span className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-none">{selectedOrder.items?.length} Items</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {selectedOrder.items?.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                                    <span>
                                                        {item.quantity}x {item.product?.name || item.product_name || 'Item'}
                                                        {(item.variant?.name || item.variant?.quantity || item.variant_name) && (item.variant?.name !== 'Standard' && item.variant_name !== 'Standard') ? ` (${item.variant?.name || item.variant?.quantity || item.variant_name})` : ''}
                                                    </span>
                                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 1. MERCHANT SETTLEMENT */}
                                    <div className="bg-zinc-50 dark:bg-zinc-800/20 p-4 rounded-none border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Store size={14} className="text-emerald-500" />
                                            <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Merchant Settlement</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                                                <span>Items Subtotal</span>
                                                <span>₹{parseFloat(selectedOrder.calculations?.base_subtotal || 0).toFixed(2)}</span>
                                            </div>

                                            <div className="flex justify-between text-[11px] font-bold text-zinc-400 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800">
                                                <span>GST on Items {selectedOrder.calculations?.items_gst_percent > 0 ? `(${selectedOrder.calculations.items_gst_percent}%)` : '(0%)'}</span>
                                                <span>₹{parseFloat(selectedOrder.calculations?.items_gst || 0).toFixed(2)}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                                                    <span>Packaging Fee</span>
                                                    <span>₹{parseFloat(selectedOrder.calculations?.packaging_fee || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-zinc-400 pl-4">
                                                    <span>GST on Packaging</span>
                                                    <span>₹{parseFloat(selectedOrder.calculations?.packaging_tax || 0).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {parseFloat(selectedOrder.calculations?.delivery_fee) > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                                                        <span>Delivery Fee</span>
                                                        <span>₹{parseFloat(selectedOrder.calculations?.delivery_fee || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-zinc-400 pl-4">
                                                        <span>GST on Delivery</span>
                                                        <span>₹{parseFloat(selectedOrder.calculations?.delivery_tax || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-2" />

                                            <div className="flex justify-between text-[11px] font-bold text-rose-500">
                                                <span>Commission Deducted ({selectedOrder.calculations?.commission_rate})</span>
                                                <span>-₹{parseFloat(selectedOrder.calculations?.merchant_commission || 0).toFixed(2)}</span>
                                            </div>

                                            {selectedOrder.calculations?.merchant_adjustment < 0 && (
                                                <div className="flex justify-between text-[11px] font-bold text-rose-500">
                                                    <span>Coupon Discount (Merchant Funded)</span>
                                                    <span>-₹{Math.abs(parseFloat(selectedOrder.calculations?.merchant_adjustment)).toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Final Settlement</span>
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase leading-none">Payout to Merchant</span>
                                                </div>
                                                <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{parseFloat(selectedOrder.calculations?.merchant_payout || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. ADMIN REVENUE - Only visible to Admin */}
                                    {isAdmin && (
                                        <div className="bg-zinc-950 dark:bg-black p-4 rounded-none text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-5 rounded-bl-full" />
                                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                                <ShieldCheck size={14} className="text-purple-400" />
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Platform Profit</h4>
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                                                        <span>Platform Access Fee</span>
                                                        <span>₹{parseFloat(selectedOrder.calculations?.platform_fee || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-zinc-500 pl-4">
                                                        <span>GST on Platform</span>
                                                        <span>₹{parseFloat(selectedOrder.calculations?.tax_breakdown?.platform_gst || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold text-emerald-400">
                                                    <span>Commission from Merchant</span>
                                                    <span>+₹{parseFloat(selectedOrder.calculations?.merchant_commission || 0).toFixed(2)}</span>
                                                </div>
                                                {selectedOrder.calculations?.is_admin_coupon && (
                                                    <div className="flex justify-between text-[11px] font-bold text-rose-400">
                                                        <span>Coupon Discount (Platform Funded)</span>
                                                        <span>-₹{parseFloat(selectedOrder.coupon_discount).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Net Platform Profit</span>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-white tracking-tighter block">₹{parseFloat(selectedOrder.calculations?.admin_profit || 0).toFixed(2)}</span>
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                            {Math.round((selectedOrder.calculations?.admin_profit / selectedOrder.total_price) * 100)}% MARGIN
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* GRAND TOTAL - Only visible to Admin */}
                                    {isAdmin && (
                                        <div className="flex justify-between items-center px-4 py-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-none border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-zinc-900 rounded-none shadow-sm">
                                                    <CreditCard size={18} className="text-zinc-600 dark:text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Paid by Customer</p>
                                                    <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">{selectedOrder.payment_method}</p>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[600px] bg-zinc-50/50 dark:bg-zinc-900/20 rounded-none border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-30">
                                <FileText size={48} className="text-zinc-400 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select a transaction to view intelligence</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MerchantRevenue;
