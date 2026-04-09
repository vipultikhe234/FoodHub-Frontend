import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Search, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MerchantDropdown = ({ merchants, selectedMerchantId, setSelectedMerchantId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const selectedMerchant = merchants.find(m => m.id.toString() === selectedMerchantId?.toString());
    
    const filteredMerchants = merchants.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-2 pl-4 pr-3 rounded-2xl ml-2 hover:border-emerald-500/50 transition-all group"
            >
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                    {selectedMerchantId ? <Store size={14} /> : <Globe size={14} />}
                </div>
                <div className="flex flex-col items-start min-w-[120px] max-w-[200px]">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Context</span>
                    <span className="text-[11px] font-black text-zinc-900 dark:text-white truncate uppercase tracking-wider">
                        {selectedMerchant ? selectedMerchant.name : 'Global Overview'}
                    </span>
                </div>
                <ChevronDown 
                    size={14} 
                    className={`text-zinc-400 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-2 mt-2 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search Header */}
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="SEARCH MERCHANTS..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase tracking-wider"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Merchants List */}
                        <div className="max-h-80 overflow-y-auto pt-2 pb-2 custom-scrollbar">
                            {/* Global Option */}
                            <button
                                onClick={() => {
                                    setSelectedMerchantId('');
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all ${!selectedMerchantId ? 'bg-emerald-500/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${!selectedMerchantId ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                        <Globe size={16} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${!selectedMerchantId ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-300'}`}>Global Overview</span>
                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.1em]">All Locations</span>
                                    </div>
                                </div>
                                {!selectedMerchantId && <Check size={14} className="text-emerald-500" strokeWidth={3} />}
                            </button>

                            <div className="px-4 py-2">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Partner Outlets</span>
                            </div>

                            {filteredMerchants.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Store size={24} className="mx-auto text-zinc-300 mb-2 opacity-20" />
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No merchants found</p>
                                </div>
                            ) : (
                                filteredMerchants.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedMerchantId(m.id.toString());
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group ${selectedMerchantId?.toString() === m.id.toString() ? 'bg-emerald-500/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-all ${selectedMerchantId?.toString() === m.id.toString() 
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10'}`}>
                                                <Store size={16} />
                                            </div>
                                            <div className="flex flex-col items-start text-left min-w-0">
                                                <span className={`text-[11px] font-black uppercase tracking-wider truncate w-40 ${selectedMerchantId?.toString() === m.id.toString() ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                    {m.name}
                                                </span>
                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.1em] truncate w-32">
                                                    {m.merchant_category?.name || 'Retail Partner'}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedMerchantId?.toString() === m.id.toString() && <Check size={14} className="text-emerald-500" strokeWidth={3} />}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Management Environment</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MerchantDropdown;
