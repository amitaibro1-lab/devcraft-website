import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

// GET is public — the public site reads business config to render pages.
export async function GET() {
  try {
    const config = readJSON('config.json');
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    writeJSON('config.json', body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשמירה' }, { status: 500 });
  }
}
