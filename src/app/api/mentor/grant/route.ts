import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSubscribers, saveSubscribers, addSubscriber } from '@/lib/mentor-db';
import { sendMentorAccessEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function requireAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password') ?? '';
  const correct = (process.env.DASHBOARD_PASSWORD ?? 'amitai2612').trim();
  return password.trim() === correct;
}

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

  await addSubscriber({
    token, name, email, plan,
    createdAt: new Date().toISOString(),
    expiresAt,
    active: true,
  });

  // Send access email (fire-and-forget — don't fail the response if email fails)
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://amitaicraft.vercel.app';
  sendMentorAccessEmail({ customerName: name, customerEmail: email, plan, token, siteUrl })
    .catch((err) => console.error('[grant] email failed:', err));

  return NextResponse.json({ ok: true, token });
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getSubscribers());
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, active, extendDays } = await req.json();
  const subscribers = await getSubscribers();
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

  await saveSubscribers(subscribers);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  const subscribers = await getSubscribers();
  await saveSubscribers(subscribers.filter((s) => s.token !== token));
  return NextResponse.json({ ok: true });
}
