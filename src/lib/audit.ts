import { kv } from '@vercel/kv';

// Append-only admin audit trail, capped at the last 500 entries. Best-effort:
// a KV failure must never block the underlying admin action.
export interface AuditEntry {
  ts: string;
  action: string;
  emailMasked?: string;
  tokenLast4?: string;
  details?: string;
}

const AUDIT_KEY = 'mentor:audit';
const AUDIT_MAX = 500;

export async function appendAudit(entry: Omit<AuditEntry, 'ts'>): Promise<void> {
  try {
    await kv.lpush(AUDIT_KEY, { ts: new Date().toISOString(), ...entry } satisfies AuditEntry);
    await kv.ltrim(AUDIT_KEY, 0, AUDIT_MAX - 1);
  } catch {
    /* best-effort — never block the admin action */
  }
}

export async function readAudit(limit = 100): Promise<AuditEntry[]> {
  try {
    return (await kv.lrange<AuditEntry>(AUDIT_KEY, 0, limit - 1)) ?? [];
  } catch {
    return [];
  }
}
