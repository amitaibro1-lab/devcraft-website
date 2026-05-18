'use client';

import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  index?: number;
}

export default function KPICard({ title, value, icon, color = 'indigo', index = 0 }: KPICardProps) {
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-3xl font-extrabold ${colorMap[color].split(' ').pop()}`}>
          {value}
        </span>
      </div>
      <p className="text-sm text-slate-400 font-medium">{title}</p>
    </motion.div>
  );
}
