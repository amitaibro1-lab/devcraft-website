'use client';

import { useState } from 'react';
import PackageEditor from './PackageEditor';

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

interface ServiceEditorProps {
  service: Service;
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
}

export default function ServiceEditor({ service, onUpdate, onDelete }: ServiceEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [local, setLocal] = useState<Service>(service);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field: keyof Service, value: unknown) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const updateFeature = (i: number, val: string) => {
    set('features', local.features.map((f, j) => (j === i ? val : f)));
  };
  const addFeature = () => set('features', [...local.features, '']);
  const removeFeature = (i: number) => set('features', local.features.filter((_, j) => j !== i));

  const save = async () => {
    setSaving(true);
    await onUpdate(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-right"
      >
        <span className="text-2xl">{local.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-white">{local.name}</p>
          <p className="text-xs text-slate-400">
            {local.pricingType === 'packages'
              ? `${local.packages.length} חבילות | מ-₪${Math.min(...local.packages.map((p) => p.price)) || 0}`
              : `מחיר מינימלי ₪${local.minPrice}`}
          </p>
        </div>
        <span className="text-slate-500 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-white/10 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">שם השירות</label>
              <input
                value={local.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">אייקון (emoji)</label>
              <input
                value={local.icon}
                onChange={(e) => set('icon', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">סוג תמחור</label>
              <select
                value={local.pricingType}
                onChange={(e) => set('pricingType', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="packages">חבילות קבועות</option>
                <option value="custom">מחיר מינימלי + פנייה</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">תיאור</label>
            <input
              value={local.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {local.pricingType === 'custom' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">מחיר מינימלי (₪)</label>
              <input
                type="number"
                value={local.minPrice}
                onChange={(e) => set('minPrice', Number(e.target.value))}
                className="w-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-2">תכונות השירות</label>
            <div className="space-y-2">
              {local.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="תכונה..."
                  />
                  <button onClick={() => removeFeature(i)} className="text-slate-500 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
              <button onClick={addFeature} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                + הוסף תכונה
              </button>
            </div>
          </div>

          {local.pricingType === 'packages' && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">חבילות ומחירים</label>
              <PackageEditor
                packages={local.packages}
                onChange={(pkgs) => set('packages', pkgs)}
              />
            </div>
          )}

          <div className="flex gap-3 justify-between pt-2">
            <button
              onClick={() => onDelete(local.id)}
              className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ מחק שירות
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? 'שומר...' : saved ? '✓ נשמר!' : 'שמור שינויים'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
