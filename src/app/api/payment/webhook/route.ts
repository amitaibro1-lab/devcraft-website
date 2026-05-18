import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payplus';
import { appendJSON } from '@/lib/db';
import { sendPaymentConfirmationEmails } from '@/lib/mailer';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-payplus-signature') ?? '';

  if (process.env.PAYPLUS_SECRET_KEY && signature) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const { status, transaction } = payload;

    if (status !== 'success' && status !== '000') {
      return NextResponse.json({ ok: true });
    }

    const paymentRecord = {
      id: randomUUID(),
      customerName: transaction?.customer_name ?? 'לא ידוע',
      customerEmail: transaction?.email ?? '',
      serviceType: transaction?.description ?? '',
      packageName: transaction?.package_name,
      amount: transaction?.amount ?? 0,
      status: 'paid',
      date: new Date().toISOString(),
      paymentRef: transaction?.transaction_uid ?? transaction?.uid,
    };

    appendJSON('payments.json', paymentRecord);

    if (paymentRecord.customerEmail) {
      try {
        await sendPaymentConfirmationEmails({
          customerName: paymentRecord.customerName,
          customerEmail: paymentRecord.customerEmail,
          serviceType: paymentRecord.serviceType,
          amount: paymentRecord.amount,
          packageName: paymentRecord.packageName,
          paymentRef: paymentRecord.paymentRef,
          date: new Date(paymentRecord.date).toLocaleDateString('he-IL'),
        });
      } catch (emailErr) {
        console.error('Payment email error:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
