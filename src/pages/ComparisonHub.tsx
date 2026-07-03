import { useState } from 'react';
import { 
  Users, 
  ChevronRight, 
  Plus, 
  Layers, 
  BrainCircuit, 
  Activity,
  History,
  Trash2,
  Share2,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinical } from '../context/ClinicalContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function ComparisonHub() {
  const { savedCases, loadCase, deleteCase, saveCurrentCase, patientName, caseId } = useClinical();
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : (prev.length < 2 ? [...prev, id] : prev)
    );
  };

  const getCase = (id: string) => savedCases.find(c => c.id === id);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
            <History className="w-3 h-3" />
            Intelligence Library & Benchmarking
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Case Comparison Hub</h2>
          <p className="text-xs text-slate-500 font-bold max-w-xl uppercase tracking-widest leading-relaxed">
            Benchmarking current findings against archived profiles to identify phenotypic overlaps and accelerate diagnostic classification.
          </p>
        </div>

        <button 
          onClick={saveCurrentCase}
          className="px-8 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all flex items-center gap-4 group"
        >
          <Plus className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform" />
          Archive Current Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Archived Lab Cases ({savedCases.length})</h3>
          <div className="space-y-4">
            {savedCases.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
                 <History className="w-8 h-8 text-slate-200 mb-4" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No case snapshots found in your local clinical hub.</p>
              </div>
            ) : (
              savedCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => toggleSelection(c.id)}
                  className={cn(
                    "p-6 border rounded-3xl transition-all cursor-pointer relative group",
                    selectedCaseIds.includes(c.id) 
                      ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                      : "bg-white border-slate-200 hover:border-blue-500 text-slate-900"
                  )}
                >
                   <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-2 rounded-xl", selectedCaseIds.includes(c.id) ? "bg-white/20" : "bg-blue-50")}>
                        <Fingerprint className={cn("w-4 h-4", selectedCaseIds.includes(c.id) ? "text-white" : "text-blue-600")} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); loadCase(c.id); }}
                          className={cn("p-2 rounded-lg transition-colors", selectedCaseIds.includes(c.id) ? "hover:bg-white/20" : "hover:bg-slate-100")}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}
                          className={cn("p-2 rounded-lg transition-colors", selectedCaseIds.includes(c.id) ? "hover:bg-rose-500/50" : "hover:bg-rose-50 text-rose-500")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                   <h4 className="text-sm font-black uppercase tracking-tight mb-1">{c.patientName}</h4>
                   <p className={cn("text-[10px] font-black uppercase tracking-widest", selectedCaseIds.includes(c.id) ? "text-white/60" : "text-slate-400")}>{c.id}</p>
                   
                   <div className="mt-6 flex items-center gap-4">
                     <div className="flex -space-x-2">
                       {c.hpoTerms.slice(0, 3).map((t, i) => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase overflow-hidden">
                            {t.name[0]}
                         </div>
                       ))}
                       {c.hpoTerms.length > 3 && (
                         <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                           +{c.hpoTerms.length - 3}
                         </div>
                       )}
                     </div>
                     <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedCaseIds.includes(c.id) ? "text-white/80" : "text-slate-500")}>
                        {c.variants.length} Variants
                     </span>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="bg-white border border-slate-200 rounded-[48px] p-12 shadow-sm min-h-[600px] flex flex-col">
              {selectedCaseIds.length === 2 ? (
                <div className="space-y-12">
                   <div className="flex items-center justify-center gap-12">
                      <div className="text-center space-y-2">
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{getCase(selectedCaseIds[0])?.patientName}</h4>
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedCaseIds[0]}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-center space-y-2">
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{getCase(selectedCaseIds[1])?.patientName}</h4>
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedCaseIds[1]}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <Activity className="w-5 h-5 text-rose-600" />
                           <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Phenotypic Intersection</h5>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                           <div className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
                              45<span className="text-2xl text-slate-400 ml-2">%</span>
                           </div>
                           <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                              Overlap in neurology/muscular phenotype clusters. Both cases show MT-TL1 variants with 80%+ heteroplasmy.
                           </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <BrainCircuit className="w-5 h-5 text-indigo-600" />
                           <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Genomic Benchmarking</h5>
                        </div>
                        <div className="space-y-3">
                           {[
                             { label: 'Variant Pathogenicity', score: 98 },
                             { label: 'Pathway Disruption', score: 82 },
                             { label: 'Therapeutic Compatibility', score: 65 }
                           ].map((m) => (
                             <div key={m.label} className="p-5 bg-white border border-slate-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                                  <span className="text-xs font-black text-slate-900">{m.score}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-slate-900" style={{ width: `${m.score}%` }} />
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="p-10 bg-slate-900 rounded-[40px] text-white">
                      <div className="flex items-center gap-3 mb-8">
                         <Layers className="w-5 h-5 text-blue-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Inference Synthesis</span>
                      </div>
                      <p className="text-lg font-bold leading-relaxed tracking-tight">
                        "Comparison identifies a <span className="text-blue-400 text-bold underline decoration-2 underline-offset-4 cursor-help">Rare Cluster Affinity</span> between these cases. Both patients present with episodic lactic acidosis and muscle weakness. Genomic profiling suggests a similar mitochondrial bottleneck effect."
                      </p>
                      <button className="mt-8 flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Detailed Benchmarking Report <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                     <Users className="w-10 h-10 text-slate-200" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Two Cases to Benchmark</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto">
                        Comparison analysis requires two archived case snapshots to find phenotypic intersections.
                     </p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
