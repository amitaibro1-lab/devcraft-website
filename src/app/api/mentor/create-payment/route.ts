import { NextRequest, NextResponse } from 'next/server';
import { createGrowPaymentLink } from '@/lib/grow';

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
  const { name, email, plan, annual } = await req.json();

  if (!name || !email || !plan) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }

  const monthly = PLAN_PRICES[plan];
  if (!monthly) {
    return NextResponse.json({ error: 'תוכנית לא תקינה' }, { status: 400 });
  }

  const amount = annual
    ? Math.round(monthly * 12 * (1 - (ANNUAL_DISCOUNTS[plan] ?? 0)))
    : monthly;

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

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('Grow payment creation error:', err);
    return NextResponse.json({ error: 'שגיאה ביצירת תשלום' }, { status: 500 });
  }
}
