import { motion } from 'motion/react';
import { Target, Sparkles } from 'lucide-react';
import { useClinical } from '../context/ClinicalContext';
import { cn } from '../lib/utils';
import { useMemo } from 'react';

export default function MatchingScore() {
  const { hpoTerms, variants } = useClinical();

  const score = useMemo(() => {
    if (hpoTerms.length === 0 || variants.length === 0) return 0;
    
    // A simplified matching logic for the UI
    const base = Math.min(100, (hpoTerms.length * 10) + (variants.length * 15));
    const variation = Math.sin(hpoTerms.length + variants.length) * 5;
    return Math.floor(Math.max(0, Math.min(100, base + variation)));
  }, [hpoTerms, variants]);

  const getStatus = (s: number) => {
    if (s > 80) return { label: 'High Confidence', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (s > 40) return { label: 'Incomplete Evidence', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Insufficient Data', color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' };
  };

  const status = getStatus(score);

  return (
    <div className="flex items-center gap-4 px-6 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
      <div className="relative">
         <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-slate-100"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="113.1"
              initial={{ strokeDashoffset: 113.1 }}
              animate={{ strokeDashoffset: 113.1 - (113.1 * score) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("transition-colors", status.color)}
            />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center">
            <Target className={cn("w-4 h-4", status.color)} />
         </div>
      </div>

      <div className="flex flex-col">
         <div className="flex items-center gap-2">
            <span className="text-[12px] font-black text-slate-900 tracking-tighter">{score}% MATCH</span>
            {score > 80 && <Sparkles className="w-3 h-3 text-emerald-500" />}
         </div>
         <div className={cn(
            "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border mt-0.5",
            status.color,
            status.bg,
            status.border
         )}>
            {status.label}
         </div>
      </div>
    </div>
  );
}
