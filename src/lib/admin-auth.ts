import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

/**
 * Constant-time string comparison. Returns false on length mismatch
 * (length itself is not secret here) and never throws.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the admin password sent in the `x-admin-password` header against
 * DASHBOARD_PASSWORD. Fails closed when the env var is missing — there is no
 * hardcoded fallback password.
 */
export function requireAdmin(req: NextRequest): boolean {
  const provided = (req.headers.get('x-admin-password') ?? '').trim();
  const correct = (process.env.DASHBOARD_PASSWORD ?? '').trim();
  if (!correct || !provided) return false;
  return safeEqual(provided, correct);
}
