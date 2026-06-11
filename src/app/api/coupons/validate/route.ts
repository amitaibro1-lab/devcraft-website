import { NextRequest, NextResponse } from 'next/server';
import { findCoupon } from '@/lib/coupons-db';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public endpoint — the pricing page calls this before the customer is logged
// in. Returns only what the buyer needs; never exposes commissionPercent.
export async function GET(req: NextRequest) {
  // Bound code-guessing: enough for any legitimate checkout flow.
  const rl = await rateLimit(`coupon-validate:${clientIp(req)}`, 10, 60);
  if (!rl.ok) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  const code = req.nextUrl.searchParams.get('code') ?? '';
  if (!code.trim()) {
    return NextResponse.json({ valid: false });
  }

  const coupon = await findCoupon(code);
  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    creatorName: coupon.creatorName,
  });
}
