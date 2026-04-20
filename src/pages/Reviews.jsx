import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import { useMerchant } from '../contexts/MerchantContext';
import { 
    Star, 
    MessageSquare, 
    Trash2, 
    Search, 
    Filter, 
    User, 
    Store, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ShieldAlert,
    Package,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reviews = () => {
    const { selectedMerchantId } = useMerchant();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchReviews();
        if (isAdmin && selectedMerchantId) {
            fetchStats(selectedMerchantId);
        } else if (!isAdmin) {
            fetchStats();
        }
    }, [selectedMerchantId, filterRating, page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = { page };
            if (filterRating !== 'all') params.rating = filterRating;
            if (isAdmin && selectedMerchantId) params.merchant_id = selectedMerchantId;
            
            const res = await reviewService.getAll(params);
            const fetchedData = res.data.data || res.data || [];
            setReviews(fetchedData);
            setMeta(res.data.meta || {});
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (mId = null) => {
        try {
            const res = await reviewService.getStats(mId);
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            await reviewService.delete(id);
            fetchReviews();
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">
                        {isAdmin ? 'Platform Feedbacks' : 'Customer Word'}
                    </h1>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">
                        {isAdmin ? 'Global sentiment analysis and review management' : 'Listen to what your customers are saying'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchReviews}
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Activity size={14} className={loading ? 'animate-pulse' : ''} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-none flex items-center justify-center text-amber-500 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Average Rating</p>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white italic">{stats?.avg_rating || '0.0'}</h2>
                    <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                                key={s} 
                                size={12} 
                                className={s <= Math.round(stats?.avg_rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-zinc-200 dark:text-zinc-800'} 
                            />
                        ))}
                    </div>
                    <p className="text-[9px] font-bold text-zinc-400 mt-4 uppercase">Based on {stats?.total_reviews || 0} reviews</p>
                </div>

                <div className="md:col-span-3 bg-white dark:bg-zinc-900 p-8 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6">Rating Distribution</h3>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = stats?.breakdown?.find(b => b.rating === rating)?.count || 0;
                            const percentage = stats?.total_reviews ? (count / stats.total_reviews) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 w-12 shrink-0">
                                        <span className="text-xs font-black text-zinc-600 dark:text-zinc-400">{rating}</span>
                                        <Star size={10} className="text-amber-500 fill-amber-500" />
                                    </div>
                                    <div className="flex-1 h-2 bg-zinc-50 dark:bg-zinc-800 rounded-none overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className="h-full bg-amber-500"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 w-10 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-none border border-zinc-100 dark:border-zinc-800">
                    <Filter size={14} className="text-zinc-400" />
                    <select 
                        value={filterRating} 
                        onChange={(e) => { setFilterRating(e.target.value); setPage(1); }}
                        className="bg-transparent text-[11px] font-bold text-zinc-900 dark:text-white border-none focus:ring-0 outline-none"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Feedbacks...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-none border border-zinc-100 dark:border-zinc-800 border-dashed">
                        <MessageSquare size={48} className="text-zinc-200 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Silence is the only sound here</p>
                    </div>
                ) : (
                    reviews.map((row, idx) => (
                        <motion.div 
                            key={row.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-white dark:bg-zinc-900 p-8 rounded-none border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/20 dark:hover:shadow-none relative"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left Side: User & Meta */}
                                <div className="lg:w-64 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-none flex items-center justify-center text-emerald-500 text-xs font-black italic">
                                            {row.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-900 dark:text-white uppercase italic truncate w-40">{row.user?.name || 'Customer'}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Calendar size={10} className="text-zinc-400" />
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase">{row.created_at}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && (
                                        <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">For Merchant</p>
                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 italic">
                                                <Store size={12} className="shrink-0" />
                                                <span className="text-[10px] font-bold truncate">{row.merchant?.name}</span>
                                            </div>
                                        </div>
                                    )}

                                    {row.order_id && (
                                        <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Order Info</p>
                                            <div className="flex items-center gap-2 text-emerald-500 italic">
                                                <Package size={12} className="shrink-0" />
                                                <span className="text-[10px] font-black uppercase">Order #{row.order_id}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star 
                                                    key={s} 
                                                    size={16} 
                                                    className={s <= row.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-100 dark:text-zinc-800'} 
                                                />
                                            ))}
                                        </div>
                                        {isAdmin && (
                                            <button 
                                                onClick={() => handleDelete(row.id)}
                                                className="w-9 h-9 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-none flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute -left-4 top-0 text-3xl font-serif text-zinc-100 dark:text-zinc-800/50 pointer-events-none">"</div>
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic pr-4">
                                            {row.review || 'The customer left a rating without comments.'}
                                        </p>
                                    </div>

                                    {row.product && (
                                        <div className="inline-flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-2 pr-4 rounded-none border border-zinc-100 dark:border-zinc-700/60 mt-4">
                                            <img src={row.product.image_url} className="w-8 h-8 rounded-none object-cover" />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase italic">On: {row.product.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 pb-12">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`w-10 h-10 rounded-none flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-all ${page === 1 ? 'opacity-30' : 'hover:bg-zinc-900 hover:text-white active:scale-90'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page {page} of {meta.last_page}</span>
                    <button 
                        disabled={page === meta.last_page}
                        onClick={() => setPage(p => p + 1)}
                        className={`w-10 h-10 rounded-none flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-all ${page === meta.last_page ? 'opacity-30' : 'hover:bg-zinc-900 hover:text-white active:scale-90'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reviews;
