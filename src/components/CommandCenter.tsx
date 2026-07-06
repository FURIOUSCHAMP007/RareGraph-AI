import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Home, Sparkles, Activity, Share2, Dna, FileText, X, ChevronRight, Pill, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useClinical } from '../context/ClinicalContext';

export default function CommandCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setActivePage } = useClinical();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { id: 'home', label: 'Go to Research Overview', icon: Home, category: 'Navigation' },
    { id: 'diagnosis', label: 'Open Diagnostic Engine', icon: Activity, category: 'Navigation' },
    { id: 'graph', label: 'Visual Graph Explorer', icon: Share2, category: 'Navigation' },
    { id: 'genomic', label: 'Genomic Intel Board', icon: Dna, category: 'Navigation' },
    { id: 'pharmacogenomics', label: 'PGx Studio', icon: Pill, category: 'Navigation' },
    { id: 'bionemo', label: 'NVIDIA BioNeMo™ Hub', icon: Cpu, category: 'Navigation' },
    { id: 'entitizer', label: 'Start Note Entitizer', icon: Sparkles, category: 'Tools' },
    { id: 'report', label: 'Generate Clinical Report', icon: FileText, category: 'Tools' },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % actions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + actions.length) % actions.length);
      } else if (e.key === 'Enter') {
        handleSelect(actions[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actions, selectedIndex]);

  const handleSelect = (action: typeof actions[0]) => {
    if (!action) return;
    setActivePage(action.id as any);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] pointer-events-auto overflow-hidden flex flex-col"
            >
              <div className="flex items-center px-6 py-5 border-b border-slate-100 gap-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search hub..."
                  className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-900 placeholder:text-slate-400"
                />
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
                  <Command className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500">K</span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
                {actions.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-400">No matching commands found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {['Navigation', 'Tools'].map(cat => {
                      const catActions = actions.filter(a => a.category === cat);
                      if (catActions.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-1">
                          <h4 className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">{cat}</h4>
                          {catActions.map((action) => {
                            const actualIndex = actions.indexOf(action);
                            return (
                              <button
                                key={action.id}
                                onClick={() => handleSelect(action)}
                                onMouseEnter={() => setSelectedIndex(actualIndex)}
                                className={cn(
                                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                                  selectedIndex === actualIndex ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "hover:bg-slate-50 text-slate-600"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={cn("p-2 rounded-xl transition-colors", selectedIndex === actualIndex ? "bg-white/20" : "bg-slate-100 group-hover:bg-white")}>
                                    <action.icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-bold tracking-tight">{action.label}</span>
                                </div>
                                {selectedIndex === actualIndex && <ChevronRight className="w-4 h-4" />}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 leading-none shadow-sm">Enter</kbd>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 leading-none shadow-sm">↑↓</kbd>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigate</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 leading-none shadow-sm">Esc</kbd>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Close</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
