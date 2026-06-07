import { NextRequest, NextResponse } from 'next/server';
import { createGrowPaymentLink } from '@/lib/grow';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLAN_PRICES: Record<string, number> = {
  Starter: 49,
  Pro: 99,
  Business: 199,
};

export async function POST(req: NextRequest) {
  const { name, email, plan } = await req.json();

  if (!name || !email || !plan) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }

  const amount = PLAN_PRICES[plan];
  if (!amount) {
    return NextResponse.json({ error: 'תוכנית לא תקינה' }, { status: 400 });
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

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('Grow payment creation error:', err);
    return NextResponse.json({ error: 'שגיאה ביצירת תשלום' }, { status: 500 });
  }
}
