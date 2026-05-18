'use client';

import { motion } from 'framer-motion';

const techStack = [
  'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js',
  'Python', 'PostgreSQL', 'MongoDB', 'Docker',
  'Telegram Bot API', 'WhatsApp API', 'Discord API', 'OpenAI API',
];

const domains = [
  { icon: '🌐', title: 'פיתוח אתרים ומערכות Web' },
  { icon: '⚡', title: 'אוטומציות לעסקים וקהילות' },
  { icon: '🤖', title: 'בוטים ל-Discord, WhatsApp ו-Telegram' },
  { icon: '🔗', title: 'חיבורי API ומערכות CRM' },
  { icon: '📊', title: 'דשבורדים ומערכות ניהול' },
  { icon: '🧠', title: 'פתרונות AI מותאמים אישית' },
];

const principles = [
  { icon: '✨', title: 'קוד נקי ומודרני' },
  { icon: '🚀', title: 'ביצועים גבוהים' },
  { icon: '🎯', title: 'חוויית משתמש איכותית' },
  { icon: '⚙️', title: 'אוטומציה של תהליכים' },
  { icon: '📈', title: 'תשתית שניתן להרחיב לאורך זמן' },
];

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen px-4 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-28 h-28 bg-indigo-600/20 border-2 border-indigo-500/50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
            👨‍💻
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-2">אמיתי</h1>
          <p className="text-indigo-400 font-semibold text-lg">מפתח מערכות דיגיטל, אוטומציות ופתרונות AI</p>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10"
        >
          <div className="text-slate-300 space-y-5 leading-relaxed text-base">
            <p>
              אני אמיתי, מפתח מערכות דיגיטל, אוטומציות ופתרונות AI המתמחה בבניית מוצרים חכמים לעסקים, קהילות ומותגים.
            </p>
            <p>
              אני עוסק בפיתוח אתרים, דפי נחיתה, מערכות ניהול, בוטים ואינטגרציות מתקדמות, עם מטרה אחת ברורה:
              ליצור פתרונות שלא רק נראים טוב, אלא גם עובדים בצורה יעילה, חוסכים זמן ומייצרים תוצאות אמיתיות.
            </p>
            <p>
              העבודה שלי משלבת בין טכנולוגיה, חוויית משתמש וחשיבה עסקית.
              כל פרויקט נבנה מתוך מחשבה על ביצועים, אוטומציה, scalability וחוויית שימוש מודרנית.
            </p>
          </div>
        </motion.div>

        {/* Domains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">תחומי עבודה</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {domains.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3"
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{d.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Approach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">הגישה שלי</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            אני אוהב לקחת רעיון משלב הקונספט ולהפוך אותו למערכת אמיתית, יציבה ומוכנה לצמיחה.
            הגישה שלי מתמקדת בבנייה חכמה לטווח ארוך, עם דגש על:
          </p>
          <div className="space-y-3">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-slate-300 text-sm">{p.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-8 mb-10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">המטרה שלי</h2>
          <p className="text-slate-300 leading-relaxed">
            לבנות מוצרים שנותנים ערך אמיתי, פותרים בעיות בצורה יצירתית ועוזרים לאנשים ולעסקים
            לעבוד בצורה חכמה יותר בעולם דיגיטלי שמתפתח במהירות.
          </p>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                className="bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-3">בוא נבנה משהו יחד 🚀</h3>
          <p className="text-slate-400 mb-6">יש לך רעיון? בוא נהפוך אותו למציאות</p>
          <a
            href="/contact"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            צור קשר עכשיו
          </a>
        </motion.div>

      </div>
    </div>
  );
}
