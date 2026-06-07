import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSubscribers, saveSubscribers } from '@/lib/mentor-db';
import { verifyGrowWebhook, planFromAmount } from '@/lib/grow';
import { sendMentorAccessEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let payload: Record<string, string> = {};

  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    // Grow PaymentLinks format: { status: "1", data: { ... } }
    payload = body?.data ?? body;
  } else {
    // Legacy Meshulam form-data format
    const text = await req.text();
    for (const pair of text.split('&')) {
      const [k, v] = pair.split('=');
      if (k) payload[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    }
  }

  // Verify webhook authenticity
  const webhookKey = payload.webhookKey ?? payload.webhook_key ?? '';
  if (!verifyGrowWebhook(webhookKey)) {
    return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
  }

  // Only process successful payments
  const status = payload.status ?? payload.transactionStatus ?? '';
  const isSuccess = status === '1' || status === 'שולם' || status === 'success';
  if (!isSuccess) {
    return NextResponse.json({ ok: true }); // acknowledge but ignore
  }

  const customerName = payload.fullName ?? payload.clientName ?? 'לקוח';
  const customerEmail = payload.email ?? payload.payerEmail ?? payload.clientEmail ?? '';
  const amount = parseFloat(payload.sum ?? payload.paymentSum ?? '0');
  const transactionId = payload.transactionId ?? payload.transactionCode ?? randomUUID();

  if (!customerEmail) {
    console.error('Grow webhook: missing customer email', payload);
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // Prevent duplicate processing
  const subscribers = await getSubscribers();
  const duplicate = subscribers.find((s) => s.transactionId === transactionId);
  if (duplicate) {
    return NextResponse.json({ ok: true });
  }

  const plan = planFromAmount(amount);
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const subscriber = {
    token,
    name: customerName,
    email: customerEmail,
    plan,
    createdAt: new Date().toISOString(),
    expiresAt,
    active: true,
    transactionId,
  };

  subscribers.push(subscriber);
  await saveSubscribers(subscribers);

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://amitaicraft.com';

  try {
    await sendMentorAccessEmail({ customerName, customerEmail, plan, token, siteUrl });
  } catch (err) {
    console.error('Failed to send mentor access email:', err);
  }

  return NextResponse.json({ ok: true });
}
