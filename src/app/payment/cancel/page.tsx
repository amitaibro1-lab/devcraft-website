'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-8xl mb-6"
        >
          😔
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-extrabold text-white mb-3"
        >
          התשלום בוטל
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg mb-8"
        >
          לא צוינה כל עסקה. תוכל לנסות שוב בכל עת.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/pricing"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            נסה שוב
          </Link>
          <Link
            href="/contact"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-xl transition-colors border border-white/10"
          >
            צור קשר
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
