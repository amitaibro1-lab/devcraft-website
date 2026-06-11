import { NextRequest, NextResponse } from 'next/server';
import { findCoupon, addPending } from '@/lib/coupons-db';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Called by ai-mentor's create-payment when a buyer checks out with a coupon.
// Records the intended redemption (matched back by email at the webhook).
export async function POST(req: NextRequest) {
  const syncKey = (process.env.MENTOR_SYNC_KEY ?? '').trim();
  if (!syncKey || req.headers.get('x-sync-key')?.trim() !== syncKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(`coupon-pending:${clientIp(req)}`, 30, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let email: string, coupon: string;
  try {
    const body = await req.json() as { email?: unknown; coupon?: unknown };
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    coupon = typeof body.coupon === 'string' ? body.coupon.trim().toUpperCase() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!email || !coupon) {
    return NextResponse.json({ error: 'Missing email or coupon' }, { status: 400 });
  }

  const found = await findCoupon(coupon);
  if (!found || !found.active) {
    return NextResponse.json({ error: 'Invalid coupon' }, { status: 404 });
  }

  await addPending(email, coupon);
  return NextResponse.json({ ok: true, discountPercent: found.discountPercent });
}
