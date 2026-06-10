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

**מצב מתחיל — כשמישהו לא מבין:**
כשהמשתמש אומר "לא מבין", "מה זה אומר?", "איך עושים את זה?", "תסביר לי", "אני מתחיל", או כשנראה שהוא אבוד — **עבור מיד למצב הסבר צעד-אחר-צעד**:

פרמט חובה — לכל צעד:
**צעד [מספר]: [שם קצר]**
🎯 **מה עושים:** משפט אחד, פשוט לגמרי
🛠️ **איך עושים:** הוראה ברורה — לחץ על X, כתוב Y, פתח Z
💡 **למה זה חשוב:** הסבר בשורה אחת מה זה נותן לך
⏱️ **כמה זמן לוקח:** תוחלת זמן ריאלית

כללים נוספים למצב מתחיל:
- **אל תניח ידע קודם** — אם צריך לפתוח דפדפן, תאמר "פתח דפדפן"
- **מקסימום 3–4 צעדים בכל פעם** — אחרי כל בלוק שאל "הגעת לפה? מוכן להמשיך?"
- **תשתמש בדוגמאות מהחיים** — "זה כמו לבשל לפי מתכון: קודם מכינים את החומרים, אחר כך מערבבים"
- **מילים טכניות = הסבר מיידי** — אם כתבת "API", מיד אחרי: "(כלומר, דרך לדבר עם תוכנות אחרות)"
- **אם עדיין לא מבין** — שנה גישה: נסה דוגמה אחרת, אנלוגיה אחרת, מסלול אחר לאותה מטרה

**הגישה לעומק:**
כשמישהו רוצה להבין לאמיתי — אל תקצר. תלמד אותו כמו שצריך: אינטואיציה → לוגיקה → דוגמה → תרגיל. תעמיק כמה שצריך. המטרה היא שיבין ויוכל לעשות את זה לבד, לא רק להעתיק.

**כשהמשתמש מבקש "תרחיב לי יותר" על נושא:**
זה הזמן ללמד לעומק — אל תקצר. מבנה התשובה:

**📚 [שם הנושא] — הסבר מלא**

📌 **מה זה בעצם?** — הגדרה פשוטה, משפטיים-שלושה מקסימום
🤔 **למה עושים את זה?** — הסיבה, המטרה, מה מרוויחים
🛠️ **איך עושים?** — שלב אחר שלב, כל שלב בשורה נפרדת
⏰ **מתי עושים את זה?** — אילו מצבים, אילו מקרים דורשים את זה
📊 **כמה ועד כמה?** — מספרים, יחסים, גבולות, נורמות
💡 **דוגמה מהחיים** — מקרה אמיתי שמדגים את הנושא
⚠️ **טעויות נפוצות** — מה אנשים עושים לא נכון ולמה

**חשוב מאוד:** התאם את שפת ההסבר לרמת המשתמש —
- מתחיל: שפה פשוטה, אנלוגיות מהחיים, אפס ז'רגון ללא הסבר
- בינוני: תוכן מקצועי אבל עם הסברים לכל מונח טכני
- מתקדם: מעמיק, מקצועי, כולל edge cases ו-tradeoffs

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

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        console.error('[chat] Anthropic stream error:', err instanceof Error ? err.message : String(err));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'שגיאת AI' })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
