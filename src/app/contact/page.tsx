'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PaymentButton from '@/components/PaymentButton';

interface Config {
  businessName: string;
  contactEmail: string;
  depositPercent: number;
}

const serviceOptions = ['בניית אתרים', 'דפי נחיתה', 'אוטומציות', 'תכנות בוטים', 'אחר'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [config, setConfig] = useState<Config | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then(setConfig).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setShowDeposit(true);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const getDepositLabel = () => {
    const pct = config?.depositPercent ?? 50;
    return depositAmount
      ? `שלם מקדמה של ${pct}% — ₪${Math.round(depositAmount * pct / 100)}`
      : `שלם מקדמה של ${pct}% לנעילת הפרויקט`;
  };

  if (status === 'success' && showDeposit) {
    return (
      <div className="pt-16 min-h-screen px-4 py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">הפנייה נשלחה!</h2>
          <p className="text-slate-400 mb-8">ניצור איתך קשר תוך 24 שעות.</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-white mb-3">רוצה לנעול את הפרויקט?</h3>
            <p className="text-slate-400 text-sm mb-4">
              שלם מקדמה של {config?.depositPercent ?? 50}% כדי לתפוס מקום בלוח הזמנים שלנו.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">סכום כולל משוער (₪)</label>
              <input
                type="number"
                placeholder="לדוגמה: 1500"
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {depositAmount && depositAmount > 0 && (
              <PaymentButton
                amount={Math.round(depositAmount * (config?.depositPercent ?? 50) / 100)}
                description={`מקדמה — ${form.service}`}
                serviceType={form.service}
                label={getDepositLabel()}
                className="bg-green-600 hover:bg-green-500"
              />
            )}
          </div>
          <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">
            חזרה לדף הבית
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl font-extrabold text-white mb-4">צור קשר</h1>
          <p className="text-slate-400 text-xl">מוכן לשמוע על הפרויקט שלך. מענה תוך 24 שעות.</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">שם מלא *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="ישראל ישראלי"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">אימייל *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">שירות מבוקש</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>בחר שירות...</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s} className="bg-[#1e1e2e]">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">הודעה *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="ספר לנו על הפרויקט שלך..."
                />
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm">שגיאה בשליחה. נסה שוב.</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/30"
              >
                {status === 'loading' ? 'שולח...' : 'שלח הודעה 🚀'}
              </button>
            </form>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">יצירת קשר ישיר</h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${config?.contactEmail ?? 'luffybaz111@gmail.com'}`}
                  className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <span className="text-2xl">📧</span>
                  <span className="text-sm">{config?.contactEmail ?? 'luffybaz111@gmail.com'}</span>
                </a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">שעות עבודה</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>ראשון — חמישי: 09:00 — 20:00</p>
                <p>שישי: 09:00 — 14:00</p>
                <p>שבת: סגור</p>
              </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-bold text-white mb-2">תגובה מהירה</h3>
              <p className="text-slate-400 text-sm">
                אנו מחויבים לחזור לכל פנייה תוך 24 שעות בימי עבודה.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
