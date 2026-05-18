import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'DevCraft — פתרונות דיגיטל מתקדמים',
  description: 'בניית אתרים, דפי נחיתה, אוטומציות ובוטים חכמים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-[#0f0f1a] text-slate-100 antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
