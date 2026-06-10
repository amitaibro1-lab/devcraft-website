# LearnyAI — Security Hardening & Stability Notes

This document records the hardening work done across the two repos
(`mysite` = admin dashboard + API/KV backend, `ai-mentor` = learnyai.app web app)
and the documented migration paths for changes intentionally left as groundwork.

Guiding rule: **production stability > feature completeness.** Token remains the
single source of truth for identity; Google is a secondary login shortcut only.
All new KV-backed hardening (rate limit, message caps, audit, sessions) is
**fail-open** — a KV outage never blocks login or chat.

---

## 1. What shipped (active)

### Access control (prior pass)
- All dashboard data APIs now require the admin password (`x-admin-password`,
  constant-time compare in `mysite/src/lib/admin-auth.ts`). `GET /api/services`
  and `GET /api/config` stay public (the marketing site needs them).
- Removed the hardcoded `amitai2612` fallback from dashboard auth (fail-closed).
- Cookies set with `secure` in production; OAuth requires `email_verified`.
- Grow webhook verification fails closed in production when no key is configured.

### Rate limiting (`rateLimit`, fixed-window, KV, fail-open)
- `ai-mentor`: `/api/chat` (30/min per token), `/api/access` (10/min per IP),
  `/api/auth/google` + `/api/auth/callback` (10–15/min per IP).
- `mysite`: `/api/mentor/grant` (60/min per IP — brute-force ceiling on the admin
  password), `/api/mentor/grow-webhook` (30/min per IP).
- Lib: `*/src/lib/ratelimit.ts`. ai-mentor counters go through `src/lib/kv-safe.ts`.

### Per-plan message caps (server-authoritative)
- `ai-mentor/src/app/api/chat/route.ts`: Starter 20 / Pro 100 / Business ∞ per
  day, keyed `chat:count:{date}:{tokenNamespace(token)}` (26h TTL). Counted only
  on a successful, non-empty response. Over the cap → HTTP 429 with a clear
  Hebrew message (the client already renders `errData.error`). Fail-open if KV down.

### Streaming reliability (`ai-mentor` chat)
- Switched from `messages.create` + manual chunking to real `messages.stream`,
  producing the **same** `data: {"text": ...}` / `data: [DONE]` SSE contract the
  frontend already consumes — so the frontend is unchanged.
- Added SSE-comment heartbeats (`: hb` every 15s — the frontend skips any line
  that doesn't start with `data: `), a 60s `AbortController` timeout, and
  `cancel()` to stop the upstream call when the client disconnects (cost saving).
- Errors now surface as a visible text chunk so the user never sees a blank bubble.

### Observability (`*/src/lib/log.ts`)
- `logEvent(reqId, event, meta)` emits one redacted JSON line. Tracks OAuth
  failures, chat ok/error/timeout/ratelimit, webhook events. **Never logs** tokens,
  secrets, API keys, or message content — only `tokenLast4` / `maskEmail`.

### Admin audit trail (`mysite/src/lib/audit.ts`)
- Append-only `mentor:audit` KV list (last 500), written on subscriber
  create / pause / resume / extend / delete / Google-unlink / paid-via-webhook.
  Masked email + token last-4 only. `readAudit()` is ready for a future dashboard tab.

### Bug fix (frontend, found during review)
- `ai-mentor/src/app/page.tsx`: `sidToSave` was referenced inside a
  `sessions.find(...)` callback **before** its `const` declaration. TypeScript
  doesn't flag use-before-declaration inside a nested closure, but the callback
  runs synchronously → a TDZ `ReferenceError` was thrown whenever the session list
  was non-empty, silently breaking history saving after the first conversation.
  Fixed by moving the declaration above first use.

---

## 2. Groundwork only — NOT yet enforced

### Session layer (`ai-mentor/src/lib/session.ts`)
- `mentor_session` cookie is now issued **alongside** `mentor_token` on token login
  and Google login (additive — existing users with only `mentor_token` are
  unaffected, and a failed session never blocks login).
- KV schema: `session:{id} → { token, createdAt, lastSeen, device, expiresAt }`,
  index `sessions:by-token:{tokenNamespace(token)} → string[]`.
- Helpers: `createSession`, `getSession`, `revokeSession`, `revokeAllForToken`.

**Path to enforcement (future):**
1. On each authenticated request, if a `mentor_session` cookie is present, look it
   up and confirm `token` matches — but always fall back to `mentor_token` so
   pre-existing sessions keep working.
2. Add a logout-all-devices action calling `revokeAllForToken`.
3. Only after all active clients have a session cookie, optionally require it.
   Never require it in a way that logs out current `mentor_token`-only users.

### Token hashing (`ai-mentor/src/lib/hash.ts`)
- `hashToken()` (SHA-256) exists but live KV keys still use the raw token /
  legacy `shortHash`. Changing key derivation now would orphan existing
  subscribers, history, and Google links.

**Backwards-compatible migration path (future):**
1. **Write-dual:** write both the legacy key and the `hashToken`-based key.
2. **Read-dual:** read the hashed key, fall back to the legacy key.
3. **Backfill:** one-off script copies legacy → hashed for all keys
   (`mentor:subscribers`, `mentor:google:*`, `mentor:token-google:*`,
   `chat:sessions:*`, `chat:msg:*`).
4. **Cut over:** once backfilled, drop the legacy reads/writes.
- Replace the weak 32-bit `shortHash` in `mysite/src/app/api/mentor/history/route.ts`
  with SHA-256 **only** as part of this re-key migration (not a point change — it
  would orphan current history).

---

## 3. Findings documented (no change this round)

### Data consistency (KV)
- `mentor:subscribers` is a read-modify-write blob (`saveSubscribers`); concurrent
  admin writes have a small lost-update window. Low risk at beta volume. Critical
  paths re-read before write. Full atomicity (Redis WATCH/MULTI or per-subscriber
  keys) is a future improvement.
- Google link writes two keys via `Promise.all`; a partial failure could leave a
  one-sided link. The 409-conflict check + idempotent re-link limit the impact.

### Scalability
- `getSubscribers()` runs on **every** chat request and (in ai-mentor) does a
  network `sync` fetch to mysite + KV read + merge — O(n) per request. Recommended
  future optimization: a short (~30s) in-memory cache of the subscriber list
  (trade-off: pause/expiry takes effect up to 30s later). Not enabled this round to
  avoid any behavior change.
- Anthropic: caps + per-token rate limit bound spend; consider per-account spend
  alerts as volume grows.

### History performance
- Initial load = list + fetch most-recent session (2 KV reads via the mysite
  proxy). Acceptable for beta. Lazy/cached loading can be added later without a
  contract change.

---

## 4. Deploy / env checklist (action required)

- `DASHBOARD_PASSWORD` — set a **strong** value in **both** Vercel projects.
  Without it, dashboard auth returns 500 (fail-closed, intentional).
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — set so rate limit / caps / audit /
  sessions are actually enforced (they fail-open silently otherwise).
- `GROW_WEBHOOK_KEY` — set when Grow is connected (webhook fails closed without it
  in production).
- `MENTOR_SYNC_KEY` — same value in both projects (already required).
- Deploy: commit to a branch, review, then deploy to production.
