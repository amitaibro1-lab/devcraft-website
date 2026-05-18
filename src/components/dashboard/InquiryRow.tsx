'use client';

import { useState } from 'react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  status: 'חדש' | 'בטיפול' | 'הושלם';
  createdAt: string;
}

const statusColors: Record<string, string> = {
  'חדש': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'בטיפול': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'הושלם': 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function InquiryRow({ inquiry, onStatusChange }: {
  inquiry: Inquiry;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    setUpdating(true);
    await onStatusChange(inquiry.id, status);
    setUpdating(false);
  };

  return (
    <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-300">{inquiry.name}</td>
      <td className="px-4 py-3 text-sm text-slate-400">{inquiry.email}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{inquiry.service}</td>
      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{inquiry.message}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{new Date(inquiry.createdAt).toLocaleDateString('he-IL')}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {(['חדש', 'בטיפול', 'הושלם'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={updating || inquiry.status === s}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                inquiry.status === s
                  ? statusColors[s]
                  : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
              } disabled:cursor-not-allowed`}
            >
              {s}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
}
