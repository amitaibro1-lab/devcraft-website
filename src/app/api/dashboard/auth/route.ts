import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let password = '';
  try {
    password = (await req.json())?.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const correct = (process.env.DASHBOARD_PASSWORD ?? '').trim();
  if (!correct) {
    // Fail closed — no hardcoded fallback password.
    console.error('[dashboard/auth] DASHBOARD_PASSWORD not set');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (safeEqual(String(password).trim(), correct)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
