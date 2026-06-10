import { readJSON, writeJSON } from './db';

const KV_KEY = 'mentor:coupons';
const PENDING_KEY = 'mentor:coupon-pending';

// Pending redemptions older than this are pruned on every write.
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export interface Coupon {
  code: string;              // uppercase, unique — the redeemable code (e.g. "DAVID20")
  creatorName: string;       // content creator this coupon belongs to
  discountPercent: number;   // 0–100, audience discount
  commissionPercent: number; // % paid to the creator (reporting + calculator)
  active: boolean;
  createdAt: string;
  redemptions: number;       // count of confirmed purchases
  revenue: number;           // sum of amounts actually paid through this coupon
}

// Written at create-payment, finalized at the webhook (matched by email).
export interface PendingRedemption {
  email: string;     // normalized lowercase — match key
  code: string;
  createdAt: string; // for pruning entries older than PENDING_TTL_MS
}

function isKvAvailable() {
  return !!process.env.KV_REST_API_URL;
}

async function getKv() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  if (isKvAvailable()) {
    const kv = await getKv();
    return (await kv.get<Coupon[]>(KV_KEY)) ?? [];
  }
  try {
    return readJSON<Coupon[]>('coupons.json');
  } catch {
    return [];
  }
}

export async function saveCoupons(coupons: Coupon[]): Promise<void> {
  if (isKvAvailable()) {
    const kv = await getKv();
    await kv.set(KV_KEY, coupons);
    return;
  }
  writeJSON('coupons.json', coupons);
}

export async function addCoupon(coupon: Coupon): Promise<void> {
  const list = await getCoupons();
  list.push(coupon);
  await saveCoupons(list);
}

// Case-insensitive lookup by code.
export async function findCoupon(code: string): Promise<Coupon | undefined> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  const list = await getCoupons();
  return list.find((c) => c.code === normalized);
}

// ─── Pending redemptions ──────────────────────────────────────────────────────

async function getPending(): Promise<PendingRedemption[]> {
  if (isKvAvailable()) {
    const kv = await getKv();
    return (await kv.get<PendingRedemption[]>(PENDING_KEY)) ?? [];
  }
  try {
    return readJSON<PendingRedemption[]>('coupon-pending.json');
  } catch {
    return [];
  }
}

async function savePending(list: PendingRedemption[]): Promise<void> {
  if (isKvAvailable()) {
    const kv = await getKv();
    await kv.set(PENDING_KEY, list);
    return;
  }
  writeJSON('coupon-pending.json', list);
}

function prune(list: PendingRedemption[]): PendingRedemption[] {
  const cutoff = Date.now() - PENDING_TTL_MS;
  return list.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
}

// Record an intended redemption keyed by email. Last code per email wins.
export async function addPending(email: string, code: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedEmail || !normalizedCode) return;
  const list = prune(await getPending()).filter((p) => p.email !== normalizedEmail);
  list.push({ email: normalizedEmail, code: normalizedCode, createdAt: new Date().toISOString() });
  await savePending(list);
}

// Find + remove the pending redemption for an email, returning its coupon code.
export async function consumePending(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  const list = prune(await getPending());
  const idx = list.findIndex((p) => p.email === normalizedEmail);
  if (idx === -1) {
    // Persist the pruned list even when nothing matched, to drop stale entries.
    await savePending(list);
    return null;
  }
  const [match] = list.splice(idx, 1);
  await savePending(list);
  return match.code;
}

// Increment a coupon's redemption count + revenue. Best-effort; never throws on
// a missing coupon (returns false so callers can log without failing the flow).
export async function recordRedemption(code: string, amount: number): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  const list = await getCoupons();
  const coupon = list.find((c) => c.code === normalized);
  if (!coupon) return false;
  coupon.redemptions += 1;
  coupon.revenue += Number.isFinite(amount) ? amount : 0;
  await saveCoupons(list);
  return true;
}
