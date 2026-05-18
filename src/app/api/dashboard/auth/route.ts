import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = (process.env.DASHBOARD_PASSWORD ?? 'amitai2612').trim();

  if (password.trim() === correct) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
