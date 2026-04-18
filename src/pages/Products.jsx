import ApnaCartLoader from '../components/ApnaCartLoader';
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import api, { MerchantService, merchantCategoryService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Image as ImageIcon,
    MoreVertical,
    SearchX,
    AlertCircle,
    ChevronRight,
    ChevronDown,
    ArrowRight,
    Layers,
    Type,
    Tag,
    Archive,
    Box,
    Loader2,
    Sparkles,
    Store,
    RefreshCw,
    ScanBarcode,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRealFoodImage, generateAIDescription, generateProductNames } from '../utils/aiHelpers';
import { useMerchant } from '../contexts/MerchantContext';

const Products = () => {
    const { selectedMerchantId, merchants: Merchants } = useMerchant();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [merchantCategories, setMerchantCategories] = useState([]);
    const [selectedMerchantCategoryId, setSelectedMerchantCategoryId] = useState('');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const isMerchant = user.role === 'merchant' || user.role === 'Merchant';

    const initialProductState = {
        name: '',
        description: '',
        price: '',
        category_id: '',
        merchant_id: '',
        stock: 0,
        image: null,
        is_veg: false,
        spicy_level: 0,
        calories: '',
        preparation_time: '',
        is_popular: false,
        is_recommended: false,
        is_new: false,
        tax_rate: '',
        is_available: true,
        has_variants: false,
        variants: [] // { name, quantity, price, stock }
    };

    const [newProduct, setNewProduct] = useState(initialProductState);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const scannerRef = useRef(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (typeof path !== 'string') return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`;
    };

    // Scoped Load - Fetch data when merchant selection changes
    useEffect(() => {
        fetchData();
        if (!isMerchant) {
            merchantCategoryService.adminGetAll().then(res => setMerchantCategories(res.data.data || []));
        }
    }, [selectedMerchantId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const query = selectedMerchantId ? `?merchant_id=${selectedMerchantId}` : '';
            const [prodRes, catRes] = await Promise.all([
                api.get(`/products${query}`),
                api.get(`/categories${query}`)
            ]);

            setProducts(prodRes.data.data || prodRes.data || []);
            setCategories(catRes.data.data || catRes.data || []);
        } catch (error) {
            console.error("Fetch Error:", error);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', formData);
            setNewProduct({ ...newProduct, image: res.data.path });
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAIDesc = async () => {
        if (!newProduct.name) return toast.error("Enter a name first");
        setUploading(true);
        try {
            const desc = await generateAIDescription(newProduct.name);
            setNewProduct(prev => ({ ...prev, description: desc }));
        } finally {
            setUploading(false);
        }
    };

    const handleAIGenImage = async () => {
        if (!newProduct.name) return toast.error("Enter a name first");
        setImgLoading(true);
        try {
            const url = await fetchRealFoodImage(newProduct.name, true, newProduct.description, 'product');
            setNewProduct(prev => ({ ...prev, image: url }));
        } catch (error) {
            console.error("AI Image Generation Error:", error);
        } finally {
            setImgLoading(false);
        }
    };

    // ── Scanner Lifecycle Management ──────────────────────────────────────────
    useEffect(() => {
        let scanner = null;
        if (showScanner) {
            // Ensure the DOM element 'reader' exists before starting
            const checkExist = setInterval(() => {
                const element = document.getElementById("reader");
                if (element) {
                    clearInterval(checkExist);
                    scanner = new Html5Qrcode("reader");
                    scanner.start(
                        { facingMode: "environment" },
                        { 
                            fps: 30, // Max frequency for fast detection
                            qrbox: { width: 260, height: 160 }, // Rectangular for linear barcodes
                            aspectRatio: 1.0,
                            formatsToSupport: [ 
                                Html5QrcodeSupportedFormats.EAN_13, 
                                Html5QrcodeSupportedFormats.EAN_8, 
                                Html5QrcodeSupportedFormats.UPC_A, 
                                Html5QrcodeSupportedFormats.UPC_E,
                                Html5QrcodeSupportedFormats.CODE_128,
                                Html5QrcodeSupportedFormats.CODE_39,
                                Html5QrcodeSupportedFormats.QR_CODE
                            ],
                            videoConstraints: {
                                width: { min: 1280, ideal: 1920 },
                                height: { min: 720, ideal: 1080 },
                                // Focus mode for modern webcams
                                focusMode: { ideal: "continuous" }
                            }
                        },
                        (decodedText) => {
                            setScannedBarcode(decodedText);
                            handleBarcodeLookup(decodedText);
                        },
                        () => {} // Silent fail for frame-by-frame scans
                    ).catch(err => console.error("Scanner Start Error:", err));
                }
            }, 100);
        }

        return () => {
            if (scanner) {
                scanner.stop().then(() => scanner.clear()).catch(e => console.warn("Scanner Cleanup:", e));
            }
        };
    }, [showScanner]);

    // SYNC NEW PRODUCT WITH SELECTED MERCHANT
    useEffect(() => {
        if (showModal && !editingId && selectedMerchantId) {
            setNewProduct(prev => ({ ...prev, merchant_id: selectedMerchantId }));
        }
    }, [showModal, selectedMerchantId, editingId]);

    const handleBarcodeLookup = async (barcode) => {
        const toastId = toast.loading("Checking Global Database...");
        try {
            const res = await api.get(`/products/barcode-lookup/${barcode}`);
            const data = res.data.data;
            processBarcodeData(data, toastId);
        } catch (error) {
            // BACKUP: AI INTELLIGENT SEARCH
            toast.loading("API Empty. Searching AI Catalog...", { id: toastId });
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                const prompt = `Identify this retail barcode: ${barcode}. 
                Return a RAW JSON object (no markdown, no backticks) with these fields: 
                "name" (full product name), 
                "brand" (manufacturer), 
                "category" (choose most fitting: Dairy, Bakery, Snacks, Beverages, Staples, Personal Care, Household).
                If unknown, provide reasonable guesses based on manufacturer prefixes.`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const aiData = JSON.parse(text);
                
                processBarcodeData({
                    name: aiData.name,
                    brand: aiData.brand,
                    category_guess: aiData.category,
                    image: null // AI can't fetch real-time URLs reliably, we'll use placeholder or AI gen later
                }, toastId);
            } catch (aiErr) {
                console.error("AI Fallback failed:", aiErr);
                toast.error("Product not found in any catalog. Please enter manually.", { id: toastId });
                // Still open modal so user can enter manually
                setNewProduct(prev => ({ ...prev, name: '' }));
                setShowScanner(false);
                setShowModal(true);
            }
        }
    };

    const processBarcodeData = async (data, toastId) => {
        // 1. Check for Duplicate by Name
        const exists = products.find(p => p.name.toLowerCase() === data.name.toLowerCase());
        if (exists) {
            toast.error("Product already exists in your inventory", { id: toastId });
            return;
        }

        // 2. Handle Category Matching / Creation
        let targetCategory = null;
        const categoryName = data.category_guess || 'Grocery';
        
        // Search in existing categories
        const foundCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (foundCat) {
            targetCategory = foundCat.id;
        } else {
            // Auto-create category
            toast.loading(`Drafting category: ${categoryName}...`, { id: toastId });
            try {
                const catPayload = {
                    name: categoryName,
                    merchant_id: selectedMerchantId || '',
                    description: `Automatically created for ${data.name}`
                };
                const catRes = await api.post('/categories', catPayload);
                const newCat = catRes.data.data;
                setCategories(prev => [...prev, newCat]);
                targetCategory = newCat.id;
            } catch (e) {
                console.error("Cat creation failed", e);
            }
        }

        // 3. Pre-fill Form
        setNewProduct(prev => ({
            ...prev,
            name: data.name,
            description: `Brand: ${data.brand || 'N/A'}. ${data.name}. Freshly categorized as ${categoryName}.`,
            category_id: targetCategory,
            image: data.image
        }));

        toast.success(`Identified: ${data.name}`, { id: toastId });
        setScannedBarcode(''); // CLEAR FOR NEXT SCAN
        setShowScanner(false);
        setShowModal(true); // Open the product modal to allow manual override
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        try {
            setSubmitting(true);
            const payload = { ...newProduct };
            if (selectedMerchantId && !payload.merchant_id) {
                payload.merchant_id = selectedMerchantId;
            }

            // Validation: For variable products, ensure at least one variant exists
            if (payload.has_variants && payload.variants.length === 0) {
                return toast.error("Please add at least one variant for this product.");
            }

            if (editingId) {
                await api.put(`/products/${editingId}`, payload);
            } else {
                await api.post('/products', payload);
            }
            fetchData();
            setShowModal(false);
            setEditingId(null);
            toast.success(editingId ? "Product updated successfully" : "Product added successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving product. Please ensure all fields are correct.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddVariant = () => {
        setNewProduct(prev => ({
            ...prev,
            variants: [...prev.variants, { name: '', quantity: '', price: '', stock: 0 }]
        }));
    };

    const handleUpdateVariant = (index, field, value) => {
        const updatedVariants = [...newProduct.variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setNewProduct({ ...newProduct, variants: updatedVariants });
    };

    const handleRemoveVariant = (index) => {
        setNewProduct(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setNewProduct({
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            category_id: prod.category?.id || prod.category_id,
            merchant_id: prod.merchant_id || '',
            stock: prod.stock || 0,
            image: prod.image,
            is_veg: !!prod.is_veg,
            spicy_level: prod.spicy_level || 0,
            calories: prod.calories || '',
            preparation_time: prod.preparation_time || '',
            is_popular: !!prod.is_popular,
            is_recommended: !!prod.is_recommended,
            is_new: !!prod.is_new,
            tax_rate: prod.tax_rate || '',
            is_available: !!prod.is_available,
            has_variants: !!prod.has_variants,
            variants: prod.variants || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    Delete this product?
                    <button onClick={async () => { toast.dismiss(t.id); try { await api.delete(`/products/${id}`); setProducts(products.filter(p => p.id !== id)); toast.success("Product deleted"); } catch { toast.error("Error deleting product"); } }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: '10px', letterSpacing: '0.1em' }}>YES</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ background: '#27272a', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: 900, cursor: 'pointer', fontSize: '10px', letterSpacing: '0.1em' }}>NO</button>
                </span>
            ),
            { duration: 6000 }
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory.toString();

        const matchesMerchantCategory = !selectedMerchantCategoryId ||
            product.merchant?.merchant_category_id?.toString() === selectedMerchantCategoryId.toString();

        return matchesSearch && matchesCategory && matchesMerchantCategory;
    });

    // Loading check handled inside the main return structure below
    // if (loading && products.length === 0) return <ApnaCartLoader />;

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (selectedMerchantId) {
            formData.append('merchant_id', selectedMerchantId);
        }

        const toastId = toast.loading("Processing bulk import...");
        setUploading(true);

        try {
            await api.post('/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Products imported successfully", { id: toastId });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Import failed. Check file format.", { id: toastId });
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">Products</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Inventory Management.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchData}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>

                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH CATALOGUE..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-emerald-500/5 w-56 transition-all dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                    <label className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer border border-zinc-200 dark:border-zinc-700 active:scale-95 hidden xl:flex">
                        <Archive size={16} />
                        Bulk Upload
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
                    </label>

                    <button
                        onClick={() => { setScannedBarcode(''); setShowScanner(true); }}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl transition-all active:scale-95"
                    >
                        <ScanBarcode size={16} strokeWidth={3} />
                        Scan
                    </button>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewProduct({ ...initialProductState, merchant_id: selectedMerchantId || '' });
                            setShowModal(true);
                        }}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === 'all'
                        ? 'bg-zinc-900 dark:bg-emerald-500 text-white border-zinc-900 dark:border-emerald-500'
                        : 'bg-transparent text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-500'
                        }`}
                >
                    All Items
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === cat.id
                            ? 'bg-zinc-900 dark:bg-emerald-500 text-white border-zinc-900 dark:border-emerald-500'
                            : 'bg-transparent text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-500'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Product Table Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-32">
                            <ApnaCartLoader centered={true} size={80} />
                        </div>
                    ) : (
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 text-[10px] uppercase tracking-widest font-black">
                                    <th className="px-8 py-6 text-zinc-500 dark:text-zinc-300">Product Information</th>
                                    <th className="py-6 px-4">Merchant</th>
                                    <th className="py-6 px-4">Category</th>
                                    <th className="py-6 px-4">Price</th>
                                    <th className="py-6 px-4 text-center">Stock</th>
                                    <th className="py-6 px-4">Availability</th>
                                    <th className="px-8 py-6 text-right">Edit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <Box size={48} className="text-zinc-300" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-6 text-zinc-500">Inventory Empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((prod) => (
                                        <tr key={prod.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-[1.25rem] overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm relative group-hover:scale-105 transition-all duration-500">
                                                        {prod.image_url ? (
                                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon size={20} /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={`w-2 h-2 rounded-full ${prod.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            <p className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-[13px]">{prod.name}</p>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[200px] mb-1">{prod.description || 'No description'}</p>
                                                        
                                                        {prod.has_variants && prod.variants?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {prod.variants.map((v, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg text-[8px] font-black uppercase tracking-wider text-emerald-500 border border-zinc-200 dark:border-zinc-700">
                                                                        {v.quantity} • ₹{parseFloat(v.price).toFixed(0)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Store size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100">
                                                        {prod.merchant?.name || 'Global'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-[9px] font-black uppercase text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                                                    {prod.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="font-black text-zinc-900 dark:text-white tracking-tighter text-lg">₹{parseFloat(prod.price || 0).toFixed(0)}</span>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-black text-[11px] uppercase tracking-wider ${prod.stock < 10 ? 'text-rose-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                        {prod.has_variants
                                                            ? (prod.variants?.reduce((acc, v) => acc + parseInt(v.stock || 0), 0) || 0)
                                                            : prod.stock
                                                        } Units
                                                    </span>
                                                    {prod.has_variants && (
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.1em] mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                            {prod.variants?.length || 0} Variants
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border-2 ${prod.is_available
                                                        ? 'bg-emerald-50/50 text-emerald-600 border-emerald-500/10'
                                                        : 'bg-rose-50/50 text-rose-600 border-rose-500/10'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${prod.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {prod.is_available ? 'Live' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEdit(prod)}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(prod.id)}
                                                        className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Barcode Scanner Modal */}
            <AnimatePresence>
                {showScanner && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowScanner(false)}
                            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Barcode Terminal</h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Scan or enter manually below</p>
                                </div>
                                <button onClick={() => setShowScanner(false)} className="p-3 hover:text-rose-500 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Manual Entry */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Manual Barcode Input</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text"
                                            placeholder="ENTER CODE..."
                                            className="flex-1 h-12 bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 text-sm font-black tracking-widest outline-none transition-all dark:text-white"
                                            value={scannedBarcode}
                                            onChange={(e) => setScannedBarcode(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup(scannedBarcode)}
                                        />
                                        <button 
                                            onClick={() => handleBarcodeLookup(scannedBarcode)}
                                            className="px-6 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            FETCH
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div></div>
                                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 bg-white dark:bg-zinc-900 px-4">OR USE CAMERA</div>
                                </div>

                                {/* Camera Viewfinder */}
                                <div className="relative aspect-square max-w-[300px] mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                                    <div id="reader" className="w-full h-full"></div>
                                    <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce" />
                                </div>

                                <button 
                                    onClick={() => {
                                        const scanner = new Html5QrcodeScanner("reader", { 
                                            fps: 30, 
                                            qrbox: { width: 320, height: 160 },
                                            rememberLastUsedCamera: true,
                                            aspectRatio: 1.0,
                                            videoConstraints: {
                                                width: { min: 1280, ideal: 1920 },
                                                height: { min: 720, ideal: 1080 },
                                                facingMode: "environment"
                                            },
                                            formatsToSupport: [ 
                                                0, // QR_CODE
                                                4, // EAN_13
                                                5, // EAN_8
                                                11, // UPC_A
                                                12, // UPC_E
                                                13, // UPC_EAN_EXTENSION
                                                1, // AZTEC
                                                2, // CODABAR
                                                3, // CODE_39
                                                6, // CODE_93
                                                7, // CODE_128
                                                8, // DATA_MATRIX
                                                9, // ITP
                                                10 // PDF_417
                                            ]
                                        });
                                        
                                        scanner.render((data) => {
                                            setScannedBarcode(data);
                                            toast.success(`Success! Code: ${data}`, { icon: '✅', duration: 1500 });
                                            handleBarcodeLookup(data);
                                            scanner.clear();
                                        }, (err) => {
                                            // Handle error
                                        });
                                    }}
                                    className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700"
                                >
                                    <Camera size={18} />
                                    Launch Scanner
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
                            className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-6 lg:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-none">{editingId ? 'Modify Item' : 'New Item'}</h2>
                                    <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1.5">Configure your selection.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-rose-500 transition-colors border border-zinc-100 dark:border-zinc-700 shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                                    <div className="relative group mx-auto md:mx-0">
                                        <div className="w-32 h-32 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50 shadow-inner">
                                            {newProduct.image ? (
                                                <img src={getImageUrl(newProduct.image)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={24} className="text-zinc-300" />
                                            )}
                                            {(uploading || imgLoading) && (
                                                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center">
                                                    <ApnaCartLoader centered={false} size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex flex-col gap-1.5">
                                            <label className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg cursor-pointer hover:bg-emerald-500 transition-all shadow-lg border border-zinc-800">
                                                <ImageIcon size={14} />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAIGenImage}
                                                className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg"
                                            >
                                                <Sparkles size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{isMerchant ? 'Assigned Node' : 'Partner Node'}</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    disabled={isMerchant}
                                                    className={`w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[10px] font-black uppercase text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none ${isMerchant ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    value={newProduct.merchant_id}
                                                    onChange={(e) => setNewProduct({ ...newProduct, merchant_id: e.target.value })}
                                                >
                                                    <option value="" className="dark:bg-zinc-900">Select Partner</option>
                                                    {Merchants.map(r => <option key={r.id} value={r.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">{r.name}</option>)}
                                                </select>
                                                {!isMerchant && <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Item Designation</label>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const suggestions = await generateProductNames(newProduct.name || 'Food');
                                                        setNameSuggestions(suggestions);
                                                    }}
                                                    className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-600 transition-all"
                                                >
                                                    <Sparkles size={10} strokeWidth={3} /> Suggest
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Signature Pizza"
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-400 shadow-inner"
                                                    value={newProduct.name}
                                                    onChange={(e) => {
                                                        setNewProduct({ ...newProduct, name: e.target.value });
                                                        if (nameSuggestions.length > 0) setNameSuggestions([]);
                                                    }}
                                                />
                                                {nameSuggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden p-1">
                                                        {nameSuggestions.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => { setNewProduct(prev => ({ ...prev, name: s })); setNameSuggestions([]); }}
                                                                className="w-full p-2.5 text-left text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white rounded-lg text-zinc-900 dark:text-zinc-100 transition-all"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Item Classification (Category)</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[10px] font-black uppercase text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                                    value={newProduct.category_id}
                                                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                                >
                                                    <option value="" className="dark:bg-zinc-900">Select Category</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">{cat.name}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Dietary Type</label>
                                        <button
                                            type="button"
                                            onClick={() => setNewProduct({ ...newProduct, is_veg: !newProduct.is_veg })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${newProduct.is_veg ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500' : 'bg-rose-500/10 text-rose-500 border-rose-500'}`}
                                        >
                                            {newProduct.is_veg ? 'VEG' : 'NON-VEG'}
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Spicy Level (0-3)</label>
                                        <input
                                            type="number"
                                            min="0" max="3"
                                            className="h-10 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black"
                                            value={newProduct.spicy_level}
                                            onChange={(e) => setNewProduct({ ...newProduct, spicy_level: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Prep Time (Min)</label>
                                        <input
                                            type="number"
                                            className="h-10 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black"
                                            value={newProduct.preparation_time}
                                            onChange={(e) => setNewProduct({ ...newProduct, preparation_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Calories</label>
                                        <input
                                            type="number"
                                            className="h-10 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black"
                                            value={newProduct.calories}
                                            onChange={(e) => setNewProduct({ ...newProduct, calories: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 py-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct({ ...newProduct, is_popular: !newProduct.is_popular })}
                                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all ${newProduct.is_popular ? 'bg-amber-500/10 text-amber-500 border-amber-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
                                    >
                                        POPULAR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct({ ...newProduct, is_recommended: !newProduct.is_recommended })}
                                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all ${newProduct.is_recommended ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
                                    >
                                        RECOMMENDED
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewProduct({ ...newProduct, is_new: !newProduct.is_new })}
                                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all ${newProduct.is_new ? 'bg-blue-500/10 text-blue-500 border-blue-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
                                    >
                                        NEW ARRIVAL
                                    </button>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.1em]">Variable Item</label>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Scale options.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewProduct({ ...newProduct, has_variants: !newProduct.has_variants })}
                                            className={`w-12 h-6 rounded-full relative transition-all ${newProduct.has_variants ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                                        >
                                            <motion.div
                                                animate={{ x: newProduct.has_variants ? 26 : 4 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>

                                    {!newProduct.has_variants ? (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Base Price (₹)</label>
                                                <input
                                                    required={!newProduct.has_variants}
                                                    type="number"
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                                                    value={newProduct.price}
                                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Inventory Level</label>
                                                <input
                                                    required={!newProduct.has_variants}
                                                    type="number"
                                                    className="w-full h-11 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-[11px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                                                    value={newProduct.stock}
                                                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Variants Config</label>
                                                <button
                                                    type="button"
                                                    onClick={handleAddVariant}
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-all"
                                                >
                                                    <Plus size={10} strokeWidth={4} /> Add Scale/Unit
                                                </button>
                                            </div>

                                            {newProduct.variants.length === 0 ? (
                                                <div className="py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center opacity-40">
                                                    <Layers size={24} className="text-zinc-300" />
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] mt-3">No Variants Defined</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {newProduct.variants.map((v, idx) => (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            key={idx}
                                                            className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative group/v"
                                                        >
                                                            <div className="grid grid-cols-[1fr_100px_80px] gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                                        <Archive size={10} />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest">Scale/Unit</span>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. 500g"
                                                                        className="w-full h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-[10px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                                                        value={v.quantity}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'quantity', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                                        <Tag size={10} />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest">Price</span>
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="₹"
                                                                        className="w-full h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-[10px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                                                        value={v.price}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                                        <Box size={10} />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest">Stock</span>
                                                                    </div>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 text-[10px] font-black text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                                                        value={v.stock}
                                                                        onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVariant(idx)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/v:opacity-100 transition-all shadow-lg hover:bg-rose-600 scale-90 group-hover/v:scale-100"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Item Narrative</label>
                                        <button
                                            type="button"
                                            onClick={handleAIDesc}
                                            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"
                                        >
                                            <Sparkles size={10} strokeWidth={3} /> Auto-Write
                                        </button>
                                    </div>
                                    <textarea
                                        rows={2}
                                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl outline-none focus:border-emerald-500 transition-all dark:text-white text-[11px] font-bold placeholder:text-zinc-500 resize-none shadow-inner"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 h-12 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] h-12 bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            editingId ? 'Push Update' : 'Finalize Addition'
                                        )}
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

export default Products;

