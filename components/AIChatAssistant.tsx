
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Eraser, Circle } from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { getInventoryAssistantResponse } from '../services/geminiService';

interface AIChatAssistantProps {
  inventory: Product[];
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ inventory }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to Marimaya Closet. I am your Boutique Assistant. I have analyzed our current collection and am ready to assist with stock strategies or styling inquiries.", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getInventoryAssistantResponse(
        input,
        inventory,
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: "The conversation history has been cleared. How can I assist you with the Marimaya collection now?", timestamp: new Date().toISOString() }
    ]);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500 rounded-2xl shadow-lg shadow-violet-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">AI Assistant</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Circle size={6} className="fill-current animate-pulse" />
                <span>Live Context</span>
              </span>
              <span className="text-slate-500 text-xs tracking-wide">• {inventory.length} Silhouettes Tracked</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 rounded-xl transition-all text-xs font-medium"
        >
          <Eraser size={14} />
          <span>Clear Session</span>
        </button>
      </header>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col border border-slate-700/30">
        <div ref={scrollRef} className="flex-1 p-6 space-y-8 overflow-y-auto scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] lg:max-w-[70%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  m.role === 'user' 
                    ? 'bg-violet-500 ml-4 shadow-lg shadow-violet-500/20' 
                    : 'bg-slate-900 mr-4 border border-slate-700'
                }`}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-violet-400" />}
                </div>
                <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-violet-600 text-white rounded-tr-none shadow-xl' 
                    : 'bg-slate-900/80 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <div className={`text-[10px] mt-2 opacity-50 ${m.role === 'user' ? 'text-white text-right' : 'text-slate-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex items-center space-x-3 text-slate-500 text-sm font-serif italic bg-slate-900/40 px-4 py-3 rounded-2xl border border-slate-800">
                <Loader2 size={16} className="animate-spin text-violet-500" />
                <span>Assistant is refining the strategy...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-slate-900/80 border-t border-slate-800/50 backdrop-blur-xl">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire about stock levels, margins, or collection styling..."
              className="w-full bg-slate-950/50 border border-slate-800 text-white pl-6 pr-16 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-slate-600 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none hover:scale-105 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatAssistant;
