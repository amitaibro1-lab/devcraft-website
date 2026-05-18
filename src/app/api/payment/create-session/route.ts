import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/payplus';
import { readJSON } from '@/lib/db';

interface Service {
  id: string;
  pricingType: 'packages' | 'custom';
  minPrice: number;
  packages: { name: string; price: number }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, customerName, customerEmail, serviceType, packageName } = body;

    if (!amount || !description || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
    }

    // Validate minimum amount against service config
    const services = readJSON<Service[]>('services.json');
    const matchedService = services.find((s) =>
      s.packages?.some((p) => p.name === packageName) || serviceType?.includes(s.id)
    );

    if (matchedService) {
      const minPrice = matchedService.minPrice ?? 0;
      if (amount < minPrice) {
        return NextResponse.json(
          { error: `הסכום המינימלי לשירות זה הוא ₪${minPrice}` },
          { status: 400 }
        );
      }
    }

    const paymentUrl = await createPaymentSession({ amount, description, customerName, customerEmail });
    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('Payment session error:', err);
    return NextResponse.json({ error: 'שגיאה ביצירת תשלום' }, { status: 500 });
  }
}
