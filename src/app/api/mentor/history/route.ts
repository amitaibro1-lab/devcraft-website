import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionMeta {
  id: string;
  title: string;
  folder: string;
  createdAt: string;
  updatedAt: string;
  count: number;
}

const MAX_SESSIONS = 30;
const MAX_MESSAGES = 120;

function authOk(req: NextRequest) {
  const syncKey = process.env.MENTOR_SYNC_KEY;
  return !!syncKey && req.headers.get('x-sync-key') === syncKey;
}

function shortHash(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h).toString(36);
}

async function readSessions(token: string): Promise<SessionMeta[]> {
  return (await kv.get<SessionMeta[]>(`chat:sessions:${shortHash(token)}`)) ?? [];
}

async function writeSessions(token: string, sessions: SessionMeta[]): Promise<void> {
  await kv.set(`chat:sessions:${shortHash(token)}`, sessions.slice(0, MAX_SESSIONS));
}

async function readMessages(token: string, sessionId: string): Promise<Message[]> {
  return (await kv.get<Message[]>(`chat:msg:${shortHash(token)}:${sessionId}`)) ?? [];
}

async function writeMessages(token: string, sessionId: string, messages: Message[]): Promise<void> {
  await kv.set(`chat:msg:${shortHash(token)}:${sessionId}`, messages.slice(-MAX_MESSAGES));
}

export async function GET(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    if (searchParams.get('list') === '1') {
      const sessions = await readSessions(token);
      return NextResponse.json({ sessions });
    }
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    const messages = await readMessages(token, sessionId);
    return NextResponse.json({ messages });
  } catch (e) {
    console.error('[history GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let token: string, sessionId: string, messages: Message[], title: string | undefined, folder: string | undefined;
  try {
    const body = await req.json() as { token: string; sessionId: string; messages: Message[]; title?: string; folder?: string };
    token = body.token; sessionId = body.sessionId;
    messages = body.messages; title = body.title; folder = body.folder;
    if (!token || !sessionId || !Array.isArray(messages)) throw new Error('invalid body');
  } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  try {
    await writeMessages(token, sessionId, messages);

    const sessions = await readSessions(token);
    const now = new Date().toISOString();
    const idx = sessions.findIndex(s => s.id === sessionId);

    if (idx >= 0) {
      const updated = {
        ...sessions[idx],
        ...(title && { title }),
        ...(folder && { folder }),
        updatedAt: now,
        count: messages.length,
      };
      sessions.splice(idx, 1);
      sessions.unshift(updated);
    } else {
      const firstUser = messages.find(m => m.role === 'user')?.content ?? 'שיחה חדשה';
      const autoTitle = title ?? (firstUser.length > 45 ? firstUser.slice(0, 45) + '…' : firstUser);
      sessions.unshift({
        id: sessionId, title: autoTitle, folder: folder ?? 'כללי',
        createdAt: now, updatedAt: now, count: messages.length,
      });
    }

    await writeSessions(token, sessions);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[history POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      await kv.del(`chat:msg:${shortHash(token)}:${sessionId}`);
      const sessions = await readSessions(token);
      await writeSessions(token, sessions.filter(s => s.id !== sessionId));
    } else {
      const sessions = await readSessions(token);
      await Promise.all(sessions.map(s => kv.del(`chat:msg:${shortHash(token)}:${s.id}`)));
      await kv.del(`chat:sessions:${shortHash(token)}`);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[history DELETE]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let token: string, sessionId: string, title: string | undefined, folder: string | undefined;
  try {
    const body = await req.json() as { token: string; sessionId: string; title?: string; folder?: string };
    token = body.token; sessionId = body.sessionId;
    title = body.title; folder = body.folder;
    if (!token || !sessionId) throw new Error('invalid body');
  } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  try {
    const sessions = await readSessions(token);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      if (title) sessions[idx].title = title;
      if (folder) sessions[idx].folder = folder;
      sessions[idx].updatedAt = new Date().toISOString();
      await writeSessions(token, sessions);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[history PATCH]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
