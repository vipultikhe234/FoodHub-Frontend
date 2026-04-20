import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
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
    Activity,
    Edit2,
    Loader2,
    Smartphone,
    Store,
    Search,
    Archive,
    ChevronDown,
    Globe2,
    RefreshCw
} from 'lucide-react';

import { useMerchant } from '../contexts/MerchantContext';

const Coupons = () => {
    const { selectedMerchantId } = useMerchant();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // all, active, inactive
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [submitting, setSubmitting] = useState(false);
    const [merchants, setMerchants] = useState([]);
    const isMerchant = user.role === 'merchant' || user.role === 'Merchant';

    const initialFormState = {
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: 0,
        max_discount: '',
        expires_at: '',
        is_active: true,
        merchant_id: selectedMerchantId || '',
        show_on_landing: false,
        is_admin_coupon: !isMerchant
    };

    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        fetchCoupons();
        if (!isMerchant) fetchMerchants();
    }, [selectedMerchantId, statusFilter]);

    const fetchMerchants = async () => {
        try {
            const res = await api.get('/admin/merchants');
            setMerchants(res.data.data || []);
        } catch (error) {
            console.error("Error fetching merchants:", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            let url = `/coupons?status=${statusFilter}`;
            if (selectedMerchantId) {
                url += `&merchant_id=${selectedMerchantId}`;
            }
            const res = await api.get(url);
            setCoupons(res.data.data || []);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation for Admin: Must select merchant OR mark as platform-wide
        if (!isMerchant && !form.merchant_id && !form.is_admin_coupon) {
            return toast.error("Deployment Error: You must either select a Target Merchant OR mark this as a Platform Wide (Admin) coupon.");
        }

        if (submitting) return;
        try {
            setSubmitting(true);
            const payload = { ...form };
            if (selectedMerchantId && !payload.merchant_id) {
                payload.merchant_id = selectedMerchantId;
            }

            if (editingId) {
                await api.put(`/coupons/${editingId}`, payload);
            } else {
                await api.post('/coupons', payload);
            }
            setShowModal(false);
            setEditingId(null);
            setForm(initialFormState);
            fetchCoupons();
            toast.success(editingId ? "Coupon updated successfully" : "Coupon created successfully");
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <span style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    Delete this coupon?
                    <button onClick={async () => { toast.dismiss(t.id); try { await api.delete(`/coupons/${id}`); fetchCoupons(); toast.success("Coupon deleted"); } catch { toast.error("Deletion failed"); }}} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:'0px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>YES</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{background:'#27272a',color:'#fff',border:'none',borderRadius:'0px',padding:'6px 14px',fontWeight:900,cursor:'pointer',fontSize:'10px',letterSpacing:'0.1em'}}>NO</button>
                </span>
            ),
            { duration: 6000 }
        );
    };

    // if (loading) return <ApnaCartLoader />;

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Promo Engine</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Configure rewards and discount manifests.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchCoupons}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="SEARCH PROMO CODES..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-none text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-56 transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-none">
                        <button 
                            onClick={() => setStatusFilter('active')}
                            className={`px-4 py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                            Live
                        </button>
                        <button 
                            onClick={() => setStatusFilter('inactive')}
                            className={`px-4 py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'inactive' ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                            Deactivated
                        </button>
                        <button 
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                            All
                        </button>
                    </div>


                    
                    <button 
                        onClick={() => { setEditingId(null); setForm(initialFormState); setShowModal(true); }}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-none font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Coupon
                    </button>
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-24 text-center">
                        <ApnaCartLoader centered={true} size={80} />
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="col-span-full py-24 bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-30">
                        <Ticket size={48} className="text-zinc-400" />
                        <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No rewards configured</p>
                    </div>
                ) : coupons.filter(coupon => {
                    const matchesSearch = 
                        (coupon.code || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const isDateValid = !coupon.expires_at || new Date(coupon.expires_at).setHours(23,59,59,999) >= new Date().getTime();
                    const isActive = (coupon.is_active == 1 || coupon.is_active == true) && isDateValid;
                    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? isActive : !isActive);
                    return matchesSearch && matchesStatus;
                }).length === 0 ? (
                    <div className="col-span-full py-24 bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-30">
                        <SearchX size={48} className="text-zinc-400" />
                        <p className="text-xs font-bold uppercase tracking-widest mt-4 text-zinc-500">No coupons match your filter</p>
                    </div>
                ) : coupons.filter(coupon => {
                    const matchesSearch = 
                        (coupon.code || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const isDateValid = !coupon.expires_at || new Date(coupon.expires_at).setHours(23,59,59,999) >= new Date().getTime();
                    const isActive = (coupon.is_active == 1 || coupon.is_active == true) && isDateValid;
                    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? isActive : !isActive);
                    return matchesSearch && matchesStatus;
                }).map((coupon) => {
                    const isDateValid = !coupon.expires_at || new Date(coupon.expires_at).setHours(23,59,59,999) >= new Date().getTime();
                    const isActuallyLive = (coupon.is_active == 1 || coupon.is_active == true) && isDateValid;
                    return (
                    <motion.div
                        key={coupon.id}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-none text-emerald-600 dark:text-emerald-400 border border-zinc-100 dark:border-zinc-700">
                                    <Ticket size={24} />
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => {
                                            setEditingId(coupon.id);
                                            setForm({
                                                code: coupon.code,
                                                type: coupon.type,
                                                value: coupon.value,
                                                min_order_amount: coupon.min_order_amount,
                                                max_discount: coupon.max_discount || '',
                                                expires_at: coupon.expires_at.split('T')[0],
                                                is_active: coupon.is_active,
                                                show_on_landing: !!coupon.show_on_landing,
                                                is_admin_coupon: !!coupon.is_admin_coupon
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-zinc-400 hover:text-emerald-600 rounded-none transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded-none transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-widest uppercase mb-1">{coupon.code}</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-[0.1em] mb-3">
                                        <Store size={10} /> {coupon.merchant?.name || 'Global / Platform'}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-none">
                                        <Tag size={10} className="text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                                            {coupon.type === 'percentage' && coupon.max_discount > 0 && ` • UP TO ₹${coupon.max_discount}`}
                                        </span>
                                    </div>
                                </div>
 
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-none border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Min Order</p>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{coupon.min_order_amount}</p>
                                    </div>
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-none border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Expiry</p>
                                        <p className={`text-sm font-bold ${new Date(coupon.expires_at) < new Date() ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                                            {new Date(coupon.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isActuallyLive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActuallyLive ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isActuallyLive ? 'Active' : (!isDateValid ? 'Expired' : 'Paused')}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">
                                        Code #{coupon.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ); })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                        />
                         <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{editingId ? 'Edit Manifest' : 'Initialize Reward'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none text-zinc-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                             <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <form id="couponForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        {/* Admin Scope Selection: Platform Wide vs specific Merchant */}
                                        {!isMerchant && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-none border border-zinc-100 dark:border-zinc-800">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ 
                                                        ...form, 
                                                        is_admin_coupon: !form.is_admin_coupon,
                                                        merchant_id: !form.is_admin_coupon ? '' : form.merchant_id 
                                                    })}
                                                    className={`w-full p-4 rounded-none border-2 transition-all flex items-center justify-between ${form.is_admin_coupon ? 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20 shadow-inner' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-none ${form.is_admin_coupon ? 'bg-rose-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                                            <Globe2 size={16} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-xs font-bold uppercase ${form.is_admin_coupon ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>Platform Wide (Admin)</p>
                                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-tight mt-0.5">Visible to all users vs specific merchant</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-10 h-6 rounded-none relative ${form.is_admin_coupon ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-800'} transition-colors`}>
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${form.is_admin_coupon ? 'translate-x-5' : 'translate-x-1'}`} />
                                                    </div>
                                                </button>

                                                <AnimatePresence mode="wait">
                                                    {!form.is_admin_coupon && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-2 overflow-hidden"
                                                        >
                                                            <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] block pt-2">Assign to Specific Merchant</label>
                                                            <div className="relative">
                                                                <select 
                                                                    className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-zinc-900 border-2 border-rose-500/10 rounded-none outline-none focus:border-rose-500 transition-colors dark:text-white font-bold text-[10px] uppercase appearance-none shadow-sm" 
                                                                    value={form.merchant_id} 
                                                                    onChange={(e) => setForm({ 
                                                                        ...form, 
                                                                        merchant_id: e.target.value,
                                                                        is_admin_coupon: e.target.value ? false : form.is_admin_coupon 
                                                                    })}
                                                                >
                                                                    <option value="">Select Target Merchant</option>
                                                                    {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                                </select>
                                                                <Store size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500" />
                                                                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Promo Code</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="E.G. FESTIVE2024"
                                            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-lg tracking-widest uppercase"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
 
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Structure</label>
                                            <select
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase"
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Price (₹)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Magnitude</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-sm"
                                                value={form.value}
                                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className={`grid gap-4 ${form.type === 'percentage' ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Min Order Threshold</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-sm"
                                                    value={form.min_order_amount}
                                                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                                                />
                                                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            </div>
                                        </div>
                                        
                                        {form.type === 'percentage' ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Max Discount Cap</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder="Optional"
                                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-sm"
                                                        value={form.max_discount}
                                                        onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                                                    />
                                                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Expiry Date</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase"
                                                        value={form.expires_at}
                                                        onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                                    />
                                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {form.type === 'percentage' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Expiry Date</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none outline-none focus:border-emerald-500 transition-colors dark:text-white font-bold text-[10px] uppercase"
                                                    value={form.expires_at}
                                                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                                />
                                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className={`w-full p-4 rounded-none border-2 transition-all flex items-center justify-between ${form.is_active ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20' : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-none ${form.is_active ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                                                <Activity size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase">Live Reward</p>
                                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Visibility in checkout node</p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-none relative ${form.is_active ? 'bg-emerald-500' : 'bg-zinc-300'} transition-colors`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </div>
                                    </button>
 
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, show_on_landing: !form.show_on_landing })}
                                        className={`w-full p-4 rounded-none border-2 transition-all flex items-center justify-between ${form.show_on_landing ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20' : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-none ${form.show_on_landing ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                                                <Smartphone size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-bold uppercase ${form.show_on_landing ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white'}`}>Show on Landing</p>
                                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-tight mt-0.5">Promote on mobile home screen</p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-none relative ${form.show_on_landing ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-800'} transition-colors`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${form.show_on_landing ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </div>
                                    </button>

                                </div>
                            </form>
                        </div>

                            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">Abort</button>
                                <button form="couponForm" type="submit" disabled={submitting} className="flex-[2] py-3 bg-zinc-900 dark:bg-emerald-500 text-white rounded-none font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-zinc-900/10 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {editingId ? 'Save Changes' : 'Deploy Reward'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Coupons;
