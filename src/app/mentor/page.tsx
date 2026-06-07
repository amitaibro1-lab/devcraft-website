'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  authenticated: boolean;
  name?: string;
  plan?: string;
}

export default function MentorPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/mentor/access')
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessLoading(true);
    setAccessError('');

    const res = await fetch('/api/mentor/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: accessCode }),
    });

    const data = await res.json();
    setAccessLoading(false);

    if (!res.ok) {
      setAccessError(data.error ?? 'שגיאה');
    } else {
      setSession({ authenticated: true, name: data.name, plan: data.plan });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/mentor/access', { method: 'DELETE' });
    setSession({ authenticated: false });
    setMessages([]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = 'שגיאה — נסה שוב';
          return updated;
        });
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;

          try {
            const { text } = JSON.parse(payload);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          } catch {
            // ignore parse errors
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Loading state
  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Access code screen
  if (!session.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🧠</div>
              <h1 className="text-2xl font-bold text-white mb-2">AI Master Mentor</h1>
              <p className="text-slate-400 text-sm">
                מנטור AI אישי שלומד ומכיר אותך לאורך זמן
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">קוד גישה</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="הכנס את קוד הגישה שלך"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-right"
                  dir="rtl"
                />
              </div>

              {accessError && (
                <p className="text-red-400 text-sm text-center">{accessError}</p>
              )}

              <button
                type="submit"
                disabled={accessLoading || !accessCode.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
              >
                {accessLoading ? 'בודק...' : 'כניסה'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-500 text-sm mb-3">אין לך עדיין גישה?</p>
              <Link
                href="/mentor/pricing"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                הצטרף עכשיו ←
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Header */}
      <div className="flex-none border-b border-white/10 px-4 py-3 flex items-center justify-between bg-[#0f0f1a]">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🧠</div>
          <div>
            <p className="font-semibold text-white text-sm">AI Master Mentor</p>
            <p className="text-xs text-slate-500">
              שלום {session.name} · תוכנית {session.plan}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            פעיל
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-xl font-bold text-white mb-2">שלום {session.name}!</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
              אני המנטור האישי שלך ל-AI. אני כאן ללמד אותך לבנות, להשיק
              ולהרוויח ממערכות AI — מהבסיס ועד לחברה.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 max-w-xs mx-auto">
              {[
                'תלמד אותי Claude Code מהתחלה',
                'איך אני מוצא לקוח ראשון?',
                'מה זה MCP ואיך בונים עם זה?',
                'בנה איתי אוטומציה לעסק',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="text-right text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white/8 border border-white/10 text-slate-100 rounded-bl-sm'
                }`}
                dir="rtl"
              >
                {msg.content}
                {msg.role === 'assistant' && loading && i === messages.length - 1 && msg.content === '' && (
                  <span className="inline-flex gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-none border-t border-white/10 px-4 py-4 bg-[#0f0f1a]">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שאל שאלה, בקש שיעור, בקש עזרה בפרויקט..."
            rows={1}
            dir="rtl"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm leading-relaxed"
            style={{ maxHeight: '160px', overflowY: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 160) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
            aria-label="שלח"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Enter לשליחה · Shift+Enter לשורה חדשה</p>
      </div>
    </div>
  );
}
