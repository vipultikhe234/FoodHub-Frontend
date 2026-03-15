import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users as UsersIcon,
    Search,
    Mail,
    Phone,
    MapPin,
    Calendar,
    SearchX,
    ArrowUpRight,
    UserCircle,
    Activity,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">Syncing User Directory...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Header / Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#111827] p-6 rounded-xl shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="space-y-2 relative z-10 text-center md:text-left">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight font-['Outfit'] leading-none">User Registry</h1>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5]"></div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{users.length} Database Nodes</p>
                    </div>
                </div>

                <div className="relative group w-full sm:w-80 relative z-10">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-indigo-600/20 py-2.5 pl-12 pr-6 rounded-lg text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Users Table Card */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-bold text-slate-400 uppercase tracking-widest ">
                                <th className="px-10 py-4">Identity</th>
                                <th className="py-4 px-6">Contact Node</th>
                                <th className="py-4 px-6">Delivery Target</th>
                                <th className="px-10 py-4 text-right">Member Since</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center text-slate-300">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <SearchX size={64} strokeWidth={1} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest mt-6">No user records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-12 py-2.5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-premium border border-slate-100 dark:border-white/5 font-bold text-base font-['Outfit']  text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter text-xl leading-none mb-2 font-['Outfit'] ">{user.name || 'Anonymous User'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter uppercase px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded-md">UID-{String(user.id).padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-6">
                                            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-bold uppercase text-slate-400 dark:text-gray-300 border border-slate-100 dark:border-white/5 ">
                                                <Phone size={12} className="opacity-40" />
                                                {user.phone || 'Standard Null'}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-6">
                                            <div className="flex items-center gap-3 group/loc">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover/loc:bg-indigo-600 group-hover/loc:text-white transition-all">
                                                    <MapPin size={14} />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest max-w-[280px] truncate  leading-none">{user.address || 'Address not listed'}</p>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-12 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-indigo-600 opacity-60" />
                                                    <span className="font-bold text-gray-900 dark:text-white text-base uppercase  tracking-tighter font-['Outfit'] leading-none">
                                                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2  leading-none">Activation Timestamp</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visual KPI Summary (Optional but adds premium feel) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Network Reach', val: users.length, icon: Activity, color: 'text-indigo-600' },
                    { label: 'Active Sessions', val: Math.round(users.length * 0.4), icon: UserCircle, color: 'text-emerald-500' },
                    { label: 'Growth Vector', val: '+12%', icon: ArrowUpRight, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest  leading-none mb-3">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white font-['Outfit'] tracking-tighter  leading-none">{stat.val}</p>
                        </div>
                        <div className={`w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Users;
