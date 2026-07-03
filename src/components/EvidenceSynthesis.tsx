import { useState, useCallback } from 'react';
import { BookOpen, Sparkles, RefreshCw, Bookmark, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchClinicalEvidence } from '../services/geminiService';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function EvidenceSynthesis({ gene, variant }: { gene: string, variant: string }) {
  const [evidence, setEvidence] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const summary = await fetchClinicalEvidence(gene, variant);
      setEvidence(summary);
      toast.success("Literature evidence synthesized.");
    } catch (error) {
      toast.error("Failed to fetch evidence.");
    } finally {
      setIsLoading(false);
    }
  }, [gene, variant]);

  return (
    <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <BookOpen className="w-32 h-32 text-white" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                 <BookOpen className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">Literature Evidence</h3>
                 <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">Global Publication Search</p>
              </div>
           </div>
           {evidence && (
             <div className="flex gap-2">
                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                   <Bookmark className="w-4 h-4 text-slate-400" />
                </button>
             </div>
           )}
        </div>

        <AnimatePresence mode="wait">
          {!evidence ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
               <p className="text-xs text-slate-400 font-medium mb-6">
                  No automated literature synthesis found for <span className="text-indigo-400 font-bold">{gene} {variant}</span>. Establish real-time link to ClinVar and PubMed?
               </p>
               <button 
                onClick={handleFetch}
                disabled={isLoading}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 mx-auto shadow-xl shadow-indigo-600/20"
               >
                 {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 {isLoading ? 'Searching Repositories...' : 'Synthesize Evidence'}
               </button>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
               <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-[11px] leading-relaxed text-slate-300 font-medium">
                     <Markdown>{evidence}</Markdown>
                  </div>
               </div>
               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Grounding: Google Search (PubMed/ClinVar)</span>
                  <button 
                    onClick={() => {
                      toast.info('Accessing Raw Evidence', { description: 'Opening PubMed sources in a new tab...' });
                      window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(`${gene} ${variant}`)}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                  >
                     View Raw Sources <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
