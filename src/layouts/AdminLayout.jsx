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
    ShieldCheck,
    Menu,
    X as CloseIcon
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

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

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
        <div className="flex h-screen bg-[#FDFDFD] dark:bg-[#0B0F1A] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Premium Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -300,
                    width: isSidebarOpen ? 288 : 0,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                className={`fixed lg:relative h-full bg-white dark:bg-[#111827] flex flex-col border-r border-gray-100 dark:border-white/5 shrink-0 z-[70] overflow-hidden lg:translate-x-0 ${isSidebarOpen ? 'w-72' : 'w-0'}`}
            >
                {/* Brand Identity */}
                <div className="px-8 py-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <Soup className="text-white relative z-10" size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight font-['Outfit']">
                                FoodHub
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Enterprise Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-6">
                    <p className="px-5 mb-4 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Main Menu</p>
                    {navLinks.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-4 py-3 px-5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                                <span className={`text-sm font-semibold tracking-tight leading-none ${isActive ? 'text-white' : ''}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Context & Actions */}
                <div className="p-6 mt-auto border-t border-gray-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                    {user && (
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm relative border border-gray-100 dark:border-white/5">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-['Outfit'] text-sm">{user.name?.[0]?.toUpperCase()}</span>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white text-xs truncate mb-0.5">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none">{user.role || 'Administrator'}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all font-bold text-xs tracking-tight border border-rose-100 dark:border-rose-500/20"
                    >
                        <LogOut size={16} strokeWidth={2} /> Logout
                    </button>
                </div>
            </motion.aside>

            {/* Stage Frame */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Global Command Center Header */}
                <header className="h-[90px] px-6 lg:px-12 flex justify-between items-center bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all border border-transparent hover:border-gray-100 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none font-['Outfit']">
                                {currentPathLabel}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5 lg:mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Status</span>
                            </div>
                        </div>

                        {/* Visual Separator */}
                        <div className="hidden lg:block h-10 w-px bg-slate-100 dark:bg-white/10 mx-2"></div>

                        {/* Search Bar */}
                        <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all w-80">
                            <Search size={18} className="text-slate-300 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="flex items-center gap-2 lg:gap-4">
                            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all relative shadow-sm border border-transparent hover:border-gray-100">
                                <Bell size={18} lg={20} strokeWidth={2.5} />
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0F1A]"></span>
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} className="hidden sm:flex w-10 h-10 lg:w-12 lg:h-12 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100">
                                <Settings size={18} lg={20} strokeWidth={2.5} />
                            </motion.button>
                        </div>

                        <div className="hidden sm:block h-10 w-px bg-slate-100 dark:bg-white/10"></div>

                        <div className="hidden md:flex bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl items-center gap-3 shadow-sm">
                            <ShieldCheck size={16} strokeWidth={2.5} />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Secure Portal</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
