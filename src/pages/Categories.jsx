import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/api';
import api from '../services/api';
import { fetchRealFoodImage } from '../utils/aiHelpers';
import {
    X,
    Sparkles,
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    LayoutGrid,
    CheckCircle2,
    AlertCircle,
    Activity,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);

    const [newCategory, setNewCategory] = useState({
        name: '', image: '', image_url: '', status: true,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = async (e) => {
        const name = e.target.value;
        setNewCategory(prev => ({ ...prev, name }));
        if (editingId) return;
        clearTimeout(debounceRef.current);
        if (!name.trim()) {
            setNewCategory(prev => ({ ...prev, name, image: '', image_url: '' }));
            setImgLoading(false);
            return;
        }
        setImgLoading(true);
        debounceRef.current = setTimeout(async () => {
            const url = await fetchRealFoodImage(name);
            setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
            setImgLoading(false);
        }, 1500);
    };

    const handleRetryImage = async () => {
        if (!newCategory.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newCategory.name, true);
        setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
        setImgLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            setUploading(true);
            const res = await productService.uploadImage(formData);
            const path = res.data.path;
            setNewCategory(prev => ({
                ...prev,
                image: path,
                image_url: `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`,
            }));
        } catch {
            alert('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setNewCategory({
            name: cat.name,
            image: cat.image || '',
            image_url: cat.image_url || '',
            status: cat.status ?? true,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return alert('Category name required');
        try {
            const payload = { name: newCategory.name, image: newCategory.image, status: newCategory.status };
            if (editingId) await api.put(`/categories/${editingId}`, payload);
            else await api.post('/categories', payload);
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewCategory({ name: '', image: '', image_url: '', status: true });
        } catch (err) {
            alert(`Error processing request`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete category?')) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch { alert('Error deleting category'); }
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewCategory({ name: '', image: '', image_url: '', status: true });
        setImgLoading(false);
        clearTimeout(debounceRef.current);
    };

    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">Syncing Categories...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-xl shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight font-['Outfit'] leading-none">Categories</h1>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]"></div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{categories.length} Taxonomy Nodes</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <div className="relative group w-full sm:w-64">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-indigo-600/20 py-2.5 pr-6 pl-10 pr-6 rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner"
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Category
                    </motion.button>
                </div>
            </div>

            {/* Premium Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-40 bg-white dark:bg-[#111827] rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center opacity-30">
                        <LayoutGrid size={64} strokeWidth={1} />
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-6">No categories detected</p>
                    </div>
                ) : (
                    filtered.map((cat) => (
                        <motion.div
                            key={cat.id}
                            whileHover={{ y: -8 }}
                            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 shadow-premium hover:shadow-2xl transition-all group overflow-hidden"
                        >
                            <div className="relative h-28 overflow-hidden">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center text-slate-200"><LayoutGrid size={48} strokeWidth={1.5} /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                <div className="absolute top-6 right-6">
                                    <div className={`px-4 py-1.5 rounded-2xl text-[8px] font-bold uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-2xl ${cat.status ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'
                                        }`}>
                                        {cat.status ? 'Active' : 'Offline'}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div>
                                        <h4 className="text-xl font-bold text-white uppercase tracking-tighter  font-['Outfit'] leading-none mb-1">{cat.name}</h4>
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                            <p className="text-[8px] text-white font-bold uppercase tracking-widest  leading-none">Node Index {cat.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleEdit(cat)}
                                            className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-xl flex items-center justify-center text-white transition-all border border-white/10"
                                        >
                                            <Edit2 size={16} strokeWidth={2.5} />
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(cat.id)}
                                            className="w-10 h-10 bg-rose-500/20 hover:bg-rose-500 backdrop-blur-xl rounded-xl flex items-center justify-center text-white transition-all border border-white/10"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Inventory Status</span>
                                    <span className={cat.status ? 'text-emerald-500' : 'text-rose-500'}>{cat.status ? 'Fully Operational' : 'Hidden From App'}</span>
                                </div>
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="w-full py-4 bg-slate-50 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white rounded-[20px] text-[11px] font-bold uppercase tracking-widest transition-all  flex items-center justify-center gap-3 text-slate-500"
                                >
                                    Manage Category <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Category Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-3xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 dark:border-white/5 relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white  tracking-tighter uppercase font-['Outfit'] leading-none mb-1">
                                        {editingId ? 'Edit Category' : 'Add Category'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest  leading-none">Taxonomy Node</p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetModal}
                                    className="w-12 h-12 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    <X size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 space-y-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Category Image */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 block ">Category Image</label>
                                        <div className="relative group overflow-hidden bg-slate-50 dark:bg-gray-800/50 rounded-2xl h-[220px] border-4 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center transition-all hover:border-indigo-600/30 shadow-inner">
                                            {imgLoading ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-20">
                                                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <div className="flex items-center gap-3">
                                                        <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse ">Visualizing...</p>
                                                    </div>
                                                </div>
                                            ) : newCategory.image_url ? (
                                                <div className="w-full h-full relative p-4">
                                                    <img src={newCategory.image_url} className="w-full h-full object-cover rounded-2xl shadow-2xl" alt="preview" />
                                                    <div className="absolute inset-4 rounded-2xl bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 text-white">
                                                            <ImageIcon size={20} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Update Visual</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 flex flex-col items-center gap-6">
                                                    <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-premium border border-slate-50 dark:border-white/5 opacity-40">
                                                        <ImageIcon size={32} strokeWidth={1.5} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ">Upload or AI Assist</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        </div>
                                        <div className="flex justify-between items-center px-6">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <AlertCircle size={10} />
                                                <p className="text-[8px] font-bold uppercase tracking-widest ">Standard Format Required</p>
                                            </div>
                                            {newCategory.name.trim() && !imgLoading && (
                                                <button type="button" onClick={handleRetryImage} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 bg-indigo-50 dark:bg-indigo-600/10 px-6 py-2.5 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                    <Sparkles size={14} strokeWidth={2.5} /> Swatch Update
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name Field */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 block ">Category Name</label>
                                        <input
                                            type="text" placeholder="e.g. Italian Platters" required
                                            className="w-full h-12 bg-slate-50 dark:bg-white/5 px-6 rounded-lg focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold text-gray-900 dark:text-white text-base font-['Outfit']  shadow-inner border border-transparent focus:border-indigo-600/20"
                                            value={newCategory.name} onChange={handleNameChange}
                                        />
                                    </div>

                                    {/* Status Toggle */}
                                    <div
                                        onClick={() => setNewCategory(prev => ({ ...prev, status: !prev.status }))}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex items-center justify-between ${newCategory.status ? 'bg-emerald-50 border-emerald-100 shadow-emerald-500/5' : 'bg-slate-50 border-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newCategory.status ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 uppercase  font-['Outfit'] leading-none mb-1">Live Manifest</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Visible in public nodes</p>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-8 rounded-full relative transition-colors ${newCategory.status ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <motion.div
                                                animate={{ x: newCategory.status ? 24 : 4 }}
                                                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full h-14 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 "
                                    >
                                        <CheckCircle2 size={24} strokeWidth={3} /> {editingId ? 'Save Changes' : 'Activate Category'}
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

export default Categories;
