'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  service: string;
  count: number;
}

const COLORS = ['#6366f1', '#a78bfa', '#ec4899', '#22c55e'];

export default function InquiriesBarChart({ data }: { data: ChartData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        אין נתונים להצגה
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis dataKey="service" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }}
          cursor={{ fill: 'rgba(99,102,241,0.1)' }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
