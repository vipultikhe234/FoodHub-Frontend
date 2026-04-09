import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect } from 'react';
import { merchantCategoryService } from '../services/api';
import {
    X,
    Plus,
    Edit2,
    Trash2,
    LayoutGrid,
    Search,
    ChevronDown,
    Activity,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const MerchantCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [form, setForm] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await merchantCategoryService.adminGetAll();
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Error fetching merchant categories:', error);
            toast.error('Failed to load merchant categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Category name is required');

        try {
            if (editingId) {
                await merchantCategoryService.adminUpdate(editingId, form);
                toast.success('Category updated successfully');
            } else {
                await merchantCategoryService.adminCreate(form);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            setEditingId(null);
            setForm({ name: '', description: '', is_active: true });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setForm({
            name: cat.name,
            description: cat.description || '',
            is_active: !!cat.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        toast((t) => (
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Delete category?</span>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await merchantCategoryService.adminDelete(id);
                                toast.success('Category deleted');
                                fetchCategories();
                            } catch (err) {
                                toast.error(err.response?.data?.message || 'Delete failed');
                            }
                        }}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                        Delete
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Cancel
                    </button>
                </div>
            </div>
        ));
    };

    const toggleStatus = async (id) => {
        try {
            await merchantCategoryService.adminToggleStatus(id);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
            toast.success('Status updated');
        } catch {
            toast.error('Toggle failed');
        }
    };

    const filtered = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'active' ? c.is_active : !c.is_active);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Category Master</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">System-wide business category configuration.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchCategories}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="SEARCH CATEGORIES..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-56 transition-all dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative group hidden md:block">
                        <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <select
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">ALL STATUS</option>
                            <option value="active">ACTIVE ONLY</option>
                            <option value="inactive">INACTIVE ONLY</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                    </div>
                    
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setForm({ name: '', description: '', is_active: true });
                            setShowModal(true);
                        }}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Category
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 text-center">
                    <ApnaCartLoader centered={true} size={80} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-32 bg-zinc-50 dark:bg-zinc-900/40 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center opacity-40">
                            <LayoutGrid size={48} className="text-zinc-300" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">No Categories Defined</p>
                        </div>
                    ) : (
                        filtered.map((cat) => (
                            <motion.div
                                key={cat.id}
                                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button
                                        onClick={() => toggleStatus(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                            cat.is_active 
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                        }`}
                                    >
                                        {cat.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{cat.name}</h3>
                                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">ID: #00{cat.id}</p>
                                    </div>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed min-h-[40px]">
                                        {cat.description || 'No specialized description provided for this business classification.'}
                                    </p>
                                    <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between gap-4">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="flex-1 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] font-extrabold uppercase tracking-widest"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="flex-1 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] font-extrabold uppercase tracking-widest"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{editingId ? 'Edit Identity' : 'New Classification'}</h2>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Define Business Model Segment</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-rose-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Classification Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all uppercase tracking-widest"
                                            placeholder="e.g. FINE DINING, CLOUD KITCHEN"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Functional Description</label>
                                        <textarea
                                            rows="4"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-xs font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all uppercase tracking-widest leading-relaxed"
                                            placeholder="Specify the operational scope of this category..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${form.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-300'}`} />
                                            <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest text-zinc-500">Enable Identity</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                            className={`w-12 h-6 rounded-full relative transition-all ${form.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                                        >
                                            <motion.div
                                                animate={{ x: form.is_active ? 26 : 4 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-2 px-12 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                                    >
                                        {editingId ? 'Update Registry' : 'Save Classification'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MerchantCategories;
