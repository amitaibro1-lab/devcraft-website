import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { readJSON, writeJSON } from '@/lib/db';

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

function requireAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password') ?? '';
  const correct = (process.env.DASHBOARD_PASSWORD ?? 'amitai2612').trim();
  return password.trim() === correct;
}

// POST — grant new access
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, plan, days } = await req.json();

  if (!name || !email || !plan) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + (days ?? 30) * 24 * 60 * 60 * 1000
  ).toISOString();

  const subscriber: Subscriber = {
    token,
    name,
    email,
    plan,
    createdAt: new Date().toISOString(),
    expiresAt,
    active: true,
  };

  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  subscribers.push(subscriber);
  writeJSON('mentor-subscribers.json', subscribers);

  return NextResponse.json({ ok: true, token });
}

// GET — list all subscribers
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  return NextResponse.json(subscribers);
}

// PATCH — toggle active / extend
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, active, extendDays } = await req.json();
  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  const idx = subscribers.findIndex((s) => s.token === token);

  if (idx === -1) {
    return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });
  }

  if (active !== undefined) subscribers[idx].active = active;

  if (extendDays) {
    const base = new Date(
      Math.max(Date.now(), new Date(subscribers[idx].expiresAt).getTime())
    );
    subscribers[idx].expiresAt = new Date(
      base.getTime() + extendDays * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  writeJSON('mentor-subscribers.json', subscribers);
  return NextResponse.json({ ok: true });
}

// DELETE — remove subscriber
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  const filtered = subscribers.filter((s) => s.token !== token);
  writeJSON('mentor-subscribers.json', filtered);
  return NextResponse.json({ ok: true });
}
