import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { 
    Package, 
    Activity, 
    ShoppingBag,
    History as HistoryIcon,
    AlertCircle,
    Loader2,
    CreditCard,
    Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const MerchantPOS = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(null); // Track which order is being processed
    const [packedItems, setPackedItems] = useState({}); // Track packing checklist
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        fetchMerchantData();
        const interval = setInterval(fetchMerchantData, 15000); 
        return () => clearInterval(interval);
    }, []);

    const fetchMerchantData = async () => {
        try {
            const response = await orderService.getAllOrders();
            const allOrders = response.data.data || [];
            const merchantOrders = allOrders.filter(o => o.merchant_id === user?.merchant?.id);
            setOrders(merchantOrders.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Merchant fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const togglePacked = (orderId, itemIndex) => {
        const key = `${orderId}-${itemIndex}`;
        setPackedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAction = async (orderId, currentStatus, type) => {
        if (isProcessing) return;
        setIsProcessing(orderId);

        const flow = ['placed', 'accepted', 'preparing', 'ready'];
        if (type === 'pickup' && currentStatus === 'ready') {
            try { 
                await orderService.updateStatus(orderId, 'picked_up'); 
                await fetchMerchantData(); 
                toast.success("Order Complete"); 
            } catch (e) { toast.error("Handover failed"); }
            finally { setIsProcessing(null); }
            return;
        }

        const nextStatus = flow[flow.indexOf(currentStatus) + 1];
        if (!nextStatus) {
            setIsProcessing(null);
            return;
        }

        try {
            await orderService.updateStatus(orderId, nextStatus);
            await fetchMerchantData();
            toast.success(`Moved to ${nextStatus.toUpperCase()}`);
        } catch (error) {
            toast.error("Process failed");
        } finally {
            setIsProcessing(null);
        }
    };

    // DIVIDE ORDERS BY ROLE
    const activeOperationOrders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
    const incomingOrders = orders.filter(o => o.status === 'placed');

    const steps = ['placed', 'accepted', 'preparing', 'ready', 'delivered'];

    return (
        <div className="space-y-12 pb-20 font-sans max-w-[1240px] mx-auto min-h-screen pt-6 text-left">
            {loading ? (
                <div className="py-40 flex items-center justify-center"><ApnaCartLoader centered={true} size={80} /></div>
            ) : (
                <>
                    {/* LIVE OPERATION FEED - MULTIPLE HEROES */}
                    <div className="space-y-8">
                        {activeOperationOrders.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {activeOperationOrders.map((order, idx) => {
                                    const currentStepIndex = steps.indexOf(order.status);
                                    const processing = isProcessing === order.id;
                                    return (
                                        <motion.div 
                                            key={order.id}
                                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                            className="bg-zinc-900 border-2 border-white dark:border-zinc-800 rounded-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] p-10 overflow-hidden relative group"
                                        >
                                            <div className="flex flex-col lg:flex-row justify-between gap-8 items-start">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Active Operation Node #{idx + 1}</p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-5 mb-8">
                                                        <div className="bg-white/10 w-14 h-14 rounded-none flex items-center justify-center text-white border border-white/10 shrink-0">
                                                            <Package size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h2 className="text-3xl font-black text-white tracking-widest uppercase italic leading-none">{order.order_number || `ORD-${order.id}`}</h2>
                                                                <div className={`px-3 py-1 rounded-none text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border ${order.payment_method?.toLowerCase() === 'cod' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                                    {order.payment_method?.toLowerCase() === 'cod' ? <Banknote size={10} /> : <CreditCard size={10} />}
                                                                    {order.payment_method || 'COD'}
                                                                </div>
                                                            </div>
                                                            <p className="text-zinc-500 font-bold uppercase text-[9px] mt-2 tracking-widest italic">{order.user?.name || 'Customer'}</p>
                                                        </div>
                                                    </div>

                                                    {/* STEPPER SYSTEM - SMALLER */}
                                                    <div className="relative mt-2 mb-8 px-4">
                                                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/5 -translate-y-1/2 rounded-none" />
                                                        <div className="absolute top-1/2 left-4 h-1 bg-blue-500 -translate-y-1/2 rounded-none shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-700" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} />

                                                        <div className="relative flex justify-between">
                                                            {steps.slice(0, 4).map((s, i) => {
                                                                const active = i <= currentStepIndex;
                                                                return (
                                                                    <div key={s} className="flex flex-col items-center">
                                                                        <div className={`w-10 h-10 rounded-none flex items-center justify-center z-10 transition-all duration-500 ${active ? 'bg-blue-600 text-white scale-110 shadow-xl' : 'bg-zinc-800 border-2 border-zinc-700 text-zinc-600'}`}>
                                                                            {i < currentStepIndex ? <Package size={16} /> : active ? <Activity size={16} /> : <div className="w-1 h-1 rounded-none bg-zinc-600" />}
                                                                        </div>
                                                                        <p className={`mt-4 text-[7px] font-black uppercase tracking-widest italic hidden md:block ${active ? 'text-white' : 'text-zinc-600'}`}>{s.replace(/_/g, ' ')}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-10 h-10 rounded-none bg-zinc-800 border-2 border-zinc-700 opacity-20 flex items-center justify-center">
                                                                    <div className="w-3 h-3 border-2 border-dashed border-zinc-400 rounded-none" />
                                                                </div>
                                                                <p className="mt-4 text-[7px] font-black uppercase tracking-widest italic text-zinc-600 hidden md:block uppercase">Delivered</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full lg:w-[360px] bg-white/5 rounded-none p-7 border border-white/10 flex flex-col h-full">
                                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4 italic flex items-center gap-2">
                                                        <ShoppingBag size={12} className="text-blue-500" />
                                                        Packing Checklist
                                                    </p>
                                                    <div className="space-y-2 mb-6 overflow-y-auto max-h-[140px] custom-scrollbar pr-2 flex-1">
                                                        {order.items?.map((item, i) => {
                                                            const isPacked = packedItems[`${order.id}-${i}`];
                                                            return (
                                                                <button 
                                                                    key={i} 
                                                                    onClick={() => togglePacked(order.id, i)}
                                                                    className={`w-full flex justify-between items-center p-3 rounded-none border transition-all ${isPacked ? 'bg-emerald-500/10 border-emerald-500/20 opacity-50 scale-[0.98]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1 truncate">
                                                                        <div className={`w-5 h-5 rounded-none flex items-center justify-center transition-all text-[8px] font-black ${isPacked ? 'bg-emerald-500 text-white' : 'bg-white/10 text-zinc-500'}`}>
                                                                            {isPacked ? '✓' : i + 1}
                                                                        </div>
                                                                        <span className={`text-[10px] font-black uppercase italic truncate ${isPacked ? 'text-emerald-500 line-through' : 'text-white'}`}>
                                                                            {item.product_name || item.product?.name}
                                                                            {(item.variant_name || item.variant?.quantity || item.variant?.name) && (item.variant_name !== 'Standard' && item.variant?.quantity !== 'Standard') ? ` ${item.variant_name || item.variant?.quantity || item.variant?.name}` : ''}
                                                                        </span>
                                                                    </div>
                                                                    <span className={`px-2 py-0.5 rounded-none text-[9px] font-black italic ${isPacked ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-900'}`}>x{item.quantity}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    <button 
                                                        disabled={processing}
                                                        onClick={() => handleAction(order.id, order.status, order.order_type)}
                                                        className={`w-full h-13 py-4 bg-white text-zinc-900 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                                                    >
                                                        {processing ? <Loader2 size={14} className="animate-spin" /> : null}
                                                        {processing ? 'Processing...' : (order.status === 'ready' ? 'Complete Order' : 'Next Stage')}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        ) : (
                            <div className="py-24 text-center opacity-30 flex flex-col items-center">
                                <HistoryIcon size={48} className="text-zinc-400 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Operational Stack Empty</p>
                            </div>
                        )}
                    </div>

                    {/* INCOMING QUEUE SECTION - SMALLER ROWS */}
                    <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-none shadow-sm italic font-black text-[10px] border border-zinc-100 dark:border-zinc-800"> QUEUE </div>
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Pending Deployments</h3>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-none text-[8px] font-black uppercase tracking-widest border border-blue-100 italic">
                                {incomingOrders.length} New Tasks
                            </span>
                        </div>

                        <div className="grid divide-y divide-zinc-50 dark:divide-zinc-800">
                            {incomingOrders.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center opacity-20">
                                    <AlertCircle size={48} className="text-zinc-200 mb-4" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">No pending threads</p>
                                </div>
                            ) : incomingOrders.map(order => {
                                const processing = isProcessing === order.id;
                                return (
                                    <div key={order.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 px-8 py-6 items-center hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-all group">
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">Queue Allocation</p>
                                                <div className={`px-2 py-0.5 rounded-none text-[7px] font-black uppercase tracking-widest border ${order.payment_method?.toLowerCase() === 'cod' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                                    {order.payment_method || 'COD'}
                                                </div>
                                            </div>
                                            <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{order.order_number || `ORD-${order.id}`}</h4>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">{order.user?.name || 'Customer'}</p>
                                        </div>
                                        
                                        <div className="text-center md:block hidden">
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic mb-1">Price Point</p>
                                            <p className="text-xs font-black text-zinc-900 dark:text-white tracking-widest italic font-mono">₹{order.total_price}</p>
                                        </div>

                                        <div className="text-center md:block hidden">
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic mb-1">Timestamp</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase italic">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <button 
                                                disabled={isProcessing}
                                                onClick={() => handleAction(order.id, 'placed', order.order_type)}
                                                className={`h-11 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-none text-[9px] font-black uppercase tracking-[0.15em] shadow-lg transition-all flex items-center gap-2 ${isProcessing ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
                                            >
                                                {processing ? <Loader2 size={12} className="animate-spin" /> : null}
                                                {processing ? '...' : 'Take Task'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MerchantPOS; 
