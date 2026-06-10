import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCoupons, saveCoupons, addCoupon, type Coupon } from '@/lib/coupons-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function clampPercent(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await getCoupons());
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, creatorName, discountPercent, commissionPercent } = await req.json();

  const normalizedCode = String(code ?? '').trim().toUpperCase();
  if (!normalizedCode || !creatorName) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }
  if (!/^[A-Z0-9_-]{2,32}$/.test(normalizedCode)) {
    return NextResponse.json(
      { error: 'הקוד חייב להיות 2–32 תווים: אותיות אנגליות, ספרות, מקף או קו תחתון' },
      { status: 400 },
    );
  }

  const existing = await getCoupons();
  if (existing.some((c) => c.code === normalizedCode)) {
    return NextResponse.json({ error: 'קוד קופון כבר קיים' }, { status: 409 });
  }

  const coupon: Coupon = {
    code: normalizedCode,
    creatorName: String(creatorName).trim(),
    discountPercent: clampPercent(discountPercent),
    commissionPercent: clampPercent(commissionPercent),
    active: true,
    createdAt: new Date().toISOString(),
    redemptions: 0,
    revenue: 0,
  };

  await addCoupon(coupon);
  return NextResponse.json({ ok: true, coupon });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, active, discountPercent, commissionPercent, creatorName } = await req.json();
  const normalizedCode = String(code ?? '').trim().toUpperCase();

  const list = await getCoupons();
  const coupon = list.find((c) => c.code === normalizedCode);
  if (!coupon) {
    return NextResponse.json({ error: 'לא נמצא' }, { status: 404 });
  }

  if (active !== undefined) coupon.active = !!active;
  if (discountPercent !== undefined) coupon.discountPercent = clampPercent(discountPercent);
  if (commissionPercent !== undefined) coupon.commissionPercent = clampPercent(commissionPercent);
  if (creatorName !== undefined) coupon.creatorName = String(creatorName).trim();

  await saveCoupons(list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await req.json();
  const normalizedCode = String(code ?? '').trim().toUpperCase();

  const list = await getCoupons();
  await saveCoupons(list.filter((c) => c.code !== normalizedCode));
  return NextResponse.json({ ok: true });
}
