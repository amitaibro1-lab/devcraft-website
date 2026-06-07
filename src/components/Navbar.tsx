'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/#features', label: 'מה זה' },
  { href: '/#pricing', label: 'מחירים' },
  { href: '/about', label: 'אודות' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith('/dashboard')) return null;
  if (pathname.startsWith('/mentor')) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span>🧠</span>
          <span className="gradient-text">AI Master Mentor</span>
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/mentor"
            className="text-sm text-slate-300 hover:text-white transition-colors font-medium"
          >
            כניסה
          </Link>
          <Link
            href="/mentor/pricing"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 font-bold hover:shadow-lg hover:shadow-indigo-600/30"
          >
            התחל עכשיו ←
          </Link>
        </div>

        <button
          className="md:hidden text-slate-300 hover:text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="תפריט"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#13132a] border-t border-white/10 px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link href="/mentor" onClick={() => setOpen(false)} className="block text-center py-2 text-sm text-slate-300 font-medium">
              כניסה
            </Link>
            <Link href="/mentor/pricing" onClick={() => setOpen(false)} className="block text-center bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">
              התחל עכשיו ←
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
