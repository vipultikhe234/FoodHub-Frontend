import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import {
    LayoutDashboard,
    Soup,
    FolderTree,
    ShoppingBag,
    TicketPercent,
    Users as UsersIcon,
    LogOut,
    Bell,
    Settings,
    Search,
    ChevronRight,
    CircleDot,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error");
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const navLinks = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/products', label: 'Products', icon: Soup },
        { to: '/categories', label: 'Categories', icon: FolderTree },
        { to: '/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/coupons', label: 'Coupons', icon: TicketPercent },
        { to: '/users', label: 'Users', icon: UsersIcon },
    ];

    const currentPathLabel = navLinks.find(l => l.to === location.pathname)?.label || 'Admin';

    return (
        <div className="flex h-screen bg-[#FDFDFD] dark:bg-[#0B0F1A] overflow-hidden font-sans">
            {/* Premium Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-72 bg-white dark:bg-[#111827] flex flex-col border-r border-gray-100 dark:border-white/5 shrink-0 z-50 relative"
            >
                {/* Brand Identity */}
                <div className="px-8 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <Soup className="text-white relative z-10" size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-[900] text-gray-900 dark:text-white tracking-tighter leading-tight font-['Outfit'] italic">
                                FoodHub
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-6">
                    <p className="px-5 mb-4 text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.2em] italic">General</p>
                    {navLinks.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-4 py-4 px-6 rounded-[24px] transition-all duration-300 group relative ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/10'
                                    : 'text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`text-[11px] font-[900] uppercase tracking-widest leading-none ${isActive ? 'text-white' : 'text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-white'}`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Context & Actions */}
                <div className="p-8 mt-auto border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    {user && (
                        <div className="mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-premium relative border border-gray-100 dark:border-white/5">
                                <span className="font-[900] text-indigo-600 dark:text-indigo-400 font-['Outfit'] italic text-lg">{user.name?.[0]?.toUpperCase()}</span>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-900 dark:text-white text-[10px] uppercase tracking-wider truncate leading-tight mb-1">{user.name}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none italic">{user.role || 'Administrator'}</p>
                            </div>
                        </div>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-5 rounded-[22px] text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-rose-100 dark:border-rose-500/20 shadow-sm"
                    >
                        <LogOut size={16} strokeWidth={2.5} /> Logout
                    </motion.button>
                </div>
            </motion.aside>

            {/* Stage Frame */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Global Command Center Header */}
                <header className="h-[100px] px-12 flex justify-between items-center bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none font-['Outfit']">
                                {currentPathLabel}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">System Online</span>
                            </div>
                        </div>

                        {/* Visual Separator */}
                        <div className="h-10 w-px bg-slate-100 dark:bg-white/10"></div>

                        {/* Search Node */}
                        <div className="hidden lg:flex items-center gap-4 px-6 py-3.5 bg-slate-50 dark:bg-white/5 rounded-[22px] border border-transparent focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-xl transition-all w-80">
                            <Search size={18} className="text-slate-300 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all relative shadow-sm border border-transparent hover:border-gray-100">
                                <Bell size={20} strokeWidth={2.5} />
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0F1A]"></span>
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100">
                                <Settings size={20} strokeWidth={2.5} />
                            </motion.button>
                        </div>

                        <div className="h-10 w-px bg-slate-100 dark:bg-white/10"></div>

                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-[20px] flex items-center gap-3 shadow-sm">
                            <ShieldCheck size={16} strokeWidth={2.5} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Secure Portal</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
