'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PricingCard from '@/components/PricingCard';
import CustomQuoteForm from '@/components/CustomQuoteForm';

interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  pricingType: 'packages' | 'custom';
  minPrice: number;
  packages: { name: string; price: number; features: string[] }[];
}

export default function PricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data: Service[]) => {
        setServices(data);
        if (data.length > 0) setActiveTab(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeService = services.find((s) => s.id === activeTab);

  return (
    <div className="pt-16 min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl font-extrabold text-white mb-4">מחירים שקופים</h1>
          <p className="text-slate-400 text-xl">ללא הפתעות, ללא עלויות נסתרות</p>
        </motion.div>

        {/* Service tabs */}
        {!loading && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === s.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <span>{s.icon}</span>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : activeService ? (
          <div>
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <span className="text-4xl">{activeService.icon}</span>
                <h2 className="text-2xl font-bold text-white mt-2">{activeService.name}</h2>
                <p className="text-slate-400 mt-1">{activeService.description}</p>
              </div>

              {activeService.pricingType === 'custom' ? (
                <div className="max-w-xl mx-auto">
                  <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-3 text-center mb-6">
                    <span className="text-indigo-400 font-bold text-lg">החל מ-₪{activeService.minPrice}</span>
                    <p className="text-slate-400 text-sm mt-1">מחיר מותאם לפי הדרישות שלך</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">קבל הצעת מחיר מותאמת</h3>
                    <CustomQuoteForm serviceName={activeService.name} minPrice={activeService.minPrice} />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {activeService.packages.map((pkg, i) => (
                    <PricingCard
                      key={pkg.name}
                      pkg={pkg}
                      serviceName={activeService.name}
                      serviceId={activeService.id}
                      index={i}
                      isPopular={i === 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : null}

        {/* FAQ / trust */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <p className="text-slate-300 text-lg mb-2">
            לא בטוח איזו חבילה מתאימה לך?
          </p>
          <p className="text-slate-400 mb-4">נשוחח, נבין את הצרכים שלך, ונמליץ על הפתרון האידיאלי.</p>
          <a
            href="/contact"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            קבל ייעוץ חינם
          </a>
        </motion.div>
      </div>
    </div>
  );
}
