import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.DASHBOARD_PASSWORD ?? 'admin123';

  if (password === correct) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
