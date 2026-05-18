'use client';

import { motion } from 'framer-motion';

const techStack = [
  'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js',
  'Python', 'PostgreSQL', 'MongoDB', 'Docker',
  'Telegram Bot API', 'WhatsApp API', 'OpenAI API', 'Framer Motion',
];

const skills = [
  { name: 'פיתוח Full Stack', level: 95 },
  { name: 'אוטומציות ובוטים', level: 92 },
  { name: 'UI/UX Design', level: 80 },
  { name: 'AI & Machine Learning', level: 75 },
  { name: 'DevOps & Cloud', level: 70 },
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
          <p className="text-indigo-400 font-semibold text-lg mb-4">Full Stack Developer & Automation Expert</p>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            מפתח עם תשוקה לפתרונות דיגיטליים שעובדים. בונה אתרים, בוטים ואוטומציות שחוסכות זמן ומכניסות כסף.
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">הסיפור שלי</h2>
          <div className="text-slate-400 space-y-4 leading-relaxed">
            <p>
              התחלתי לתכנת מגיל צעיר מתוך סקרנות טהורה — ומאז זה הפך לקריירה.
              בניתי עשרות פרויקטים לעסקים ויחידים, מאתרים פשוטים ועד מערכות אוטומציה מורכבות עם אינטגרציות AI.
            </p>
            <p>
              אני מאמין שטכנולוגיה טובה צריכה לעבוד בשקט ברקע ולהביא תוצאות — יותר לקוחות, יותר מכירות, פחות עבודה ידנית.
              לכן אני מתמקד בפתרונות שמביאים ROI אמיתי ומדיד.
            </p>
            <p>
              עובד עם עסקים קטנים ובינוניים, יזמים וסטארטאפים שרוצים להפוך רעיון למוצר עובד — מהר ובתקציב הגיוני.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { value: '50+', label: 'פרויקטים הושלמו' },
            { value: '40+', label: 'לקוחות מרוצים' },
            { value: '5+', label: 'שנות ניסיון' },
            { value: '24h', label: 'זמן מענה מקסימלי' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 text-center"
            >
              <div className="text-3xl font-extrabold text-indigo-400 mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
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

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">מיומנויות</h2>
          <div className="space-y-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">{skill.name}</span>
                  <span className="text-slate-500">{skill.level}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  />
                </div>
              </motion.div>
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
          <h3 className="text-2xl font-bold text-white mb-3">בוא נעבוד יחד 🤝</h3>
          <p className="text-slate-400 mb-6">מוכן לשמוע על הפרויקט שלך ולמצוא את הפתרון המתאים</p>
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
