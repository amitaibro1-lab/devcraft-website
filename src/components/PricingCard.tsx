'use client';

import { motion } from 'framer-motion';
import PaymentButton from './PaymentButton';

interface Package {
  name: string;
  price: number;
  features: string[];
}

interface PricingCardProps {
  pkg: Package;
  serviceName: string;
  serviceId: string;
  index: number;
  isPopular?: boolean;
}

export default function PricingCard({ pkg, serviceName, serviceId, index, isPopular }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 ${
        isPopular
          ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'bg-white/5 border-white/10 hover:border-indigo-500/40'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          פופולרי
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-indigo-400">₪{pkg.price.toLocaleString()}</span>
          <span className="text-slate-400 text-sm">חד פעמי</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1 mb-6">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-green-400 mt-0.5 text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <PaymentButton
        amount={pkg.price}
        description={`${serviceName} — ${pkg.name}`}
        serviceType={serviceName}
        packageName={pkg.name}
        className={isPopular ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/10 hover:bg-white/20'}
      />
    </motion.div>
  );
}
