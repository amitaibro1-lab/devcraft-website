import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSubscribers } from '@/lib/mentor-db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: 'קוד גישה חסר' }, { status: 400 });
  }

  const subscribers = await getSubscribers();
  const sub = subscribers.find((s) => s.token === code.trim() && s.active);

  if (!sub) {
    return NextResponse.json({ error: 'קוד גישה לא תקין' }, { status: 401 });
  }

  if (new Date(sub.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'המנוי פג תוקף' }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set('mentor_token', sub.token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  });

  return NextResponse.json({ ok: true, name: sub.name, plan: sub.plan });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mentor_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const subscribers = await getSubscribers();
  const sub = subscribers.find((s) => s.token === token && s.active);

  if (!sub || new Date(sub.expiresAt) < new Date()) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, name: sub.name, plan: sub.plan });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('mentor_token');
  return NextResponse.json({ ok: true });
}
