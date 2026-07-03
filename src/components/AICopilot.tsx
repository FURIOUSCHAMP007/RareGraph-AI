import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minus, Maximize2, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { chatWithCopilot } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useClinical } from '../context/ClinicalContext';

export default function AICopilot() {
  const { hpoTerms, variants, activePage } = useClinical();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Welcome to RareGraph AI. I can assist with phenotypic analysis, genomic interpretation, or literature synthesis. How can I help with your current clinical investigation?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
       const response = await chatWithCopilot(
         userMessage, 
         { hpoTerms, variants, currentPage: activePage },
         messages
       );
       
       setMessages(prev => [...prev, { 
         role: 'assistant', 
         content: response
       }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a processing error. Please verify your clinical parameters." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[400px] h-[600px] bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">RareGraph Copilot</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-mono font-black">REASONING ENGINE V3</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex",
                  m.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-blue-600 text-white font-bold" 
                      : "bg-slate-800 text-slate-300 font-medium border border-slate-700 shadow-lg"
                  )}>
                    <div className="prose prose-invert prose-sm">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Analyzing Clinical Context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex gap-2 p-2 bg-slate-900 border border-slate-700 rounded-xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about phenotype consistency..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm placeholder:text-slate-600 font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 group relative overflow-hidden",
          isOpen ? "bg-slate-900" : "bg-blue-600"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </button>

      {isMinimized && (
        <button 
          onClick={() => setIsMinimized(false)}
          className="absolute bottom-16 right-0 p-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-2 text-white shadow-2xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Restore Copilot Session</span>
        </button>
      )}
    </div>
  );
}
