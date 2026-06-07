'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
  {
    id: 'Starter',
    price: 49,
    icon: '🌱',
    color: 'from-green-600/20 to-emerald-600/10',
    border: 'border-green-500/30',
    features: [
      'גישה מלאה למנטור AI אישי',
      'שיחות ללא הגבלה',
      'מסלול לימוד מותאם אישית',
      'מנוע הזדמנויות עסקיות',
      'תמיכה בעברית',
    ],
  },
  {
    id: 'Pro',
    price: 99,
    icon: '⚡',
    color: 'from-indigo-600/20 to-purple-600/10',
    border: 'border-indigo-500/30',
    popular: true,
    features: [
      'כל מה שב-Starter',
      'תיק פרויקטים חי',
      'סקירה שבועית אוטומטית',
      'מסלול עסקי מואץ',
      'עדכוני AI בזמן אמת',
    ],
  },
  {
    id: 'Business',
    price: 199,
    icon: '🏆',
    color: 'from-amber-600/20 to-orange-600/10',
    border: 'border-amber-500/30',
    features: [
      'כל מה שב-Pro',
      'ייעוץ 1:1 חודשי',
      'גישה מוקדמת לכלים חדשים',
      'תמיכה עדיפות',
      'סקירת קוד ופרויקטים',
    ],
  },
];

const WHATSAPP = process.env.NEXT_PUBLIC_MENTOR_WHATSAPP ?? '972500000000';

export default function MentorPricingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = PLANS.find((p) => p.id === selected);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !name.trim() || !email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/mentor/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), plan: selected }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // Grow not configured yet — fallback to Bit + WhatsApp
      if (data.fallback) {
        const msg = encodeURIComponent(
          `שלום! רוצה לרכוש גישה למנטור AI — תוכנית ${selected} ₪${selectedPlan?.price}/חודש\nשם: ${name}\nאימייל: ${email}`
        );
        window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
        return;
      }

      setError(data.error ?? 'שגיאה — נסה שוב');
    } catch {
      setError('שגיאת חיבור — נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            AI Master Mentor
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            מנטור AI אישי שזוכר אותך, יודע איפה עצרת, ומלמד אותך לבנות עסק
            אמיתי מ-AI — תוך 6 חודשים.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(plan.id)}
              className={`relative cursor-pointer bg-gradient-to-br ${plan.color} border rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                selected === plan.id
                  ? 'border-indigo-400 ring-2 ring-indigo-500/40 scale-[1.02]'
                  : plan.border + ' hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    הכי פופולרי
                  </span>
                </div>
              )}
              {selected === plan.id && (
                <div className="absolute top-3 left-3">
                  <span className="text-indigo-400 text-lg">✓</span>
                </div>
              )}

              <div className="text-3xl mb-3">{plan.icon}</div>
              <h2 className="text-xl font-bold text-white mb-1">{plan.id}</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">₪{plan.price}</span>
                <span className="text-slate-400 text-sm">/חודש</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5 flex-none">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Checkout form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-md mx-auto"
        >
          {!selected ? (
            <p className="text-center text-slate-500 text-sm">בחר תוכנית למעלה כדי להמשיך</p>
          ) : (
            <form
              onSubmit={handleCheckout}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-white font-semibold text-center">
                תוכנית {selected} — ₪{selectedPlan?.price}/חודש
              </h3>
              <div>
                <label className="block text-sm text-slate-400 mb-1">שם מלא</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">אימייל (לשליחת קוד הגישה)</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors hover:shadow-lg hover:shadow-indigo-600/30"
              >
                {loading ? 'מעבד...' : `שלם ₪${selectedPlan?.price} ←`}
              </button>

              <p className="text-slate-600 text-xs text-center">
                אחרי התשלום — קוד הגישה ישלח לאימייל שלך אוטומטית
              </p>
            </form>
          )}
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm mb-2">כבר יש לך קוד גישה?</p>
          <Link href="/mentor" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            כניסה למנטור ←
          </Link>
        </div>
      </div>
    </div>
  );
}
