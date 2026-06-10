import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { kv } from '@vercel/kv';
import { getSubscribers, saveSubscribers, addSubscriber } from '@/lib/mentor-db';
import { sendMentorAccessEmail } from '@/lib/mailer';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { appendAudit } from '@/lib/audit';
import { maskEmail, tokenLast4 } from '@/lib/log';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function requireAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password') ?? '';
  const correct = process.env.DASHBOARD_PASSWORD?.trim() ?? '';
  if (!correct) return false;
  return password.trim() === correct;
}

// Generous per-IP limit — bounds brute-force against the admin password while
// leaving plenty of headroom for normal dashboard use. Fail-open if KV is down.
async function adminRateOk(req: NextRequest): Promise<boolean> {
  return (await rateLimit(`grant:${clientIp(req)}`, 60, 60)).ok;
}

export async function POST(req: NextRequest) {
  if (!(await adminRateOk(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
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

  await appendAudit({
    action: 'subscriber_create',
    emailMasked: maskEmail(email),
    tokenLast4: tokenLast4(token),
    details: `plan=${plan} days=${days ?? 30}`,
  });

  // Send access email (fire-and-forget — don't fail the response if email fails)
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://amitaicraft.vercel.app';
  sendMentorAccessEmail({ customerName: name, customerEmail: email, plan, token, siteUrl })
    .catch((err) => console.error('[grant] email failed:', err));

  return NextResponse.json({ ok: true, token });
}

export async function GET(req: NextRequest) {
  if (!(await adminRateOk(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subscribers = await getSubscribers();
  const googleData = await Promise.all(
    subscribers.map((s) => kv.get<{ googleId: string }>(`mentor:token-google:${s.token}`))
  );
  return NextResponse.json(
    subscribers.map((s, i) => ({ ...s, googleId: googleData[i]?.googleId ?? null }))
  );
}

export async function PATCH(req: NextRequest) {
  if (!(await adminRateOk(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, active, extendDays, unlinkGoogle } = await req.json();

  if (unlinkGoogle) {
    const reverseData = await kv.get<{ googleId: string }>(`mentor:token-google:${token}`);
    if (reverseData?.googleId) {
      await Promise.all([
        kv.del(`mentor:google:${reverseData.googleId}`),
        kv.del(`mentor:token-google:${token}`),
      ]);
    }
    await appendAudit({ action: 'google_unlink', tokenLast4: tokenLast4(token) });
    return NextResponse.json({ ok: true });
  }

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
  await appendAudit({
    action: active !== undefined ? (active ? 'subscriber_resume' : 'subscriber_pause') : 'subscriber_extend',
    emailMasked: maskEmail(subscribers[idx].email),
    tokenLast4: tokenLast4(token),
    details: extendDays ? `+${extendDays}d` : undefined,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await adminRateOk(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  const subscribers = await getSubscribers();

  // Clean up Google link on deletion
  const reverseData = await kv.get<{ googleId: string }>(`mentor:token-google:${token}`);
  if (reverseData?.googleId) {
    await Promise.all([
      kv.del(`mentor:google:${reverseData.googleId}`),
      kv.del(`mentor:token-google:${token}`),
    ]);
  }

  const deleted = subscribers.find((s) => s.token === token);
  await saveSubscribers(subscribers.filter((s) => s.token !== token));
  await appendAudit({
    action: 'subscriber_delete',
    emailMasked: maskEmail(deleted?.email),
    tokenLast4: tokenLast4(token),
  });
  return NextResponse.json({ ok: true });
}
