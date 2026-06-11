'use client';

import { useEffect, useRef, useState } from 'react';

interface Coupon {
  code: string;
  creatorName: string;
  discountPercent: number;
  commissionPercent: number;
  active: boolean;
  createdAt: string;
  redemptions: number;
  revenue: number;
  creatorToken?: string;
}

interface Props {
  password: string;
}

export default function CouponsManager({ password }: Props) {
  const passwordRef = useRef(password);
  useEffect(() => { passwordRef.current = password; }, [password]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ creatorName: '', code: '', discountPercent: 20, commissionPercent: 30 });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState('');
  const [copiedDashboard, setCopiedDashboard] = useState('');

  function adminHeaders(json = false) {
    const h: Record<string, string> = { 'x-admin-password': passwordRef.current };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons', { headers: adminHeaders() });
      if (res.ok) setCoupons(await res.json());
      else console.error('load failed', res.status, await res.text());
    } catch (e) {
      console.error('load error', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: adminHeaders(true),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setForm({ creatorName: '', code: '', discountPercent: 20, commissionPercent: 30 });
        load();
      } else {
        setError(data.error ?? `שגיאה ${res.status}`);
      }
    } catch (e) {
      setError('שגיאת חיבור');
      console.error(e);
    }
    setCreating(false);
  };

  const toggleActive = async (code: string, active: boolean) => {
    await fetch('/api/coupons', {
      method: 'PATCH',
      headers: adminHeaders(true),
      body: JSON.stringify({ code, active }),
    });
    load();
  };

  const deleteCoupon = async (code: string) => {
    if (!confirm(`למחוק את הקופון ${code}?`)) return;
    await fetch('/api/coupons', {
      method: 'DELETE',
      headers: adminHeaders(true),
      body: JSON.stringify({ code }),
    });
    load();
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyLink = (code: string) => {
    const link = `${baseUrl}/mentor/pricing?coupon=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const copyDashboardLink = (token: string) => {
    const link = `${baseUrl}/creator/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedDashboard(token);
    setTimeout(() => setCopiedDashboard(''), 2000);
  };

  const totalRedemptions = coupons.reduce((s, c) => s + c.redemptions, 0);
  const totalRevenue = coupons.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'קופונים', value: coupons.length, color: 'text-indigo-400' },
          { label: 'סה"כ רכישות דרך קופון', value: totalRedemptions, color: 'text-green-400' },
          { label: 'הכנסה מקופונים', value: `₪${Math.round(totalRevenue)}`, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* New coupon form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">צור קופון ליוצר תוכן</h3>
        <form onSubmit={createCoupon} className="grid md:grid-cols-5 gap-3">
          <input
            required
            placeholder="שם היוצר"
            value={form.creatorName}
            onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            dir="rtl"
          />
          <input
            required
            placeholder="קוד (DAVID20)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            dir="ltr"
          />
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
            <input
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
              className="w-full bg-transparent py-2 text-white text-sm focus:outline-none"
              placeholder="הנחה %"
            />
            <span className="text-slate-500 text-xs whitespace-nowrap">% הנחה</span>
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
            <input
              type="number"
              min={0}
              max={100}
              value={form.commissionPercent}
              onChange={(e) => setForm({ ...form, commissionPercent: Number(e.target.value) })}
              className="w-full bg-transparent py-2 text-white text-sm focus:outline-none"
              placeholder="עמלה %"
            />
            <span className="text-slate-500 text-xs whitespace-nowrap">% עמלה</span>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
          >
            {creating ? 'יוצר...' : 'צור קופון'}
          </button>
        </form>

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Coupon list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-2">🎟️</p>
          <p>אין קופונים עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.code}
              className={`bg-white/5 border rounded-xl p-4 flex flex-wrap items-center gap-3 ${
                c.active ? 'border-white/10' : 'border-red-500/20 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium text-sm">{c.creatorName}</p>
                  <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full font-mono">
                    {c.code}
                  </span>
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                    {c.discountPercent}% הנחה
                  </span>
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {c.commissionPercent}% עמלה
                  </span>
                  {!c.active && (
                    <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                      מושבת
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  {c.redemptions} רכישות · ₪{Math.round(c.revenue)} הכנסה
                  {' · '}נוצר {new Date(c.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => copyLink(c.code)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-1.5 rounded-lg transition-colors"
                  title="העתק קישור מעקב לקהל"
                >
                  {copied === c.code ? '✓ הועתק' : '🔗 קישור'}
                </button>
                {c.creatorToken && (
                  <button
                    onClick={() => copyDashboardLink(c.creatorToken!)}
                    className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-1.5 rounded-lg transition-colors"
                    title="העתק קישור דשבורד ליוצר"
                  >
                    {copiedDashboard === c.creatorToken ? '✓ הועתק' : '📊 דשבורד יוצר'}
                  </button>
                )}
                <button
                  onClick={() => toggleActive(c.code, !c.active)}
                  className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${
                    c.active
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                  }`}
                >
                  {c.active ? 'השבת' : 'הפעל'}
                </button>
                <button
                  onClick={() => deleteCoupon(c.code)}
                  className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg transition-colors"
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
