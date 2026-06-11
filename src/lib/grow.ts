// Grow (גראו) payment integration — https://grow-il.readme.io
// API format: multipart/form-data POST

export interface GrowPaymentParams {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export async function createGrowPaymentLink(params: GrowPaymentParams): Promise<string> {
  const body = new URLSearchParams({
    userId: process.env.GROW_USER_ID ?? '',
    apiKey: process.env.GROW_API_KEY ?? '',
    pageCode: process.env.GROW_PAGE_CODE ?? '',
    sum: params.amount.toString(),
    description: params.description,
    fullName: params.customerName,
    email: params.customerEmail,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    notifyUrl: params.webhookUrl,
  });

  const res = await fetch('https://meshulam.co.il/api/?b=createTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Grow API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.err !== 0) {
    throw new Error(`Grow error: ${data.description ?? JSON.stringify(data)}`);
  }

  return data.data?.url as string;
}

// Verify webhook authenticity by comparing the webhookKey field to our secret.
// Fails closed in production: if no key is configured, reject (so the endpoint
// can't be abused to mint free subscriptions). Allowed only in local dev.
export function verifyGrowWebhook(webhookKey: string): boolean {
  const expected = (process.env.GROW_WEBHOOK_KEY ?? '').trim();
  if (!expected) return process.env.NODE_ENV !== 'production';
  return webhookKey === expected;
}

// Determine plan name from payment amount.
// LEGACY fallback only — wrong for annual sums (441 ⇒ "Business"). Prefer
// resolvePlanFromAmount() which also returns the correct duration.
export function planFromAmount(amount: number): string {
  if (amount >= 199) return 'Business';
  if (amount >= 99) return 'Pro';
  return 'Starter';
}

export interface ResolvedPlan {
  plan: string;
  days: number;
  period: 'monthly' | 'annual';
}

// Exact price → (plan, duration) mapping. Monthly gets a 5-day grace buffer,
// annual gets 370 days. Must stay in sync with the mentor pricing
// (49/99/199 monthly; 441/844/1592 annual).
const PRICE_TABLE: (ResolvedPlan & { amount: number })[] = [
  { amount: 49, plan: 'Starter', days: 35, period: 'monthly' },
  { amount: 99, plan: 'Pro', days: 35, period: 'monthly' },
  { amount: 199, plan: 'Business', days: 35, period: 'monthly' },
  { amount: 441, plan: 'Starter', days: 370, period: 'annual' },
  { amount: 844, plan: 'Pro', days: 370, period: 'annual' },
  { amount: 1592, plan: 'Business', days: 370, period: 'annual' },
];

// ±1 ₪ tolerance for rounding. Returns null for unknown amounts (e.g. coupon
// discounts) — callers fall back to planFromAmount with a warning log.
export function resolvePlanFromAmount(amount: number): ResolvedPlan | null {
  const row = PRICE_TABLE.find((r) => Math.abs(amount - r.amount) <= 1);
  return row ? { plan: row.plan, days: row.days, period: row.period } : null;
}
