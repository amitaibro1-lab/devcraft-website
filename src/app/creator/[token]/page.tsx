'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface CreatorStats {
  creatorName: string;
  code: string;
  discountPercent: number;
  commissionPercent: number;
  redemptions: number;
  revenue: number;
  commissionEarned: number;
  createdAt: string;
}

export default function CreatorDashboardPage() {
  const params = useParams();
  const token = params?.token as string;

  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/creator/${token}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setStats(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const trackingLink =
    typeof window !== 'undefined' && stats
      ? `${window.location.origin}/mentor/pricing?coupon=${stats.code}`
      : '';

  const copyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">קישור לא נמצא</h1>
          <p className="text-slate-400">הקישור שגוי או שפג תוקפו.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'רכישות דרך הקוד שלך',
      value: stats.redemptions,
      icon: '🛒',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'סה"כ הכנסה שהבאת',
      value: `₪${stats.revenue.toLocaleString()}`,
      icon: '💰',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'עמלה שהרווחת',
      value: `₪${stats.commissionEarned.toLocaleString()}`,
      icon: '🎯',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-indigo-400 font-mono text-sm font-bold tracking-widest mb-3 uppercase">
          learnyai · שותפים
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">
          שלום {stats.creatorName} 👋
        </h1>
        <p className="text-slate-400">הדשבורד האישי שלך — עוקב אחרי הביצועים שלך בזמן אמת</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`border rounded-2xl p-5 text-center ${s.bg}`}>
            <p className="text-3xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">פרטי הקופון שלך</h2>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">קוד הקופון</span>
          <span className="text-indigo-400 font-mono font-bold text-lg bg-indigo-400/10 px-4 py-1.5 rounded-xl">
            {stats.code}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">הנחה לקהל שלך</span>
          <span className="text-green-400 font-bold">{stats.discountPercent}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">העמלה שלך על כל רכישה</span>
          <span className="text-amber-400 font-bold">{stats.commissionPercent}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">שותף מאז</span>
          <span className="text-slate-300 text-sm">
            {new Date(stats.createdAt).toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Tracking link */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-3">קישור המעקב שלך</h2>
        <p className="text-slate-400 text-sm mb-4">
          שתף את הקישור הזה עם הקהל שלך — כל רכישה דרכו נספרת ומיוחסת אליך אוטומטית.
        </p>
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-400 truncate">
            {trackingLink}
          </div>
          <button
            onClick={copyLink}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {copied ? '✓ הועתק!' : 'העתק קישור'}
          </button>
        </div>
      </div>
    </div>
  );
}
