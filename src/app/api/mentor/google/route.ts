import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function authOk(req: NextRequest): boolean {
  const key = process.env.MENTOR_SYNC_KEY?.trim() ?? '';
  return !!key && req.headers.get('x-sync-key') === key;
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, googleId, token } = await req.json();

  if (!action || !googleId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // ── link ──────────────────────────────────────────────────────
  if (action === 'link') {
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const kvKey = `mentor:google:${googleId}`;
    const reverseKey = `mentor:token-google:${token}`;

    const existing = await kv.get<{ token: string }>(kvKey);

    if (existing) {
      if (existing.token !== token) {
        return NextResponse.json({ error: 'google_already_linked' }, { status: 409 });
      }
      return NextResponse.json({ ok: true, alreadyLinked: true });
    }

    const now = new Date().toISOString();
    await Promise.all([
      kv.set(kvKey, { token, linkedAt: now }),
      kv.set(reverseKey, { googleId, linkedAt: now }),
    ]);

    return NextResponse.json({ ok: true });
  }

  // ── lookup (Google login) ─────────────────────────────────────
  if (action === 'lookup') {
    const data = await kv.get<{ token: string }>(`mentor:google:${googleId}`);
    return NextResponse.json({ token: data?.token ?? null });
  }

  // ── check-linked (UI: does this token have a Google ID?) ──────
  if (action === 'check-linked') {
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    const data = await kv.get<{ googleId: string }>(`mentor:token-google:${token}`);
    return NextResponse.json({ googleId: data?.googleId ?? null, linked: !!data });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
