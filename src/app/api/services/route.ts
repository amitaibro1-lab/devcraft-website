import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

export async function GET() {
  try {
    const services = readJSON('services.json');
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: 'שגיאה בטעינת שירותים' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    writeJSON('services.json', body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'שגיאה בשמירה' }, { status: 500 });
  }
}
