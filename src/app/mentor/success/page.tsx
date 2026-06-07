'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MentorSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md w-full text-center"
      >
        <div className="bg-white/5 border border-green-500/20 rounded-2xl p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-3">התשלום התקבל!</h1>
          <p className="text-slate-400 leading-relaxed mb-6">
            שלחנו לך אימייל עם קוד הגישה האישי שלך.
            <br />
            בדוק את תיבת הדואר (כולל spam).
          </p>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 mb-6 text-sm text-slate-300">
            תוך מספר דקות תקבל אימייל עם הכותרת:
            <br />
            <strong className="text-indigo-400">קוד הגישה שלך ל-AI Master Mentor 🧠</strong>
          </div>

          <Link
            href="/mentor"
            className="block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            כניסה למנטור ←
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
