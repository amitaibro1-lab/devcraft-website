'use client';

interface Package {
  name: string;
  price: number;
  features: string[];
}

interface PackageEditorProps {
  packages: Package[];
  onChange: (packages: Package[]) => void;
}

export default function PackageEditor({ packages, onChange }: PackageEditorProps) {
  const update = (index: number, field: keyof Package, value: string | number | string[]) => {
    const updated = packages.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(updated);
  };

  const addFeature = (pIndex: number) => {
    const updated = packages.map((p, i) =>
      i === pIndex ? { ...p, features: [...p.features, ''] } : p
    );
    onChange(updated);
  };

  const updateFeature = (pIndex: number, fIndex: number, value: string) => {
    const updated = packages.map((p, i) =>
      i === pIndex
        ? { ...p, features: p.features.map((f, j) => (j === fIndex ? value : f)) }
        : p
    );
    onChange(updated);
  };

  const removeFeature = (pIndex: number, fIndex: number) => {
    const updated = packages.map((p, i) =>
      i === pIndex ? { ...p, features: p.features.filter((_, j) => j !== fIndex) } : p
    );
    onChange(updated);
  };

  const addPackage = () => {
    onChange([...packages, { name: 'חבילה חדשה', price: 100, features: [''] }]);
  };

  const removePackage = (index: number) => {
    onChange(packages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {packages.map((pkg, pIdx) => (
        <div key={pIdx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex gap-3 items-center">
            <input
              value={pkg.name}
              onChange={(e) => update(pIdx, 'name', e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="שם החבילה"
            />
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">₪</span>
              <input
                type="number"
                value={pkg.price}
                onChange={(e) => update(pIdx, 'price', Number(e.target.value))}
                className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => removePackage(pIdx)}
              className="text-red-400 hover:text-red-300 text-sm p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              🗑️
            </button>
          </div>
          <div className="space-y-2 pr-2">
            {pkg.features.map((f, fIdx) => (
              <div key={fIdx} className="flex gap-2 items-center">
                <span className="text-indigo-400 text-xs">✓</span>
                <input
                  value={f}
                  onChange={(e) => updateFeature(pIdx, fIdx, e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="תכונה..."
                />
                <button
                  onClick={() => removeFeature(pIdx, fIdx)}
                  className="text-slate-500 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addFeature(pIdx)}
              className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
            >
              + הוסף תכונה
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addPackage}
        className="w-full border border-dashed border-white/20 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 text-sm py-3 rounded-xl transition-colors"
      >
        + הוסף חבילה
      </button>
    </div>
  );
}
