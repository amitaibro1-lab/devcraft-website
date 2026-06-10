'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
  {
    id: 'Starter',
    monthlyPrice: 49,
    annualDiscount: 0.10,
    icon: '🌱',
    color: 'from-green-600/20 to-emerald-600/10',
    border: 'border-green-500/30',
    accentColor: 'text-green-400',
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
    monthlyPrice: 99,
    annualDiscount: 0.15,
    icon: '⚡',
    color: 'from-indigo-600/20 to-purple-600/10',
    border: 'border-indigo-500/30',
    accentColor: 'text-indigo-400',
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
    monthlyPrice: 199,
    annualDiscount: 0.20,
    icon: '🏆',
    color: 'from-amber-600/20 to-orange-600/10',
    border: 'border-amber-500/30',
    accentColor: 'text-amber-400',
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

function getPrices(plan: typeof PLANS[0], annual: boolean) {
  if (!annual) return { display: plan.monthlyPrice, period: '/חודש', total: null };
  const yearly = Math.round(plan.monthlyPrice * 12 * (1 - plan.annualDiscount));
  const perMonth = Math.round(yearly / 12);
  const saved = plan.monthlyPrice * 12 - yearly;
  return { display: perMonth, period: '/חודש', total: yearly, saved };
}

export default function MentorPricingPage() {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = PLANS.find((p) => p.id === selected);
  const selectedPrices = selectedPlan ? getPrices(selectedPlan, annual) : null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !name.trim() || !email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/mentor/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          plan: selected,
          annual,
          amount: annual ? selectedPrices?.total : selectedPlan?.monthlyPrice,
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.fallback) {
        const price = annual ? `₪${selectedPrices?.total}/שנה` : `₪${selectedPlan?.monthlyPrice}/חודש`;
        const msg = encodeURIComponent(
          `שלום! רוצה לרכוש גישה למנטור AI — תוכנית ${selected} ${price}\nשם: ${name}\nאימייל: ${email}`
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
          className="text-center mb-10"
        >
          <img src="/logo.svg" alt="AI Master Mentor" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            AI Master Mentor
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            מנטור AI אישי שזוכר אותך, יודע איפה עצרת, ומלמד אותך לבנות עסק אמיתי מ-AI.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-slate-500'}`}>חודשי</span>
          <button
            onClick={() => { setAnnual(!annual); setSelected(null); }}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? 'bg-indigo-600' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${annual ? 'right-1' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-slate-500'}`}>
            שנתי
            <span className="mr-1.5 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
              עד 20% הנחה
            </span>
          </span>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan, i) => {
            const prices = getPrices(plan, annual);
            const discountPct = Math.round(plan.annualDiscount * 100);
            return (
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
                {annual && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPct}%
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

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-white">₪{prices.display}</span>
                  <span className="text-slate-400 text-sm">{prices.period}</span>
                </div>

                {annual && prices.total && (
                  <div className="mb-3 space-y-0.5">
                    <p className="text-xs text-slate-400">₪{prices.total} לשנה</p>
                    <p className={`text-xs font-medium ${plan.accentColor}`}>
                      חוסך ₪{prices.saved} בשנה
                    </p>
                  </div>
                )}
                {!annual && <div className="mb-3" />}

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5 flex-none">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
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
                {selected} — {annual
                  ? `₪${selectedPrices?.total}/שנה`
                  : `₪${selectedPlan?.monthlyPrice}/חודש`}
              </h3>
              {annual && selectedPrices?.saved && (
                <p className="text-center text-green-400 text-xs -mt-2">
                  חוסך ₪{selectedPrices.saved} לעומת תשלום חודשי
                </p>
              )}
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
                {loading
                  ? 'מעבד...'
                  : annual
                    ? `שלם ₪${selectedPrices?.total} לשנה ←`
                    : `שלם ₪${selectedPlan?.monthlyPrice}/חודש ←`}
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
