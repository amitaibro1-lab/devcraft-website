import { NextRequest, NextResponse } from 'next/server';
import { consumePending, recordRedemption } from '@/lib/coupons-db';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { newReqId, logEvent, maskEmail } from '@/lib/log';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Called by ai-mentor's grow-webhook after a successful payment: consumes the
// pending redemption for this buyer and credits the coupon (count + revenue).
export async function POST(req: NextRequest) {
  const syncKey = (process.env.MENTOR_SYNC_KEY ?? '').trim();
  if (!syncKey || req.headers.get('x-sync-key')?.trim() !== syncKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(`coupon-redeem:${clientIp(req)}`, 30, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const reqId = newReqId();
  let email: string, amount: number;
  try {
    const body = await req.json() as { email?: unknown; amount?: unknown };
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    amount = typeof body.amount === 'number' && isFinite(body.amount) ? body.amount : 0;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const code = await consumePending(email);
  if (!code) {
    return NextResponse.json({ ok: true, coupon: null });
  }

  await recordRedemption(code, amount);
  logEvent(reqId, 'coupon_redeemed_remote', { email: maskEmail(email), amount });
  return NextResponse.json({ ok: true, coupon: code });
}
