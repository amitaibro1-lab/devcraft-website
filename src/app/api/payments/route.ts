import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payments = readJSON('payments.json');
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}
