import { randomUUID } from 'crypto';

// Production-safe structured logging.
//
// IMPORTANT — never pass raw tokens, secrets, API keys, or full user message
// content into meta. Use tokenLast4()/maskEmail() for identifiers.

export function newReqId(): string {
  return randomUUID().slice(0, 8);
}

export function logEvent(reqId: string, event: string, meta: Record<string, unknown> = {}): void {
  try {
    console.log(JSON.stringify({ t: new Date().toISOString(), reqId, event, ...meta }));
  } catch {
    console.log(`[${reqId}] ${event}`);
  }
}

export function tokenLast4(token: string | undefined | null): string {
  if (!token || token.length < 4) return '----';
  return token.slice(-4);
}

export function maskEmail(email: string | undefined | null): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}
