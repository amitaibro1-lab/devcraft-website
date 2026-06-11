import { NextRequest, NextResponse } from 'next/server';
import { findCouponByToken } from '@/lib/coupons-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
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
