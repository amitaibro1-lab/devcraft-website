'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();

  useEffect(() => {
    import('canvas-confetti').then((module) => {
      const confetti = module.default;
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) { clearInterval(interval); return; }
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#a78bfa', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#a78bfa', '#ec4899'],
        });
      }, 250);
    });
  }, []);

  const amount = params.get('amount');
  const service = params.get('service');

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold text-white mb-4"
        >
          התשלום התקבל!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h3 className="font-bold text-white mb-4">סיכום הזמנה</h3>
          <div className="space-y-2 text-sm text-slate-400">
            {service && <p><span className="text-slate-300">שירות:</span> {service}</p>}
            {amount && <p><span className="text-slate-300">סכום:</span> <span className="text-green-400 font-bold text-base">₪{amount}</span></p>}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-indigo-400 text-lg font-bold mb-2"
        >
          ניצור איתך קשר תוך 24 שעות 🚀
        </motion.p>
        <p className="text-slate-500 text-sm mb-8">נשלח אליך אישור למייל</p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            חזרה לדף הבית
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-16 flex items-center justify-center min-h-screen text-slate-400">טוען...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
