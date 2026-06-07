'use client';

import { useEffect, useRef, useState } from 'react';

interface Subscriber {
  token: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

interface Props {
  password: string;
}

const PLAN_COLORS: Record<string, string> = {
  Starter: 'text-green-400 bg-green-400/10',
  Pro: 'text-indigo-400 bg-indigo-400/10',
  Business: 'text-amber-400 bg-amber-400/10',
};

export default function MentorSubscribers({ password }: Props) {
  const passwordRef = useRef(password);
  useEffect(() => { passwordRef.current = password; }, [password]);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', plan: 'Starter', days: 30 });
  const [newToken, setNewToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [grantError, setGrantError] = useState('');
  const [granting, setGranting] = useState(false);

  function adminHeaders(json = false) {
    const h: Record<string, string> = { 'x-admin-password': passwordRef.current };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentor/grant', { headers: adminHeaders() });
      if (res.ok) {
        setSubscribers(await res.json());
      } else {
        console.error('load failed', res.status, await res.text());
      }
    } catch (e) {
      console.error('load error', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError('');
    setGranting(true);
    try {
      const res = await fetch('/api/mentor/grant', {
        method: 'POST',
        headers: adminHeaders(true),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.token) {
        setNewToken(data.token);
        setForm({ name: '', email: '', plan: 'Starter', days: 30 });
        load();
      } else {
        setGrantError(data.error ?? `שגיאה ${res.status}`);
      }
    } catch (e) {
      setGrantError('שגיאת חיבור');
      console.error(e);
    }
    setGranting(false);
  };

  const toggleActive = async (token: string, active: boolean) => {
    await fetch('/api/mentor/grant', {
      method: 'PATCH',
      headers: adminHeaders(true),
      body: JSON.stringify({ token, active }),
    });
    load();
  };

  const extendAccess = async (token: string) => {
    await fetch('/api/mentor/grant', {
      method: 'PATCH',
      headers: adminHeaders(true),
      body: JSON.stringify({ token, extendDays: 30 }),
    });
    load();
  };

  const deleteSubscriber = async (token: string) => {
    if (!confirm('למחוק את המנוי?')) return;
    await fetch('/api/mentor/grant', {
      method: 'DELETE',
      headers: adminHeaders(true),
      body: JSON.stringify({ token }),
    });
    load();
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const active = subscribers.filter((s) => s.active && !isExpired(s.expiresAt));
  const inactive = subscribers.filter((s) => !s.active || isExpired(s.expiresAt));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'מנויים פעילים', value: active.length, color: 'text-green-400' },
          { label: 'סה"כ מנויים', value: subscribers.length, color: 'text-indigo-400' },
          {
            label: 'הכנסה חודשית',
            value: `₪${active.reduce((sum, s) => {
              const prices: Record<string, number> = { Starter: 49, Pro: 99, Business: 199 };
              return sum + (prices[s.plan] ?? 0);
            }, 0)}`,
            color: 'text-amber-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* New subscriber form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">הוסף מנוי חדש</h3>
        <form onSubmit={grantAccess} className="grid md:grid-cols-5 gap-3">
          <input
            required
            placeholder="שם מלא"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 md:col-span-1"
            dir="rtl"
          />
          <input
            required
            type="email"
            placeholder="אימייל"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 md:col-span-1"
            dir="ltr"
          />
          <select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="Starter">Starter — ₪49</option>
            <option value="Pro">Pro — ₪99</option>
            <option value="Business">Business — ₪199</option>
          </select>
          <input
            type="number"
            min={1}
            value={form.days}
            onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="ימים"
          />
          <button
            type="submit"
            disabled={granting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
          >
            {granting ? 'יוצר...' : 'צור גישה'}
          </button>
        </form>

        {grantError && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">⚠️ {grantError}</p>
          </div>
        )}

        {newToken && (
          <div className="mt-4 bg-green-600/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm font-semibold mb-2">✓ קוד גישה נוצר — שלח ללקוח:</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-white text-xs bg-black/30 rounded-lg px-3 py-2 font-mono break-all">
                {newToken}
              </code>
              <button
                onClick={() => copyToken(newToken)}
                className="flex-none bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? '✓ הועתק' : 'העתק'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscribers list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-2">👥</p>
          <p>אין מנויים עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscribers.map((sub) => {
            const expired = isExpired(sub.expiresAt);
            const daysLeft = Math.ceil(
              (new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={sub.token}
                className={`bg-white/5 border rounded-xl p-4 flex flex-wrap items-center gap-3 ${
                  sub.active && !expired ? 'border-white/10' : 'border-red-500/20 opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium text-sm">{sub.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        PLAN_COLORS[sub.plan] ?? 'text-slate-400 bg-slate-400/10'
                      }`}
                    >
                      {sub.plan}
                    </span>
                    {!sub.active && (
                      <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                        מושהה
                      </span>
                    )}
                    {expired && (
                      <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                        פג תוקף
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{sub.email}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {expired
                      ? `פג תוקף לפני ${Math.abs(daysLeft)} ימים`
                      : `${daysLeft} ימים נותרו`}
                    {' · '}נוצר {new Date(sub.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyToken(sub.token)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-1.5 rounded-lg transition-colors"
                    title="העתק קוד גישה"
                  >
                    📋 קוד
                  </button>
                  <button
                    onClick={() => extendAccess(sub.token)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    +30 יום
                  </button>
                  <button
                    onClick={() => toggleActive(sub.token, !sub.active)}
                    className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${
                      sub.active
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                        : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                    }`}
                  >
                    {sub.active ? 'השהה' : 'הפעל'}
                  </button>
                  <button
                    onClick={() => deleteSubscriber(sub.token)}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    מחק
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
