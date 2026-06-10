import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  packageName?: string;
  amount: number;
  status: string;
  date: string;
  paymentRef?: string;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payments = readJSON<Payment[]>('payments.json');

    const header = ['תאריך', 'לקוח', 'אימייל', 'שירות', 'חבילה', 'סכום', 'סטטוס', 'מזהה תשלום'];
    const rows = payments.map((p) => [
      new Date(p.date).toLocaleDateString('he-IL'),
      p.customerName,
      p.customerEmail,
      p.serviceType,
      p.packageName || '',
      p.amount,
      p.status,
      p.paymentRef || '',
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const bom = '﻿';

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}
