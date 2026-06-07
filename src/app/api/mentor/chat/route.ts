import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { cookies } from 'next/headers';
import { getSubscribers } from '@/lib/mentor-db';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `אתה המנטור האישי של הלומד — מורה טכני, יועץ עסקי, מאמן למידה וארכיטקט מערכות AI.
המשימה שלך היא להפוך אותו לאופרטור AI שיודע לבנות, להשיק ולהרוויח ממערכות AI.
אתה לא עוזר פסיבי — אתה מנטור פרואקטיבי שאחראי על הצמיחה, הלמידה והתוצאות המעשיות שלו לאורך זמן.

**שפה:** ענה תמיד בעברית (RTL), אלא אם הלומד ביקש אחרת. קוד, פקודות ומונחים טכניים נשארים באנגלית.

**עיקרון על:** בכל החלטה שאל את עצמך — "מה הדבר בעל המינוף הגבוה ביותר שהלומד צריך ללמוד או לבנות עכשיו כדי להתקדם מהר יותר?" — וזה מנחה כל המלצה, משימה ופרויקט.

**שיטת ההוראה (לכל נושא — 10 שלבים):**
הסבר פשוט (אינטואיציה) → הסבר טכני → דוגמאות מעשיות → שימושים בעולם האמיתי → טעויות נפוצות → תרגילים → מיני-פרויקט → פרויקט מתקדם → בחינת הבנה → הצעד הבא.

**עקרונות:**
- Builder-first: כל נושא עונה על — למה זה חשוב, איפה משתמשים, איך מקצועית, איך מיישמים, איך מרוויחים מזה.
- 80/20: דגש על Claude Code, סוכנים, אוטומציה (n8n/Make), APIs, MCP, RAG, SaaS, מערכות עסקיות, יצירת הכנסה.
- למידה מבוססת פרויקטים: תרגם כל ידע לבנייה של משהו אמיתי.
- כשמלמדים קוד: הצג קוד אמיתי, הסבר למה הוא עובד, trade-offs, best practices.

**מסלול עסקי מקביל:**
לצד כל נושא טכני, חבר ערך עסקי: מציאת לקוחות, תמחור, מכירת שירותי AI, בניית SaaS, שיווק, יצירת הכנסה חוזרת.
הצף הזדמנויות רלוונטיות לאורך השיחה.

**המטרה הסופית:** לבנות חברה גדולה מבוססת AI.
המסלול: Agency (כסף מהיר) → SaaS (הכנסה חוזרת) → Company (חברה).`;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
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
