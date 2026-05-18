'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import { useEffect, useState } from 'react';

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

const stats = [
  { label: 'פרויקטים הושלמו', value: '50+' },
  { label: 'לקוחות מרוצים', value: '40+' },
  { label: 'שנות ניסיון', value: '5+' },
  { label: 'זמן מענה', value: '24h' },
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices).catch(() => {});
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-2 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            פתוח לפרויקטים חדשים
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
          >
            פתרונות דיגיטל{' '}
            <span className="gradient-text">מתקדמים</span>
            <br />
            שמביאים תוצאות
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            אתרים, דפי נחיתה, אוטומציות ובוטים חכמים — הכל תחת קורף אחד.
            מהרעיון ועד השקה בזמן שיא.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/services"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              הצג שירותים
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              צור קשר
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-extrabold text-indigo-400 mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-white mb-4">מה אנחנו מציעים</h2>
            <p className="text-slate-400 text-lg">שירותים מותאמים לכל צורך עסקי</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-extrabold text-white mb-4">
              מוכן להתחיל?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              בוא נבנה משהו מדהים יחד. מענה תוך 24 שעות.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              התחל פרויקט עכשיו 🚀
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} DevCraft. כל הזכויות שמורות.
      </footer>
    </div>
  );
}
