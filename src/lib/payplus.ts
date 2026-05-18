import crypto from 'crypto';

export interface PaymentParams {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
}

export async function createPaymentSession({
  amount,
  description,
  customerName,
  customerEmail,
}: PaymentParams): Promise<string> {
  const res = await fetch(
    'https://restapi.payplus.co.il/api/v1.0/PaymentPages/generateLink',
    {
      method: 'POST',
      headers: {
        Authorization: JSON.stringify({
          api_key: process.env.PAYPLUS_API_KEY,
          secret_key: process.env.PAYPLUS_SECRET_KEY,
        }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_page_uid: process.env.PAYPLUS_PAGE_UID,
        charge_default: { amount, description },
        customer: { customer_name: customerName, email: customerEmail },
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`PayPlus error: ${res.status}`);
  }

  const data = await res.json();
  return data.data.payment_page_link as string;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.PAYPLUS_SECRET_KEY!)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}
