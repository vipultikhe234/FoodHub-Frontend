import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket,
    Plus,
    Trash2,
    Calendar,
    Tag,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Gift,
    IndianRupee,
    ArrowUpRight,
    SearchX,
    X,
    Activity
} from 'lucide-react';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: 0,
        expires_at: '',
        is_active: true
    };

    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/coupons');
            setCoupons(res.data.data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/coupons/${editingId}`, form);
            } else {
                await api.post('/admin/coupons', form);
            }
            setShowModal(false);
            setEditingId(null);
            setForm(initialFormState);
            fetchCoupons();
        } catch (error) {
            alert("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete coupon?")) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            alert("Deletion failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Rewards...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white dark:bg-[#111827] p-10 rounded-[48px] shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-4xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter italic font-['Outfit'] leading-none">Coupons</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]"></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">{coupons.length} Active Rewards</p>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setEditingId(null); setForm(initialFormState); setShowModal(true); }}
                    className="relative z-10 w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.2em] italic"
                >
                    <Plus size={20} strokeWidth={3} /> Add Coupon
                </motion.button>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {coupons.length === 0 ? (
                    <div className="col-span-full py-40 bg-white dark:bg-[#111827] rounded-[56px] shadow-premium border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center opacity-30">
                        <Ticket size={64} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6">No rewards configured</p>
                    </div>
                ) : coupons.map((coupon) => (
                    <motion.div
                        key={coupon.id}
                        whileHover={{ y: -8 }}
                        className="bg-white dark:bg-[#111827] rounded-[48px] border border-gray-100 dark:border-white/5 shadow-premium hover:shadow-2xl transition-all group overflow-hidden relative"
                    >
                        {/* Visual Stripe */}
                        <div className={`absolute top-0 left-0 right-0 h-2 ${coupon.is_active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`}></div>

                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-gray-900 rounded-[28px] flex items-center justify-center text-indigo-600 shadow-inner border border-slate-50 dark:border-white/5">
                                    <Gift size={32} strokeWidth={1.5} />
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            setEditingId(coupon.id);
                                            setForm({
                                                code: coupon.code,
                                                type: coupon.type,
                                                value: coupon.value,
                                                min_order_amount: coupon.min_order_amount,
                                                expires_at: coupon.expires_at.split('T')[0],
                                                is_active: coupon.is_active
                                            });
                                            setShowModal(true);
                                        }}
                                        className="w-10 h-10 bg-slate-50 dark:bg-gray-800 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-all border border-slate-100 dark:border-white/5"
                                    >
                                        <Edit2 size={16} strokeWidth={2.5} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(coupon.id)}
                                        className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center transition-all border border-rose-100 dark:border-rose-500/20 hover:bg-rose-500 hover:text-white"
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} />
                                    </motion.button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-4xl font-[900] text-gray-900 dark:text-white tracking-widest uppercase font-['Outfit'] italic leading-none mb-3 break-all">{coupon.code}</h3>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-600/10 rounded-2xl">
                                    <Tag size={12} className="text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest italic leading-none">
                                        {coupon.type === 'percentage' ? `${coupon.value}% OFF DISCOUNT` : `₹${coupon.value} FLAT REDUCTION`}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-[24px] border border-slate-100 dark:border-white/5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">Min Order</p>
                                    <p className="text-xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic">₹{coupon.min_order_amount}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-[24px] border border-slate-100 dark:border-white/5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">Expires</p>
                                    <p className={`text-xl font-[900] font-['Outfit'] italic ${new Date(coupon.expires_at) < new Date() ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                                        {new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between items-center border-t border-slate-50 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${coupon.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest italic ${coupon.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {coupon.is_active ? 'Status: Active' : 'Status: Paused'}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest group-hover:text-indigo-600 transition-colors">
                                    ID {coupon.id}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Coupon Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-[56px] w-full max-w-lg shadow-3xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 dark:border-white/5 relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                                <div>
                                    <h2 className="text-3xl font-[900] text-gray-900 dark:text-white italic tracking-tighter uppercase font-['Outfit'] leading-none mb-1">
                                        {editingId ? 'Edit Coupon' : 'Add Coupon'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">Promotion Node</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-12 h-12 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    <X size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10 space-y-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Code Field */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Coupon Code</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="E.G. NEWUSER100"
                                            className="w-full h-18 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-[900] text-gray-900 dark:text-white text-xl uppercase tracking-[0.2em] font-['Outfit'] italic shadow-inner border border-transparent focus:border-indigo-600/20"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    {/* Type & Value */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Value Type</label>
                                            <select
                                                className="w-full h-18 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-inner border border-transparent focus:border-indigo-600/20"
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Price (₹)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Reward Amount</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full h-18 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-[900] text-indigo-600 dark:text-indigo-400 text-2xl font-['Outfit'] italic shadow-inner border border-transparent focus:border-indigo-600/20"
                                                value={form.value}
                                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Min Order & Expiry */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Minimum Order (₹)</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full h-18 bg-slate-50 dark:bg-white/5 px-16 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-lg shadow-inner border border-transparent focus:border-indigo-600/20"
                                                    value={form.min_order_amount}
                                                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                                                />
                                                <IndianRupee size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Expiry Date</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full h-18 bg-slate-50 dark:bg-white/5 px-16 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest shadow-inner border border-transparent focus:border-indigo-600/20"
                                                    value={form.expires_at}
                                                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                                />
                                                <Calendar size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <div
                                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className={`p-8 rounded-[36px] cursor-pointer transition-all border-2 flex items-center justify-between ${form.is_active ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-600/5 dark:border-indigo-600/20' : 'bg-slate-50 border-slate-100 dark:bg-white/5 dark:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${form.is_active ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-400'}`}>
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic font-['Outfit'] leading-none mb-1">Live Status</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Availability in checkout node</p>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-8 rounded-full relative transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                            <motion.div
                                                animate={{ x: form.is_active ? 24 : 4 }}
                                                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full h-20 bg-slate-900 dark:bg-indigo-600 text-white rounded-[32px] font-[900] text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 italic"
                                    >
                                        <CheckCircle2 size={24} strokeWidth={3} /> {editingId ? 'Save Edits' : 'Deploy Coupon'}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Coupons;
