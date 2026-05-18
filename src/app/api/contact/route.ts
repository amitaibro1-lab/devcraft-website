import { NextRequest, NextResponse } from 'next/server';
import { appendJSON } from '@/lib/db';
import { sendContactEmail } from '@/lib/mailer';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, service, message } = body;

    if (!name || !email || !service || !message) {
      return NextResponse.json({ error: 'חסרים שדות' }, { status: 400 });
    }

    const inquiry = {
      id: randomUUID(),
      name,
      email,
      service,
      message,
      status: 'חדש',
      createdAt: new Date().toISOString(),
    };

    appendJSON('inquiries.json', inquiry);

    try {
      await sendContactEmail({ name, email, service, message });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
