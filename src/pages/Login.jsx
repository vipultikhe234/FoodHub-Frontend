import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import {
    Lock,
    Mail,
    ShieldCheck,
    ArrowRight,
    Loader2,
    AlertCircle,
    Fingerprint,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(credentials);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid administrative credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A] px-6 py-12 relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Branding Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] shadow-premium border border-slate-100 dark:border-white/5 flex items-center justify-center mx-auto mb-8 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <ShieldCheck size={40} strokeWidth={1.5} className="text-indigo-600" />
                    </motion.div>
                    <h1 className="text-5xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter italic font-['Outfit'] leading-none mb-3">FoodHub</h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] italic leading-none">Admin Terminal</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[#111827]/80 backdrop-blur-3xl rounded-[48px] shadow-premium border border-white dark:border-white/5 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="p-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-500/20 flex items-center gap-4 italic shadow-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Administrative ID</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@address.com"
                                    className="w-full h-16 bg-slate-50 dark:bg-white/5 pl-16 pr-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold text-gray-900 dark:text-white text-sm shadow-inner border border-transparent focus:border-indigo-600/20"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 block italic">Security Secret</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-16 bg-slate-50 dark:bg-white/5 pl-16 pr-8 rounded-[24px] focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold text-gray-900 dark:text-white text-sm shadow-inner border border-transparent focus:border-indigo-600/20"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                    <Fingerprint size={18} className="text-slate-200" />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-18 bg-slate-900 dark:bg-indigo-600 text-white rounded-[24px] font-[900] text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 italic disabled:opacity-50 group mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Authorizing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Secure Login</span>
                                    <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-12 flex flex-col items-center gap-6">
                        <div className="w-12 h-0.5 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[9px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest text-center">
                                Restricted Access Node
                            </p>
                            <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                <span>TLS 1.3 Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] italic">
                        Authorized Personnel Only <span className="mx-2 opacity-30">|</span> © 2026 Space Operations
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
