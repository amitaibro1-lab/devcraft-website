import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSubscribers, saveSubscribers } from '@/lib/mentor-db';
import { verifyGrowWebhook, planFromAmount, resolvePlanFromAmount } from '@/lib/grow';
import { consumePending, recordRedemption } from '@/lib/coupons-db';
import { sendMentorAccessEmail } from '@/lib/mailer';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { newReqId, logEvent, maskEmail, tokenLast4 } from '@/lib/log';
import { appendAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const reqId = newReqId();
  const rl = await rateLimit(`webhook:${clientIp(req)}`, 30, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

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
    logEvent(reqId, 'webhook_invalid_key');
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

  // Exact amount → (plan, duration); annual sums get a full year. Unknown
  // amounts fall back to the legacy heuristic + 30 days, logged loudly.
  const resolved = resolvePlanFromAmount(amount);
  const plan = resolved?.plan ?? planFromAmount(amount);
  const days = resolved?.days ?? 30;
  if (!resolved) logEvent(reqId, 'webhook_unknown_amount', { amount, fallbackPlan: plan });

  // Renewal / upgrade: an existing subscriber (same email) keeps their token —
  // history and progress survive; expiry extends from max(now, current expiry).
  const emailNorm = customerEmail.toLowerCase().trim();
  const existing = subscribers.find((s) => s.email.toLowerCase().trim() === emailNorm);
  if (existing) {
    const baseTime = Math.max(Date.now(), new Date(existing.expiresAt).getTime() || 0);
    existing.expiresAt = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();
    existing.plan = plan;
    existing.active = true;
    existing.transactionId = transactionId;
    await saveSubscribers(subscribers);

    try {
      const couponCode = await consumePending(customerEmail);
      if (couponCode) {
        await recordRedemption(couponCode, amount);
        logEvent(reqId, 'coupon_redeemed', { plan, amount });
      }
    } catch (err) {
      console.error('coupon redemption tracking failed:', err);
    }

    await appendAudit({
      action: 'subscriber_renewed',
      emailMasked: maskEmail(customerEmail),
      tokenLast4: tokenLast4(existing.token),
      details: `plan=${plan} amount=${amount} days=${days}`,
    });
    logEvent(reqId, 'webhook_subscription_extended', { plan, amount, days });
    return NextResponse.json({ ok: true });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

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

  // Attribute the sale to a coupon if this buyer checked out with one (matched
  // by email via the pending record). Best-effort — never fail the webhook over
  // coupon bookkeeping, the subscriber is already created above.
  try {
    const couponCode = await consumePending(customerEmail);
    if (couponCode) {
      await recordRedemption(couponCode, amount);
      logEvent(reqId, 'coupon_redeemed', { plan, amount });
    }
  } catch (err) {
    console.error('coupon redemption tracking failed:', err);
  }

  await appendAudit({
    action: 'subscriber_paid',
    emailMasked: maskEmail(customerEmail),
    tokenLast4: tokenLast4(token),
    details: `plan=${plan} amount=${amount}`,
  });
  logEvent(reqId, 'webhook_subscriber_created', { plan, amount });

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://amitaicraft.com';

  try {
    await sendMentorAccessEmail({ customerName, customerEmail, plan, token, siteUrl });
  } catch (err) {
    console.error('Failed to send mentor access email:', err);
  }

  return NextResponse.json({ ok: true });
}
