import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { cookies } from 'next/headers';
import { readJSON } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Subscriber {
  token: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

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
  const cookieStore = await cookies();
  const token = cookieStore.get('mentor_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribers = readJSON<Subscriber[]>('mentor-subscribers.json');
  const sub = subscribers.find((s) => s.token === token && s.active);

  if (!sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (new Date(sub.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Subscription expired' }, { status: 403 });
  }

  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
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
