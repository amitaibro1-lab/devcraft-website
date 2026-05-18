'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'בית' },
  { href: '/services', label: 'שירותים' },
  { href: '/pricing', label: 'מחירים' },
  { href: '/about', label: 'אודות' },
  { href: '/contact', label: 'צור קשר' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold gradient-text">DevCraft</Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                  pathname === l.href ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          className="hidden md:block bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          התחל פרויקט
        </Link>

        {/* Mobile burger */}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#13132a] border-t border-white/10 px-4 py-4">
          <ul className="flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                    pathname === l.href ? 'text-indigo-400' : 'text-slate-300'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
