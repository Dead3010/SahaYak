import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'model';
  content: string;
}

type BugFlow = null | 'ask_description' | 'ask_area';

const STORAGE_KEY = 'ganga_chat';
const TOOLTIP_MESSAGES = ["Hi, I'm Ganga🤗", "Error or Doubt? I'm here for it😊"];

const AREA_OPTIONS = [
  'Tickets',
  'Dashboard',
  'AI Features',
  'Email Setup',
  'Teams',
  'Users & Roles',
  'Login / Account',
  'Billing',
  'Other:',
];

const isBugIntent = (msg: string): boolean => {
  const t = msg.toLowerCase();
  return (
    t.includes('report a bug') ||
    t.includes('report bug') ||
    t.includes('found a bug') ||
    t.includes("there's a bug") ||
    t.includes('there is a bug') ||
    t.includes('bug report') ||
    t.includes('something is broken') ||
    t.includes('something broke') ||
    t.includes('i want to report') ||
    (t.includes('bug') && (t.includes('report') || t.includes('found') || t.includes('have a')))
  );
};

export default function GangaChat() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tooltipMsg, setTooltipMsg] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [bugFlow, setBugFlow] = useState<BugFlow>(null);
  const [showAreaChips, setShowAreaChips] = useState(false);

  const bugDescriptionRef = useRef('');
  const tooltipIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const interval = setInterval(() => {
      if (openRef.current) return;
      const msg = TOOLTIP_MESSAGES[tooltipIndexRef.current % TOOLTIP_MESSAGES.length];
      tooltipIndexRef.current += 1;
      setTooltipMsg(msg);
      setBouncing(true);
      const hide = setTimeout(() => { setTooltipMsg(null); setBouncing(false); }, 3000);
      return () => clearTimeout(hide);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showAreaChips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const pushModel = (content: string) =>
    setMessages((prev) => [...prev, { role: 'model', content }]);

  const submitBugReport = async (area: string) => {
    setShowAreaChips(false);
    setMessages((prev) => [...prev, { role: 'user', content: area }]);
    setLoading(true);
    try {
      await api.settings.reportBug({
        name: user?.name || 'Unknown',
        email: user?.email || 'unknown@unknown.com',
        description: bugDescriptionRef.current,
        area,
      });
      pushModel("✅ Bug reported! Our team will look into it. Thank you for helping us improve SahaYak AI 🙏");
    } catch {
      pushModel("Sorry, I couldn't submit the bug report right now. Please use the bug report form in the sidebar instead.");
    } finally {
      setLoading(false);
      setBugFlow(null);
      bugDescriptionRef.current = '';
    }
  };

  const handleChipClick = (option: string) => {
    if (option === 'Other:') {
      setShowAreaChips(false);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    submitBugReport(option);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput('');

    // Bug flow step 2: received description → show area chips
    if (bugFlow === 'ask_description') {
      bugDescriptionRef.current = text;
      setBugFlow('ask_area');
      setShowAreaChips(true);
      pushModel("Got it! 📍 Which part of the app was affected?");
      return;
    }

    // Bug flow step 3: received custom "Other:" area → submit
    if (bugFlow === 'ask_area') {
      await submitBugReport(text);
      return;
    }

    // Bug flow step 1: detect intent
    if (isBugIntent(text)) {
      setBugFlow('ask_description');
      pushModel("I'd love to help you report that! 🐛\nCan you briefly describe what went wrong?");
      return;
    }

    // Normal AI chat
    setLoading(true);
    try {
      const history = withUser.slice(0, -1).map((m) => ({ role: m.role, parts: m.content }));
      const { reply } = await api.chat.send(text, history);
      pushModel(reply);
    } catch {
      pushModel("Sorry, I couldn't get a response right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((o) => !o);
    setTooltipMsg(null);
    setBouncing(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">

      {/* Chat window */}
      {open && (
        <div
          className="w-80 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in"
          style={{ height: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-base">😊</span>
              </div>
              <span className="text-sm font-bold text-white">Ganga 🤗</span>
              <span className="text-[10px] text-blue-200 ml-1">AI Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50/40">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 pb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Hi! I'm Ganga 🤗</p>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Ask me anything about SahaYak AI — or say{' '}
                  <span className="font-medium text-slate-500">"report a bug"</span> to log an issue!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-sm border border-slate-100 shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Area chips — shown after Ganga asks "which part" */}
            {showAreaChips && !loading && (
              <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                {AREA_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChipClick(option)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 hover:-translate-y-0.5 ${
                      option === 'Other:'
                        ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={
                bugFlow === 'ask_description' ? 'Describe the bug…' :
                bugFlow === 'ask_area' && !showAreaChips ? 'Type the area…' :
                'Ask Ganga…'
              }
              disabled={loading || showAreaChips}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 bg-slate-50 focus:bg-white transition-all duration-150 disabled:opacity-40"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim() || showAreaChips}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Tooltip bubble */}
      {tooltipMsg && !open && (
        <div className="relative bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg whitespace-nowrap animate-fade-in">
          {tooltipMsg}
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-slate-800 rotate-45" />
        </div>
      )}

      {/* Ball button */}
      <button
        onClick={handleOpen}
        title="Chat with Ganga"
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${bouncing ? 'animate-bounce' : ''}`}
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
      >
        {open ? <X className="w-5 h-5 text-white" /> : <span className="text-2xl">😊</span>}
      </button>

    </div>
  );
}
