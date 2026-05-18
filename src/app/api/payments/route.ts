import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';

export async function GET() {
  try {
    const payments = readJSON('payments.json');
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 });
  }
}
