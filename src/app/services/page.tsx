'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '@/components/ServiceCard';

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-white mb-4">השירותים שלנו</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            פתרונות דיגיטליים מקיפים — מהרעיון ועד למוצר הסופי
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        )}

        {/* Why us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 grid md:grid-cols-3 gap-8"
        >
          {[
            { icon: '⚡', title: 'מהיר', desc: 'פרויקטים מועברים בזמן שיא, ללא עיכובים' },
            { icon: '🎯', title: 'מדויק', desc: 'תשומת לב לפרטים הקטנים שעושים את ההבדל' },
            { icon: '🔒', title: 'אמין', desc: 'תמיכה מלאה גם לאחר ההשקה' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
