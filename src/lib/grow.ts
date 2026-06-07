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

// Verify webhook authenticity by comparing the webhookKey field to our secret
export function verifyGrowWebhook(webhookKey: string): boolean {
  const expected = process.env.GROW_WEBHOOK_KEY ?? '';
  if (!expected) return true; // not configured yet — allow in dev
  return webhookKey === expected;
}

// Determine plan name from payment amount
export function planFromAmount(amount: number): string {
  if (amount >= 199) return 'Business';
  if (amount >= 99) return 'Pro';
  return 'Starter';
}
