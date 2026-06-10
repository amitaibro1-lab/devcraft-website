'use client';

import { useState } from 'react';

const PLAN_PRESETS = [
  { label: 'Starter', price: 49 },
  { label: 'Pro', price: 99 },
  { label: 'Business', price: 199 },
];

export default function PartnershipCalculator() {
  const [basePrice, setBasePrice] = useState(99);
  const [commission, setCommission] = useState(30);
  const [discount, setDiscount] = useState(20);
  const [fee, setFee] = useState(6.5);

  // Commission base = amount actually paid (after the audience discount).
  const pricePaid = basePrice * (1 - discount / 100);
  const processingFee = pricePaid * (fee / 100);
  const creatorCut = pricePaid * (commission / 100);
  const myNet = pricePaid - processingFee - creatorCut;
  const myNetPct = basePrice > 0 ? (myNet / basePrice) * 100 : 0;

  const fmt = (n: number) => `₪${(Math.round(n * 100) / 100).toLocaleString('he-IL')}`;

  const Field = ({
    label, value, onChange, suffix, step = 1,
  }: { label: string; value: number; onChange: (n: number) => void; suffix: string; step?: number }) => (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent py-2.5 text-white text-sm focus:outline-none"
        />
        <span className="text-slate-500 text-xs whitespace-nowrap">{suffix}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-1">מחשבון שותפות</h3>
        <p className="text-slate-500 text-xs mb-4">
          חשב את החלוקה לפני שאתה סוגר עסקה עם יוצר תוכן. עמלת היוצר מחושבת מהסכום ששולם (אחרי הנחה).
        </p>

        {/* Plan quick-picks */}
        <div className="flex gap-2 mb-4">
          {PLAN_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setBasePrice(p.price)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                basePrice === p.price
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {p.label} — ₪{p.price}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="מחיר בסיס" value={basePrice} onChange={setBasePrice} suffix="₪" />
          <Field label="הנחת קופון" value={discount} onChange={setDiscount} suffix="%" />
          <Field label="עמלת יוצר התוכן" value={commission} onChange={setCommission} suffix="%" />
          <Field label="עמלת סליקה" value={fee} onChange={setFee} suffix="%" step={0.1} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        {[
          { label: 'הלקוח משלם (אחרי הנחה)', value: fmt(pricePaid), color: 'text-white' },
          { label: `עמלת סליקה (${fee}%)`, value: `−${fmt(processingFee)}`, color: 'text-red-400' },
          { label: `עמלת יוצר התוכן (${commission}%)`, value: `−${fmt(creatorCut)}`, color: 'text-amber-400' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{row.label}</span>
            <span className={`font-medium ${row.color}`}>{row.value}</span>
          </div>
        ))}

        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-white font-semibold">אתה מקבל נטו</span>
          <div className="text-left">
            <span className="text-green-400 font-bold text-lg">{fmt(myNet)}</span>
            <span className="text-slate-500 text-xs mr-2">
              ({myNetPct.toFixed(1)}% מהמחיר)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
