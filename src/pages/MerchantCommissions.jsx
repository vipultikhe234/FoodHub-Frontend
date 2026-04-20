import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Store, 
    Percent, 
    Save, 
    RefreshCcw, 
    ExternalLink,
    TrendingUp,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Filter,
    Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MerchantService } from '../services/api';
import toast from 'react-hot-toast';

const MerchantCommissions = () => {
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingIds, setUpdatingIds] = useState([]);
    const [editData, setEditData] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const res = await MerchantService.listAll();
            // Data in ascending order by ID as per request
            const data = res.data.data.sort((a, b) => a.id - b.id);
            setMerchants(data);
            
            // Initialize edit data from and data
            const initialData = {};
            data.forEach(m => {
                initialData[m.id] = {
                    commission_rate: m.other_charges?.commission_rate ?? "5.0",
                    platform_fee: m.other_charges?.platform_fee ?? "10.00",
                    platform_fee_tax: m.other_charges?.platform_fee_tax ?? "18.0"
                };
            });
            setEditData(initialData);
        } catch (error) {
            toast.error('Failed to load merchant network');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (merchantId) => {
        if (updatingIds.includes(merchantId)) return;
        
        const newData = editData[merchantId];
        const currentMerchant = merchants.find(m => m.id === merchantId);
        const oc = currentMerchant?.other_charges || {};
        
        // Final check to prevent redundant saves
        const hasChanges = 
            parseFloat(newData.commission_rate) !== parseFloat(oc.commission_rate || 0) ||
            parseFloat(newData.platform_fee) !== parseFloat(oc.platform_fee || 0) ||
            parseFloat(newData.platform_fee_tax) !== parseFloat(oc.platform_fee_tax || 0);

        if (!hasChanges) return;

        try {
            setUpdatingIds(prev => [...prev, merchantId]);
            await MerchantService.updateMerchant(merchantId, {
                commission_rate: newData.commission_rate,
                platform_fee: newData.platform_fee,
                platform_fee_tax: newData.platform_fee_tax
            });
            toast.success('Monetization policy updated');
            
            // Update local state
            setMerchants(prev => prev.map(m => 
                m.id === merchantId ? { 
                    ...m, 
                    other_charges: { 
                        ...m.other_charges, 
                        commission_rate: newData.commission_rate,
                        platform_fee: newData.platform_fee,
                        platform_fee_tax: newData.platform_fee_tax
                    } 
                } : m
            ));
        } catch (error) {
            toast.error('Sync failure: Policy not saved');
        } finally {
            setUpdatingIds(prev => prev.filter(id => id !== merchantId));
        }
    };

    const filteredMerchants = merchants.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination constants
    const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
    const paginatedMerchants = filteredMerchants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const stats = {
        total: merchants.length,
        active: merchants.filter(m => m.is_active).length,
        avgRate: merchants.length > 0 
            ? (merchants.reduce((acc, m) => acc + (parseFloat(m.other_charges?.commission_rate) || 0), 0) / merchants.length).toFixed(1)
            : 0
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search merchant name or email..." 
                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border-none rounded-2xl pl-11 pr-4 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={fetchMerchants}
                        className="h-12 px-5 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-2xl flex items-center gap-2 border border-zinc-100 dark:border-zinc-800 transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                        <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                        Reload Registry
                    </button>
                    <button className="h-12 w-12 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Merchant Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Partner Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Commission Policy</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Platform Fee (Fixed)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Platform Tax (%)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            <AnimatePresence mode='popLayout'>
                                {paginatedMerchants.map((merchant) => (
                                    <motion.tr
                                        key={merchant.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                    <img src={merchant.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                                        {merchant.id}. {merchant.name}
                                                    </h3>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">{merchant.user?.email}</p>
                                                    <div className="flex gap-1 mt-1.5">
                                                        <span className="text-[7.5px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-sm">
                                                            {merchant.city?.name || 'Global'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[100px]">
                                                <div className="relative flex-1">
                                                    <Percent size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                    <input 
                                                        type="number" 
                                                        step="0.1"
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-2 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500/50 transition-all text-center"
                                                        value={editData[merchant.id]?.commission_rate}
                                                        onChange={(e) => setEditData({ 
                                                            ...editData, 
                                                            [merchant.id]: { ...editData[merchant.id], commission_rate: e.target.value } 
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[100px]">
                                                <div className="relative flex-1">
                                                    <Wallet size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                                                    <input 
                                                        type="number" 
                                                        step="1"
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-2 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-blue-500/50 transition-all text-center"
                                                        value={editData[merchant.id]?.platform_fee}
                                                        onChange={(e) => setEditData({ 
                                                            ...editData, 
                                                            [merchant.id]: { ...editData[merchant.id], platform_fee: e.target.value } 
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[100px]">
                                                <div className="relative flex-1">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-[9px] font-black">%</div>
                                                    <input 
                                                        type="number" 
                                                        step="0.1"
                                                        className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-2 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-amber-500/50 transition-all text-center"
                                                        value={editData[merchant.id]?.platform_fee_tax}
                                                        onChange={(e) => setEditData({ 
                                                            ...editData, 
                                                            [merchant.id]: { ...editData[merchant.id], platform_fee_tax: e.target.value } 
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right SpecialActions">
                                            <button 
                                                disabled={updatingIds.includes(merchant.id)}
                                                onClick={() => handleUpdate(merchant.id)}
                                                className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-[0.2em] transition-all ml-auto ${
                                                    (parseFloat(editData[merchant.id]?.commission_rate) !== parseFloat(merchant.other_charges?.commission_rate || 0)) ||
                                                    (parseFloat(editData[merchant.id]?.platform_fee) !== parseFloat(merchant.other_charges?.platform_fee || 0)) ||
                                                    (parseFloat(editData[merchant.id]?.platform_fee_tax) !== parseFloat(merchant.other_charges?.platform_fee_tax || 0))
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 opacity-40 cursor-not-allowed'
                                                }`}
                                            >
                                                {updatingIds.includes(merchant.id) ? (
                                                    <RefreshCcw size={12} className="animate-spin" />
                                                ) : (
                                                    <Save size={12} />
                                                )}
                                                {updatingIds.includes(merchant.id) ? 'Saving' : 'Save'}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredMerchants.length === 0 && !loading && (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-10">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                            <Store size={24} className="text-zinc-300" />
                        </div>
                        <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">No partners matched</h4>
                        <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-widest">Adjust filters or reload registry.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-zinc-900 dark:hover:text-white transition-all"
                    >
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-11 h-11 rounded-xl text-[10px] font-black transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-zinc-900 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="h-11 px-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-zinc-900 dark:hover:text-white transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MerchantCommissions;
