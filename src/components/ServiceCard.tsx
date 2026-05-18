'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  pricingType: 'packages' | 'custom';
  minPrice: number;
  packages: { name: string; price: number; features: string[] }[];
}

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const startingPrice = service.pricingType === 'packages'
    ? service.packages[0]?.price ?? service.minPrice
    : service.minPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col gap-4"
    >
      <div className="text-4xl">{service.icon}</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
        <p className="text-slate-400 text-sm">{service.description}</p>
      </div>
      <ul className="space-y-1 flex-1">
        {service.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-indigo-400 text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-xs text-slate-500">החל מ-</span>
          <span className="text-2xl font-bold text-indigo-400">₪{startingPrice}</span>
        </div>
        <Link
          href="/pricing"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          בחר חבילה
        </Link>
      </div>
    </motion.div>
  );
}
