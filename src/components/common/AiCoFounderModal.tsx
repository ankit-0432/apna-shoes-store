import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Zap,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { api } from '../../services/api.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const STARTER_PROMPTS_COFOUNDER = [
  '🚀 How can we boost our Diwali sneaker sales with a WhatsApp campaign?',
  '📉 What are the best tactics to reduce RTO returns on Cash on Delivery orders?',
  '🏷️ Suggest a high-converting bundle discount for our Men\'s sneakers',
  '👟 What footwear colorways and styles are trending in India for 2026?',
];

const STARTER_PROMPTS_STYLIST = [
  '👟 Which sneakers under ₹1,500 are best for college & daily walking?',
  '📏 Do Apna Shoes fit wide Indian feet or should I order a size up?',
  '👖 How should I style retro low-top white sneakers with jeans & kurtas?',
  '🏃 Recommend a lightweight breathable running shoe from the catalog',
];

export const AiCoFounderModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'cofounder' | 'stylist'>('cofounder');
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      text: `Namaste! 👋 I am your **APNA SHOES AI Co-Founder & Brand Partner**.\n\nWhether you need **D2C growth strategies, festive WhatsApp campaigns, unit economics, and RTO reduction** — or want to switch to **Sneaker Stylist mode** to find the perfect shoe for your feet, I'm here 24/7!\n\nWhat are we building or styling today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to open event from header or other components
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('apna:open-ai-cofounder', handleOpen);
    return () => window.removeEventListener('apna:open-ai-cofounder', handleOpen);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Prepare payload for Gemini API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.sendAiChat(apiMessages, mode, model);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res.text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **AI Co-Founder Note:** ${
          err.message || 'Unable to connect to Gemini at this moment. Please check your network or try again.'
        }`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. I am ready with fresh insights! What would you like to discuss next?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const starterPrompts = mode === 'cofounder' ? STARTER_PROMPTS_COFOUNDER : STARTER_PROMPTS_STYLIST;

  return (
    <>
      {/* 1. Floating AI Co-Founder Launcher Widget */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white shadow-2xl border border-zinc-700/60 hover:border-orange-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open AI Co-Founder"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-black tracking-tight flex items-center gap-1 font-display">
                <span>AI Co-Founder</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold">
                  GEMINI
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">
                Strategy & Sneaker Stylist
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 2. Chat Drawer / Modal Container */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-full max-w-[460px] h-[640px] max-h-[90vh]'
          }`}
        >
          <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black font-display tracking-tight text-white">
                      APNA SHOES AI Co-Founder
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10.5px] text-zinc-400">
                    {mode === 'cofounder' ? 'Brand Strategy & Growth Co-Pilot' : 'Personal Footwear Stylist & Guide'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Speed Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setModel((m) =>
                      m === 'gemini-3.8-flash' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'
                    )
                  }
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                  title="Toggle Gemini Model Speed"
                >
                  <Zap className={`w-3 h-3 ${model === 'gemini-3.1-flash-lite' ? 'text-amber-400' : 'text-orange-400'}`} />
                  <span>{model === 'gemini-3.1-flash-lite' ? 'Lite Speed' : 'Flash Pro'}</span>
                </button>

                {/* Clear */}
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors hidden sm:block"
                  title={isExpanded ? 'Restore size' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 bg-zinc-100 p-1 border-b border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('cofounder')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'cofounder'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                <span>Executive Co-Founder</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('stylist')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'stylist'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sneaker Stylist</span>
              </button>
            </div>

            {/* Chat Message Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      m.role === 'user'
                        ? 'bg-zinc-950 text-white rounded-br-xs'
                        : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Header for AI bubble */}
                    {m.role === 'model' && (
                      <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-zinc-100 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-orange-600">
                          <Sparkles className="w-3 h-3" />
                          <span>{mode === 'cofounder' ? 'AI Co-Founder' : 'Sneaker Stylist'}</span>
                        </span>
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          className="hover:text-zinc-700 flex items-center gap-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Markdown rendering with clean styling */}
                    <div className="whitespace-pre-wrap space-y-1">
                      {m.text.split('\n\n').map((para, pIdx) => {
                        // Check if list item
                        if (para.startsWith('- ') || para.startsWith('* ')) {
                          return (
                            <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                              {para.split('\n').map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  {item.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={pIdx} className="my-1">
                            {para.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[9.5px] text-zinc-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-zinc-200 rounded-2xl rounded-bl-xs w-fit shadow-xs animate-in fade-in duration-150">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
                  <span className="text-[11px] text-zinc-500 font-semibold pl-1">
                    Co-Founder thinking...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips */}
            <div className="p-2.5 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  disabled={loading}
                  className="px-2.5 py-1 bg-zinc-50 hover:bg-orange-50 hover:border-orange-300 text-zinc-700 hover:text-orange-900 border border-zinc-200 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'cofounder'
                    ? 'Ask about pricing, festive drops, WhatsApp ads, RTO reduction...'
                    : 'Ask about shoe sizes, wide feet fit, outfit styling...'
                }
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
