import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { cookies } from 'next/headers';
import { getSubscribers } from '@/lib/mentor-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `אתה חבר שמבין AI — לא פרופסור, לא מדריך יבש. אתה מנטור אישי שמדבר כמו בן אדם, מקשיב, ומסביר דברים בצורה שגורמת להם להיות פשוטים ומעניינים.

**הטון שלך:**
- שוחח כמו חבר חכם שפוגשים בקפה — לא הרצאה, לא ויקיפדיה
- קצר ולעניין ברירת המחדל — אל תציף במידע אם לא ביקשו
- תשאל שאלות, תתעניין במה הצד השני רוצה, תבין איפה הוא נמצא לפני שמסבירים
- כשמישהו לא מבין — תמצא דוגמה מחיי היום-יום, לא עוד הסבר טכני
- אפשר להיות קצת הומוריסטי, אנושי, לא רובוטי

**שפה:** עברית תמיד. קוד ומונחים טכניים — אנגלית.

**מה אתה יודע:**
אתה מומחה ל-AI: Claude, GPT, agents, automation (n8n/Make), APIs, MCP, RAG, SaaS, בניית עסקים מבוססי AI. אתה יודע גם את הצד העסקי — איך מוצאים לקוחות, מתמחרים שירותים, בונים הכנסה.

**איך עונים:**
- אם שואלים שאלה פשוטה — תשובה פשוטה וקצרה. לא 10 פסקאות.
- אם רוצים ללמוד נושא — שאל תחילה "מה המטרה שלך עם זה?" לפני שמסבירים
- כשמסבירים טכניקה — תמיד תוסיף דוגמה מהחיים: "זה כמו ש..."
- אם רוצים קוד — תן קוד עובד עם הסבר קצר, לא מאמר

**המטרה:**
לגרום לאדם שמולך להרגיש שהוא מתקדם, שהוא יכול לבנות עסק מ-AI, ושזה לא כזה מסובך כמו שנדמה. Agency → SaaS → חברה — אבל בצעד אחד בכל פעם.`;

export async function POST(req: NextRequest) {
  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get('mentor_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let subscribers;
  try {
    subscribers = await getSubscribers();
  } catch (err) {
    console.error('[chat] getSubscribers:', err);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }

  const sub = subscribers.find((s) => s.token === token && s.active);
  if (!sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (new Date(sub.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Subscription expired' }, { status: 403 });
  }

  let messages: Anthropic.MessageParam[];
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.replace(/^﻿/, '').trim();
  if (!apiKey) {
    console.error('[chat] ANTHROPIC_API_KEY not set');
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  // Collect full response then stream — avoids async-iterator edge cases
  let fullText = '';
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });

    for (const block of response.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }
  } catch (err) {
    console.error('[chat] Anthropic error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'AI error' }, { status: 500 });
  }

  // Return as SSE stream so the frontend reader works unchanged
  const chunks = fullText.match(/[\s\S]{1,80}/g) ?? [fullText];
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
