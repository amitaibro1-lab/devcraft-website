'use client';

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

const statusColors: Record<string, string> = {
  paid: 'bg-green-500/20 text-green-400 border border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
};
const statusLabels: Record<string, string> = { paid: 'שולם', pending: 'ממתין', failed: 'נכשל' };

export default function PaymentsTable({ payments }: { payments: Payment[] }) {
  const exportCSV = () => {
    window.location.href = '/api/payments/export';
  };

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400">סה"כ הכנסות</p>
          <p className="text-2xl font-extrabold text-green-400">₪{totalRevenue.toLocaleString()}</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          ⬇️ ייצוא CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              {['תאריך', 'לקוח', 'שירות', 'חבילה', 'סכום', 'סטטוס'].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">אין תשלומים עדיין</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{new Date(p.date).toLocaleDateString('he-IL')}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200">{p.customerName}</div>
                    <div className="text-slate-500 text-xs">{p.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{p.serviceType}</td>
                  <td className="px-4 py-3 text-slate-400">{p.packageName || '—'}</td>
                  <td className="px-4 py-3 font-bold text-indigo-400">₪{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
