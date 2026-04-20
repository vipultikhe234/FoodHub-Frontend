import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Sparkline = ({ data, color }) => {
    if (!data || data.length < 2) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 opacity-50">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const DashboardCard = ({ label, value, icon: Icon, color = 'emerald', subLabel, trendData, isCurrency = false }) => {
    const colorMap = {
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/20',
        rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/20',
        violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/20',
        cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/20',
        zinc: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20 shadow-zinc-500/20',
    };

    const colors = colorMap[color] || colorMap.emerald;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-100 dark:border-zinc-800 p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-none ${colors.split(' ')[1]} ${colors.split(' ')[0]}`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                        {isCurrency && "₹"}{Number(value).toLocaleString()}
                    </h2>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Context</span>
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                        {subLabel || "System Live"}
                    </span>
                </div>
                <div className="w-20">
                    <Sparkline data={trendData || [5, 8, 3, 10, 7, 12, 8]} color={colors.split(' ')[0].replace('text-', '') === 'emerald' ? '#10b981' : (colors.split(' ')[0].replace('text-', '') === 'rose' ? '#f43f5e' : '#71717a')} />
                </div>
            </div>

            {/* Subtle background icon */}
            <Icon size={80} className={`absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ${colors.split(' ')[0]}`} />
        </motion.div>
    );
};

export default DashboardCard;
