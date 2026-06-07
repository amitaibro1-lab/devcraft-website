'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '🧠',
    title: 'זוכר אותך לאורך זמן',
    desc: 'המנטור שומר את כל ההתקדמות שלך — ציוני שליטה, פרויקטים, פערים. בכל שיחה הוא ממשיך בדיוק מהנקודה.',
  },
  {
    icon: '🎯',
    title: 'מסלול מותאם אישית',
    desc: 'אבחון ראשוני → מסלול 6 חודשים שנבנה עבורך → שיעור יומי עם המינוף הגבוה ביותר. לא קורס גנרי.',
  },
  {
    icon: '💰',
    title: 'טכני + עסקי ביחד',
    desc: 'כל נושא טכני מחובר לכסף: איך מוצאים לקוחות, כמה גובים, איך בונים SaaS. לא לומדים לשם לימוד.',
  },
  {
    icon: '📰',
    title: 'עדכוני AI בזמן אמת',
    desc: 'Claude, ChatGPT, Cursor, MCP — בכל שיחה המנטור מביא את החידושים הרלוונטיים ומסביר מה חשוב לך ללמוד.',
  },
];

const ROADMAP = [
  { phase: 'חודש 1–2', title: 'Agency', desc: 'כסף מהיר — שירותי אוטומציה ו-AI לעסקים', color: 'text-green-400', border: 'border-green-500/30' },
  { phase: 'חודש 3–4', title: 'SaaS', desc: 'הכנסה חוזרת — בניית מוצר AI עם מנויים', color: 'text-indigo-400', border: 'border-indigo-500/30' },
  { phase: 'חודש 5–6', title: 'Company', desc: 'חברה מבוססת AI עם הכנסה צומחת', color: 'text-amber-400', border: 'border-amber-500/30' },
];

const PLANS = [
  { id: 'Starter', price: 49, icon: '🌱', color: 'from-green-600/20 to-emerald-600/10', border: 'border-green-500/30', features: ['גישה מלאה למנטור', 'שיחות ללא הגבלה', 'מסלול מותאם'] },
  { id: 'Pro', price: 99, icon: '⚡', color: 'from-indigo-600/20 to-purple-600/10', border: 'border-indigo-500/30', popular: true, features: ['כל מה שב-Starter', 'תיק פרויקטים חי', 'סקירה שבועית'] },
  { id: 'Business', price: 199, icon: '🏆', color: 'from-amber-600/20 to-orange-600/10', border: 'border-amber-500/30', features: ['כל מה שב-Pro', 'ייעוץ 1:1 חודשי', 'תמיכה עדיפות'] },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'בוחר תוכנית', desc: 'מכניס שם + אימייל, משלם בכרטיס אשראי או ביט' },
  { step: '02', title: 'מקבל קוד גישה', desc: 'אימייל מגיע תוך דקות עם קוד אישי' },
  { step: '03', title: 'מתחיל ללמוד', desc: 'המנטור מאבחן אותך ובונה מסלול — מתחילים' },
];

export default function HomePage() {
  return (
    <div className="pt-16 overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-2 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            המנטור פעיל — ₪49/חודש בלבד
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
          >
            המנטור האישי שלך{' '}
            <span className="gradient-text">ל-AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            מנטור שזוכר אותך, יודע איפה עצרת, ומלמד אותך לבנות עסק אמיתי מ-AI —
            מ-0 לחברה, תוך 6 חודשים.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/mentor/pricing"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              התחל עכשיו — ₪49/חודש
            </Link>
            <Link
              href="/mentor"
              className="bg-white/10 hover:bg-white/15 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              יש לי קוד גישה ←
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-600 text-sm mt-6"
          >
            ביטול בכל עת · ללא התחייבות
          </motion.p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              לא קורס. מנטור.
            </h2>
            <p className="text-slate-400 text-lg">ההבדל שמשנה הכל</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-24 px-4 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              המסלול תוך 6 חודשים
            </h2>
            <p className="text-slate-400 text-lg">מ-0 לחברה מבוססת AI</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {ROADMAP.map((r, i) => (
              <motion.div
                key={r.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/5 border ${r.border} rounded-2xl p-6 text-center`}
              >
                <p className="text-xs text-slate-500 mb-2 font-medium">{r.phase}</p>
                <h3 className={`text-2xl font-extrabold mb-2 ${r.color}`}>{r.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">איך מתחילים?</h2>
            <p className="text-slate-400">3 דקות וה-מנטור שלך פעיל</p>
          </motion.div>

          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <span className="text-3xl font-extrabold text-indigo-500/40 font-mono leading-none mt-0.5">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-white font-bold mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">מחירים</h2>
            <p className="text-slate-400 text-lg">ביטול בכל עת · ללא התחייבות</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br ${plan.color} border ${plan.border} rounded-2xl p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">הכי פופולרי</span>
                  </div>
                )}
                <div className="text-3xl mb-2">{plan.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.id}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white">₪{plan.price}</span>
                  <span className="text-slate-400 text-sm">/חודש</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/mentor/pricing"
                  className={`block text-center font-bold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  בחר {plan.id}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-3xl p-12"
          >
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-3xl font-extrabold text-white mb-4">מוכן להתחיל?</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              כל יום שאתה מחכה — מישהו אחר בונה את העסק שרצית לבנות.
            </p>
            <Link
              href="/mentor/pricing"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              התחל עכשיו — ₪49/חודש ←
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} AmitaiCraft · AI Master Mentor
      </footer>
    </div>
  );
}
