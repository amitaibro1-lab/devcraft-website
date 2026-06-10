import { NextRequest, NextResponse } from 'next/server';
import { createGrowPaymentLink } from '@/lib/grow';
import { findCoupon, addPending } from '@/lib/coupons-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAN_PRICES: Record<string, number> = {
  Starter: 49,
  Pro: 99,
  Business: 199,
};

const ANNUAL_DISCOUNTS: Record<string, number> = {
  Starter: 0.10,
  Pro: 0.15,
  Business: 0.20,
};

export async function POST(req: NextRequest) {
  const { name, email, plan, annual, couponCode } = await req.json();

  if (!name || !email || !plan) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }

  const monthly = PLAN_PRICES[plan];
  if (!monthly) {
    return NextResponse.json({ error: 'תוכנית לא תקינה' }, { status: 400 });
  }

  let amount = annual
    ? Math.round(monthly * 12 * (1 - (ANNUAL_DISCOUNTS[plan] ?? 0)))
    : monthly;

  // Apply a coupon discount if one was supplied. Always re-validate server-side
  // — never trust a price or discount sent by the client.
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await findCoupon(String(couponCode));
    if (coupon && coupon.active && coupon.discountPercent > 0) {
      amount = Math.round(amount * (1 - coupon.discountPercent / 100));
      appliedCoupon = coupon.code;
    }
  }

  // Grow not yet configured — return WhatsApp fallback
  if (!process.env.GROW_USER_ID || !process.env.GROW_API_KEY) {
    return NextResponse.json({ fallback: true });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://amitaicraft.com';

  try {
    const paymentUrl = await createGrowPaymentLink({
      amount,
      description: `AI Master Mentor — תוכנית ${plan}`,
      customerName: name,
      customerEmail: email,
      successUrl: `${base}/mentor/success`,
      cancelUrl: `${base}/mentor/pricing`,
      webhookUrl: `${base}/api/mentor/grow-webhook`,
    });

    // Record the intended redemption so the webhook can attribute the sale to
    // this coupon once payment is confirmed (matched by email). Best-effort —
    // never block checkout on coupon bookkeeping.
    if (appliedCoupon) {
      try {
        await addPending(email, appliedCoupon);
      } catch (err) {
        console.error('coupon addPending failed:', err);
      }
    }

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('Grow payment creation error:', err);
    return NextResponse.json({ error: 'שגיאה ביצירת תשלום' }, { status: 500 });
  }
}
