import { useState } from 'react';
import { useClinical } from '../context/ClinicalContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StickyNote, 
  X, 
  Clock, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function QuickNotes() {
  const { 
    clinicalNotes, 
    setClinicalNotes, 
    patientName, 
    caseId 
  } = useClinical();

  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!clinicalNotes) {
      toast.error("Notes are empty");
      return;
    }
    try {
      await navigator.clipboard.writeText(clinicalNotes);
      setIsCopied(true);
      toast.success("Notes copied to clipboard", {
        description: "Clinical observations copied for external systems."
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy notes");
    }
  };

  const handleClear = () => {
    if (!clinicalNotes) return;
    if (window.confirm("Are you sure you want to clear all observations for this session? This action cannot be undone.")) {
      setClinicalNotes('');
      toast.info("Notes cleared");
    }
  };

  const insertTimestamp = () => {
    const timeStr = `[${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC] `;
    const updatedNotes = clinicalNotes + (clinicalNotes && !clinicalNotes.endsWith('\n') ? '\n' : '') + timeStr;
    setClinicalNotes(updatedNotes);
  };

  const insertPatientContext = () => {
    const patientStr = `\n--- CASE PROFILE: ${patientName || 'UNIDENTIFIED'} (${caseId || 'NO-ID'}) ---\n`;
    setClinicalNotes(clinicalNotes + patientStr);
  };

  return (
    <div className="fixed bottom-16 right-6 z-40 print:hidden select-none">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-96 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white w-[380px] h-[440px]"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Impressions</span>
                  <span className="text-xs font-bold text-white tracking-tight">Quick Note</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[7px] font-mono text-emerald-400 uppercase font-black">Sync</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Area */}
            <div className="flex-1 p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/40">
                <span className="truncate max-w-[200px]">
                  ID: <span className="text-blue-400 font-bold">{caseId || 'CAS-992-ARC'}</span> ({patientName || 'UNIDENTIFIED'})
                </span>
                <span className="text-slate-500 shrink-0">
                  {clinicalNotes.length} chars
                </span>
              </div>

              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Type clinician insights, phenotypic traits observed, diagnostic ideas, or genomic findings during navigation..."
                className="flex-1 w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900/90 text-slate-100 rounded-xl p-3 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 text-xs leading-relaxed resize-none outline-none transition-all placeholder:text-slate-500 font-medium scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
              />

              {/* Auxiliary Quick Templates */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={insertTimestamp}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-[8px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  title="Insert current UTC date and time"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  Timestamp
                </button>
                <button
                  onClick={insertPatientContext}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-[8px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  title="Append current patient profile divider"
                >
                  <User className="w-3 h-3 text-slate-400" />
                  Case Profile
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleClear}
                disabled={!clinicalNotes}
                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                title="Clear current notes"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-500/10"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-200" />
                    Copy Notes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            layoutId="quickNotesButton"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-full shadow-2xl transition-all cursor-pointer group relative"
          >
            <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-pulse group-hover:scale-110 transition-transform" />
            <div className="relative flex items-center gap-2.5">
              <div className="relative">
                <StickyNote className="w-4 h-4 text-blue-400 group-hover:rotate-6 transition-transform" />
                {clinicalNotes.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-slate-950 rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Quick Notes</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
