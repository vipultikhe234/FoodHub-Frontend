import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, sub, accent }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-[#111827] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 relative overflow-hidden group shadow-premium hover:shadow-2xl transition-all duration-500"
    >
        {/* Decorative elements */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-[0.05] transition-opacity group-hover:opacity-[0.15] ${accent || 'bg-indigo-500'}`}></div>

        <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
                {icon}
            </div>
            {sub && (
                <div className="bg-green-500/10 text-green-600 text-[9px] font-black px-2.5 py-1 rounded-full border border-green-500/10 uppercase tracking-wider">
                    {sub}
                </div>
            )}
        </div>

        <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1 italic">{label}</p>
            <h3 className="text-3xl font-[900] text-gray-900 dark:text-white leading-none font-['Outfit'] tracking-tighter">
                {value}
            </h3>
        </div>
    </motion.div>
);

export default StatCard;
