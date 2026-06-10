import { kv } from '@vercel/kv';

// Fixed-window rate limiter backed by Vercel KV. Fail-open: any KV error (incl.
// KV not configured) allows the request — hardening must never break the app.
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number }> {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const rk = `rl:${key}:${bucket}`;
  try {
    const n = await kv.incr(rk);
    if (n === 1) await kv.expire(rk, windowSec + 1);
    return { ok: n <= limit, remaining: Math.max(0, limit - n) };
  } catch {
    return { ok: true, remaining: limit }; // fail-open
  }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const first = xff.split(',')[0]?.trim();
  return first || req.headers.get('x-real-ip')?.trim() || 'unknown';
}
