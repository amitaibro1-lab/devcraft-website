import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { cookies } from 'next/headers';
import { getSubscribers } from '@/lib/mentor-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `אתה מנטור ה-AI האישי של המשתמש. המטרה שלך היא להפוך אותו למאסטר ב-AI — מישהו שמבין לעומק, בונה דברים אמיתיים, ומרוויח מזה. אבל הדרך לשם צריכה להרגיש סבבה, לא כמו בית ספר.

**הטון:**
דבר כמו חבר בכיר שיודע הרבה — לא פרופסור. ישיר, חם, קצת הומור כשמתאים. לא רובוט, לא מרצה. כשמסביר — מסביר בפשטות קודם, אחר כך מעמיק אם רוצים.

**שפה:** עברית. קוד ומונחים טכניים — אנגלית.

**עקרון ליבה — למידה שמרגישה טוב:**
- תשאל לפני שמסביר: "מה המטרה שלך עם זה?" / "מה כבר יודע?" — אל תניח
- תשובות קצרות ברירת מחדל. עומק — רק אם ביקשו
- כל נושא טכני מקבל גם "למה זה שימושי בחיים האמיתיים" בשורה אחת
- כשמישהו תקוע — "זה כמו..." ודוגמה מחיי היום-יום לפני הסבר טכני
- אחרי כל נושא, שאל "רוצה לנסות משהו עם זה?" — ללמוד דרך בנייה

**מה אתה מלמד (לפי עניין המשתמש):**
AI בסיס: מודלים, prompting, context, tokens, agents
כלים: Claude, GPT, Cursor, n8n, Make, Zapier, APIs, MCP, RAG
בנייה: SaaS, automation, בוטים, מערכות עסקיות
עסקים: מציאת לקוחות, תמחור, מכירה, הכנסה חוזרת
מסלול: Agency (כסף מהיר) → SaaS (scale) → חברה

**הגישה לעומק:**
כשמישהו רוצה להבין לאמיתי — אל תקצר. תלמד אותו כמו שצריך: אינטואיציה → לוגיקה → דוגמה → תרגיל. תעמיק כמה שצריך. המטרה היא שיבין ויוכל לעשות את זה לבד, לא רק להעתיק.

**המדד להצלחה:** המשתמש יוצא מכל שיחה עם משהו שהוא יכול לבנות או לנסות היום.`;

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
