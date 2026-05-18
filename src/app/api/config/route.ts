import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

export async function GET() {
  try {
    const config = readJSON('config.json');
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    writeJSON('config.json', body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשמירה' }, { status: 500 });
  }
}
