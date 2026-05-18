'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KPICard from '@/components/dashboard/KPICard';
import InquiriesBarChart from '@/components/dashboard/BarChart';
import InquiryRow from '@/components/dashboard/InquiryRow';
import PaymentsTable from '@/components/dashboard/PaymentsTable';
import ServiceEditor from '@/components/dashboard/ServiceEditor';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  status: 'חדש' | 'בטיפול' | 'הושלם';
  createdAt: string;
}

interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  packageName?: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  paymentRef?: string;
}

interface Package {
  name: string;
  price: number;
  features: string[];
}

interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  pricingType: 'packages' | 'custom';
  minPrice: number;
  packages: Package[];
}

interface Config {
  businessName: string;
  contactEmail: string;
  description: string;
  depositPercent: number;
}

const TABS = [
  { id: 'overview', label: 'סקירה כללית', icon: '📊' },
  { id: 'inquiries', label: 'פניות', icon: '💬' },
  { id: 'payments', label: 'תשלומים', icon: '💳' },
  { id: 'services', label: 'שירותים ומחירים', icon: '🛠️' },
  { id: 'settings', label: 'הגדרות', icon: '⚙️' },
];

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/dashboard/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      onLogin();
    } else {
      setError('סיסמה שגויה');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-white">כניסה לדשבורד</h1>
          <p className="text-slate-400 text-sm mt-1">DevCraft Admin</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'בודק...' : 'כניסה'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<Config>({
    businessName: 'DevCraft',
    contactEmail: 'luffybaz111@gmail.com',
    description: 'פתרונות דיגיטל מתקדמים',
    depositPercent: 50,
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    const [inq, pay, svc, cfg] = await Promise.all([
      fetch('/api/inquiries').then((r) => r.json()),
      fetch('/api/payments').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()),
    ]);
    setInquiries(Array.isArray(inq) ? inq : []);
    setPayments(Array.isArray(pay) ? pay : []);
    setServices(Array.isArray(svc) ? svc : []);
    setConfig(cfg);
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const updateInquiryStatus = async (id: string, status: string) => {
    await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setInquiries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: status as Inquiry['status'] } : q))
    );
  };

  const updateService = async (updated: Service) => {
    const next = services.map((s) => (s.id === updated.id ? updated : s));
    setServices(next);
    await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const deleteService = async (id: string) => {
    const next = services.filter((s) => s.id !== id);
    setServices(next);
    await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const addService = async () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: 'שירות חדש',
      icon: '✨',
      description: 'תיאור השירות',
      features: ['תכונה 1', 'תכונה 2'],
      pricingType: 'packages',
      minPrice: 100,
      packages: [
        { name: 'בסיסית', price: 100, features: ['תכונה א'] },
        { name: 'מתקדמת', price: 300, features: ['תכונה א', 'תכונה ב'] },
        { name: 'פרימיום', price: 600, features: ['תכונה א', 'תכונה ב', 'תכונה ג'] },
      ],
    };
    const next = [...services, newService];
    setServices(next);
    await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const saveConfig = async () => {
    setConfigSaving(true);
    await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
    setConfigSaving(false);
  };

  // ── KPI calculations ───────────────────────────────────────────────────────
  const now = new Date();
  const thisMonth = (d: string) => {
    const dt = new Date(d);
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  };
  const monthlyInquiries = inquiries.filter((q) => thisMonth(q.createdAt)).length;
  const activeProjects = inquiries.filter((q) => q.status === 'בטיפול').length;
  const monthlyRevenue = payments
    .filter((p) => p.status === 'paid' && thisMonth(p.date))
    .reduce((s, p) => s + p.amount, 0);

  const serviceChartData = Object.entries(
    inquiries.reduce((acc, q) => {
      acc[q.service] = (acc[q.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([service, count]) => ({ service, count }));

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-[#0d0d1f] border-l border-white/10 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-bold gradient-text">DevCraft</h1>
          <p className="text-xs text-slate-500 mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-right ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setAuthed(false)}
            className="w-full text-slate-500 hover:text-red-400 text-xs text-right transition-colors"
          >
            יציאה →
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#0a0a14] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h2 className="text-lg font-bold text-white">
            {TABS.find((t) => t.id === activeTab)?.icon}{' '}
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <button
            onClick={load}
            className="text-slate-400 hover:text-indigo-400 text-sm transition-colors"
            title="רענן נתונים"
          >
            🔄
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* ── Overview ───────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <KPICard title="פניות החודש" value={monthlyInquiries} icon="📬" color="indigo" index={0} />
                  <KPICard title="פרויקטים פעילים" value={activeProjects} icon="🚀" color="purple" index={1} />
                  <KPICard title={`הכנסה חודשית`} value={`₪${monthlyRevenue.toLocaleString()}`} icon="💰" color="green" index={2} />
                  <KPICard title="סה״כ פניות" value={inquiries.length} icon="📋" color="blue" index={3} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-4">פניות לפי שירות</h3>
                    <InquiriesBarChart data={serviceChartData} />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-4">פניות אחרונות</h3>
                    <div className="space-y-3">
                      {inquiries.slice(-5).reverse().map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-slate-200 font-medium">{q.name}</p>
                            <p className="text-slate-500 text-xs">{q.service}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            q.status === 'חדש' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : q.status === 'בטיפול' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                      ))}
                      {inquiries.length === 0 && <p className="text-slate-500 text-sm">אין פניות עדיין</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Inquiries ──────────────────────────────────────────────────── */}
            {activeTab === 'inquiries' && (
              <motion.div key="inquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {['שם', 'אימייל', 'שירות', 'הודעה', 'תאריך', 'סטטוס'].map((h) => (
                          <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">אין פניות עדיין</td></tr>
                      ) : (
                        inquiries.map((q) => (
                          <InquiryRow key={q.id} inquiry={q} onStatusChange={updateInquiryStatus} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Payments ───────────────────────────────────────────────────── */}
            {activeTab === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PaymentsTable payments={payments} />
              </motion.div>
            )}

            {/* ── Services editor ────────────────────────────────────────────── */}
            {activeTab === 'services' && (
              <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {services.map((s) => (
                  <ServiceEditor
                    key={s.id}
                    service={s}
                    onUpdate={updateService}
                    onDelete={deleteService}
                  />
                ))}
                <button
                  onClick={addService}
                  className="w-full border border-dashed border-white/20 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 py-4 rounded-2xl text-sm transition-colors font-medium"
                >
                  + הוסף שירות חדש
                </button>
              </motion.div>
            )}

            {/* ── Settings ───────────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-lg space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">שם העסק</label>
                    <input
                      value={config.businessName}
                      onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">אימייל ליצירת קשר</label>
                    <input
                      type="email"
                      value={config.contactEmail}
                      onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">תיאור קצר</label>
                    <textarea
                      rows={3}
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      אחוז מקדמה ({config.depositPercent}%)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={config.depositPercent}
                      onChange={(e) => setConfig({ ...config, depositPercent: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>10%</span>
                      <span className="text-indigo-400 font-bold">{config.depositPercent}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <button
                    onClick={saveConfig}
                    disabled={configSaving}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                  >
                    {configSaving ? 'שומר...' : configSaved ? '✓ נשמר!' : 'שמור הגדרות'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
