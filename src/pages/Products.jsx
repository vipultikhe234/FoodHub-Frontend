import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/api';
import api from '../services/api';
import { fetchRealFoodImage, generateAIDescription } from '../utils/aiHelpers';
import {
    X,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Star,
    Search,
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Box,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imgLoading, setImgLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);

    const initialProductState = {
        name: '',
        category_id: '',
        price: '',
        description: '',
        stock: 0,
        image: '',
        is_available: true
    };

    const [newProduct, setNewProduct] = useState(initialProductState);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                productService.getAll(),
                api.get('/categories')
            ]);
            setProducts(prodRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await productService.uploadImage(formData);
            setNewProduct(prev => ({ ...prev, image: response.data.path }));
        } catch (error) {
            alert("Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleRetryImage = async () => {
        if (!newProduct.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newProduct.name, true);
        setNewProduct(prev => ({ ...prev, image: url }));
        setImgLoading(false);
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setNewProduct(prev => ({ ...prev, name }));

        if (editingId) return;

        clearTimeout(debounceRef.current);

        if (!name.trim()) {
            setNewProduct(prev => ({ ...prev, name, image: '' }));
            setImgLoading(false);
            return;
        }

        setImgLoading(true);
        debounceRef.current = setTimeout(async () => {
            const desc = await generateAIDescription(name);
            const url = await fetchRealFoodImage(name, false, desc);
            setNewProduct(prev => ({ ...prev, image: url, description: desc }));
            setImgLoading(false);
        }, 1500);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setNewProduct({
            name: product.name,
            category_id: product.category?.id || '',
            price: product.price,
            description: product.description || '',
            stock: product.stock || 0,
            image: product.image || '',
            is_available: product.is_available ?? true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, category_id, price } = newProduct;
        if (!name.trim() || !category_id || !price) return alert('Please fill required fields.');

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, newProduct);
            } else {
                await api.post('/products', newProduct);
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewProduct(initialProductState);
        } catch (error) {
            alert(`Error processing request.`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert("Error deleting product");
            }
        }
    };

    const filtered = products.filter(p => {
        const matchCat = selectedCategory === 'all' || p.category?.id === selectedCategory;
        const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchQuery;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Inventory...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white dark:bg-[#111827] p-10 rounded-[48px] shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-4xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter italic font-['Outfit'] leading-none">Products</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]"></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">{products.length} Items Total</p>
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
                            className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-indigo-600/20 py-4 pl-14 pr-6 rounded-[24px] text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner"
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setEditingId(null);
                            setNewProduct(initialProductState);
                            setShowModal(true);
                        }}
                        className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] italic"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Product
                    </motion.button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === 'all'
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent shadow-xl'
                        : 'bg-white dark:bg-gray-800 text-slate-400 border-gray-100 dark:border-white/5 hover:border-indigo-600/30'
                        }`}
                >
                    All Items
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === cat.id
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent shadow-xl'
                            : 'bg-white dark:bg-gray-800 text-slate-400 border-gray-100 dark:border-white/5 hover:border-indigo-600/30'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Product Table Card */}
            <div className="bg-white dark:bg-[#111827] rounded-[56px] shadow-premium border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                                <th className="px-12 py-8">Product Name</th>
                                <th className="py-8 px-6">Category</th>
                                <th className="py-8 px-6">Valuation</th>
                                <th className="py-8 px-6 text-center">In Stock</th>
                                <th className="py-8 px-6">Status</th>
                                <th className="px-12 py-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center text-slate-300">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={64} strokeWidth={1} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6">Nothing found in inventory</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((prod) => (
                                    <tr key={prod.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-12 py-7">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-slate-50 dark:bg-gray-900 rounded-[28px] overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-inner relative group-hover:scale-105 transition-all duration-500">
                                                    {prod.image_url ? (
                                                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={32} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-[900] text-gray-900 dark:text-white uppercase tracking-tighter text-xl leading-none mb-2 font-['Outfit'] italic">{prod.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[240px] italic">{prod.description || 'No description provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-7 px-6">
                                            <div className="inline-flex px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-white/5 italic">
                                                {prod.category?.name || 'Standard'}
                                            </div>
                                        </td>
                                        <td className="py-7 px-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-end gap-1">
                                                    <span className="text-xs font-black text-slate-300 mb-1">₹</span>
                                                    <span className="font-[900] text-gray-900 dark:text-white tracking-tighter text-3xl font-['Outfit'] italic">{parseFloat(prod.price).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-7 px-6">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className={`font-[900] text-sm uppercase tracking-tighter font-['Outfit'] italic ${prod.stock < 10 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {prod.stock} Units
                                                </span>
                                                <div className="w-20 h-1.5 bg-slate-50 dark:bg-white/10 rounded-full overflow-hidden border border-slate-100 dark:border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(prod.stock, 100)}%` }}
                                                        className={`h-full ${prod.stock > 10 ? 'bg-indigo-600' : 'bg-rose-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-7 px-6">
                                            <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm ${prod.is_available ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${prod.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {prod.is_available ? 'Online' : 'Offline'}
                                            </div>
                                        </td>
                                        <td className="px-12 py-7 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleEdit(prod)}
                                                    className="w-12 h-12 bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center shadow-premium border border-gray-100 dark:border-white/5 hover:text-indigo-600"
                                                >
                                                    <Edit2 size={18} strokeWidth={2.5} />
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(prod.id)}
                                                    className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center shadow-premium border border-rose-100 dark:border-rose-500/20 hover:bg-rose-500 hover:text-white"
                                                >
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Redesign */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center p-6 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-[56px] w-full max-w-2xl shadow-3xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 dark:border-white/5 relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                                <div>
                                    <h2 className="text-3xl font-[900] text-gray-900 dark:text-white italic tracking-tighter uppercase font-['Outfit'] leading-none mb-1">
                                        {editingId ? 'Edit Product' : 'Add Product'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">Inventory Node</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowModal(false); setEditingId(null); }}
                                    className="w-12 h-12 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    <X size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10 space-y-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Visual Representation */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Product Image</label>
                                        <div className="relative group overflow-hidden bg-slate-50 dark:bg-gray-800/50 rounded-[44px] h-[280px] border-4 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center transition-all hover:border-indigo-600/30 shadow-inner">
                                            {imgLoading ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-20">
                                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <div className="flex items-center gap-3">
                                                        <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse italic">AI Imagining...</p>
                                                    </div>
                                                </div>
                                            ) : newProduct.image ? (
                                                <div className="w-full h-full relative p-4">
                                                    <img
                                                        src={newProduct.image.startsWith('http') || newProduct.image.startsWith('data:') ? newProduct.image : `http://localhost:8000/storage/${newProduct.image}`}
                                                        className="w-full h-full object-cover rounded-[32px] shadow-2xl"
                                                        alt="preview"
                                                    />
                                                    <div className="absolute inset-4 rounded-[32px] bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 text-white">
                                                            <ImageIcon size={20} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Choose New Image</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-[32px] flex items-center justify-center shadow-premium border border-slate-50 dark:border-white/5 opacity-40">
                                                        <ImageIcon size={40} strokeWidth={1.5} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Drop Image or let AI Generate</p>
                                                </div>
                                            )}
                                            <input
                                                type="file" accept="image/*" onChange={handleImageUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                disabled={uploading || imgLoading}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center px-6">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <AlertCircle size={10} />
                                                <p className="text-[8px] font-black uppercase tracking-widest italic">Optimization Active</p>
                                            </div>
                                            {newProduct.name.trim() && !imgLoading && (
                                                <button type="button" onClick={handleRetryImage} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 bg-indigo-50 dark:bg-indigo-600/10 px-6 py-2.5 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                    <Sparkles size={14} strokeWidth={2.5} /> Regenerate Image
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Blocks */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Product Name</label>
                                            <input
                                                type="text" placeholder="e.g. Smash Burger" required
                                                className="w-full h-16 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-lg font-['Outfit'] italic shadow-inner border border-transparent focus:border-indigo-600/20"
                                                value={newProduct.name} onChange={handleNameChange}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Product Category</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-16 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest appearance-none cursor-pointer shadow-inner border border-transparent focus:border-indigo-600/20"
                                                    required value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                                >
                                                    <option value="">Select Category...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                </select>
                                                <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Market Price (₹)</label>
                                            <input
                                                type="number" step="0.01" placeholder="99.00" required
                                                className="w-full h-16 bg-slate-50 dark:bg-white/5 px-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-[900] text-indigo-600 dark:text-indigo-400 text-2xl font-['Outfit'] italic shadow-inner border border-transparent focus:border-indigo-600/20"
                                                value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Inventory Stock</label>
                                            <div className="relative">
                                                <input
                                                    type="number" placeholder="0" required
                                                    className="w-full h-16 bg-slate-50 dark:bg-white/5 px-16 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-black text-gray-900 dark:text-white text-lg shadow-inner border border-transparent focus:border-indigo-600/20"
                                                    value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                                />
                                                <Box size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block italic">Description</label>
                                            {newProduct.name.length > 3 && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const desc = await generateAIDescription(newProduct.name);
                                                        setNewProduct(p => ({ ...p, description: desc }));
                                                    }}
                                                    className="text-[10px] font-black text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 transition-all font-['Outfit'] italic uppercase"
                                                >
                                                    <Sparkles size={12} /> Auto-Write
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            placeholder="Tell the story of this dish..."
                                            className="w-full p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold text-gray-900 dark:text-white text-sm h-32 shadow-inner border border-transparent focus:border-indigo-600/20 resize-none leading-relaxed"
                                            value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setNewProduct({ ...newProduct, is_available: !newProduct.is_available })}
                                            className={`flex-1 h-18 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] italic transition-all flex items-center justify-center gap-4 ${newProduct.is_available ? 'bg-emerald-50 text-emerald-600 shadow-emerald-600/10 border border-emerald-100' : 'bg-rose-50 text-rose-500 shadow-rose-500/10 border border-rose-100'
                                                }`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full ${newProduct.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                            {newProduct.is_available ? 'Online Status: Active' : 'Online Status: Inactive'}
                                        </button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="flex-[1.5] h-18 bg-slate-900 dark:bg-indigo-600 text-white rounded-[24px] font-[900] text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 italic"
                                        >
                                            <CheckCircle2 size={24} strokeWidth={2.5} /> {editingId ? 'Update Item' : 'Publish Item'}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
