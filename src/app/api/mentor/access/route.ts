import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readJSON } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Subscriber {
  token: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

// POST /api/mentor/access — verify access code and set cookie
export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: 'קוד גישה חסר' }, { status: 400 });
  }

  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
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

// GET /api/mentor/access — check current session
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mentor_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  const sub = subscribers.find((s) => s.token === token && s.active);

  if (!sub || new Date(sub.expiresAt) < new Date()) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, name: sub.name, plan: sub.plan });
}

// DELETE /api/mentor/access — logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('mentor_token');
  return NextResponse.json({ ok: true });
}
