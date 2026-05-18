'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const MIN_PRICE = 150;

export default function CustomQuoteForm({ serviceName, minPrice = MIN_PRICE }: { serviceName: string; minPrice?: number }) {
  const [form, setForm] = useState({ name: '', email: '', budget: minPrice, description: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.budget < minPrice) {
      setError(`המחיר המינימלי הוא ₪${minPrice}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          service: serviceName,
          message: `תקציב: ₪${form.budget}\n\n${form.description}`,
        }),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">הפנייה התקבלה!</h3>
        <p className="text-slate-400">ניצור איתך קשר תוך 24 שעות.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">שם מלא</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="ישראל ישראלי"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">אימייל</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="example@gmail.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          תקציב משוער (מינימום ₪{minPrice})
        </label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">₪</span>
          <input
            required
            type="number"
            min={minPrice}
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-8 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        {form.budget < minPrice && (
          <p className="text-red-400 text-xs mt-1">המחיר המינימלי הוא ₪{minPrice}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">תיאור הפרויקט</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          placeholder="ספר לנו על הבוט שאתה רוצה לבנות..."
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {status === 'error' && <p className="text-red-400 text-sm">שגיאה בשליחה, נסה שוב.</p>}
      <button
        type="submit"
        disabled={loading || form.budget < minPrice}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? 'שולח...' : 'שלח בקשת הצעת מחיר'}
      </button>
    </form>
  );
}
