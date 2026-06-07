"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, User, Loader2, MessageSquare, Send } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AssistantDrawer() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Resizing state
  const [drawerWidth, setDrawerWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 800;
  // Using a simplified history state for the UI, mapping to Gemini history
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  // We keep the raw gemini history behind the scenes to send back to the API
  const [geminiHistory, setGeminiHistory] = useState<any[]>([]);
  const { state } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setDrawerWidth(Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          history: geminiHistory,
          departmentId: state.workspace?.departmentId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch AI response');

      setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
      setGeminiHistory(data.history || []);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Desculpe, encontrei um erro. Por favor, tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="group">
          <MessageSquare className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="sr-only">Pergunte à IA</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        className="max-w-none! flex flex-col p-0"
        style={{ width: `${drawerWidth}px`, maxWidth: '100vw' }}
      >
        {/* Drag Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 z-50 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />

        <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <SheetTitle className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                Assistente IA
              </SheetTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gemini 2.5 Pro</p>
            </div>
          </div>
        </SheetHeader>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-950 scroll-smooth">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-500 opacity-75" />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Como posso ajudá-lo hoje?</p>
              <p className="text-sm opacity-80 max-w-[250px]">
                Posso verificar a saúde da sua frota, o plano de faturação atual ou os limites de sensores.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Render Markdown tables as beautiful Shadcn/Tailwind tables
                    table: ({ node, ...props }) => (
                      <div className="my-3 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-100 dark:divide-gray-800" {...props} />,
                    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors" {...props} />,
                    th: ({ node, ...props }) => <th className="px-3 py-2 font-medium" {...props} />,
                    td: ({ node, ...props }) => <td className="px-3 py-2 font-normal text-gray-900 dark:text-gray-100" {...props} />,

                    // Style clean ordered and unordered lists
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1 text-xs" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-xs" {...props} />,
                    li: ({ node, ...props }) => <li className="text-gray-700 dark:text-gray-300" {...props} />,

                    // Style emphasizes, titles and raw codes
                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-red-600 dark:text-red-400" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1 border border-gray-300 dark:border-gray-700">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-1">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-500 rounded-bl-sm flex items-center gap-2 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <form onSubmit={handleSend} className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Pergunte sobre a sua frota ou faturação..."
              className="w-full pr-12 pl-5 py-3.5 bg-gray-100 dark:bg-gray-900 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm transition-all group-hover:border-gray-300 dark:group-hover:border-gray-700"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
              Gemini AI • Dados Confidenciais
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
