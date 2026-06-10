import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface Inquiry {
  id: string;
  status: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const inquiries = readJSON('inquiries.json');
    return NextResponse.json(inquiries);
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, status } = await req.json();
    const inquiries = readJSON<Inquiry[]>('inquiries.json');
    const updated = inquiries.map((q) => (q.id === id ? { ...q, status } : q));
    writeJSON('inquiries.json', updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}
