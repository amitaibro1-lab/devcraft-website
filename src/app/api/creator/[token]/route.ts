import { NextRequest, NextResponse } from 'next/server';
import { findCouponByToken } from '@/lib/coupons-db';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  // Public page keyed by a secret token — brake brute-force attempts.
  const rl = await rateLimit(`creator:${clientIp(req)}`, 20, 3600);
  if (!rl.ok) {
    return NextResponse.json({ error: 'יותר מדי בקשות' }, { status: 429 });
  }

  const { token } = await params;
  const coupon = await findCouponByToken(token);
  if (!coupon) {
    return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });
  }

  const commissionEarned = Math.round(coupon.revenue * coupon.commissionPercent / 100);

  return NextResponse.json({
    creatorName: coupon.creatorName,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    commissionPercent: coupon.commissionPercent,
    redemptions: coupon.redemptions,
    revenue: Math.round(coupon.revenue),
    commissionEarned,
    createdAt: coupon.createdAt,
  });
}
