import { Users, Target, ChevronRight, Activity, TrendingUp, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface CohortMatch {
  id: string;
  condition: string;
  similarity: number;
  sharedPhenotypes: string[];
  omimId: string;
}

import { useClinical } from '../context/ClinicalContext';

export default function SimilarityPage() {
  const { hpoTerms, setActivePage } = useClinical();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<CohortMatch[]>([
    { id: 'c1', condition: 'MELAS Syndrome', similarity: 94.2, sharedPhenotypes: ['Myopathy', 'Hearing Loss', 'Lactic Acidosis'], omimId: '#540000' },
    { id: 'c2', condition: 'Leigh Syndrome', similarity: 68.5, sharedPhenotypes: ['Myopathy', 'Neurological Decline'], omimId: '#256000' },
    { id: 'c3', condition: 'Pearson Syndrome', similarity: 42.1, sharedPhenotypes: ['Lactic Acidosis', 'Failure to Thrive'], omimId: '#557000' },
    { id: 'c4', condition: 'Kearns-Sayre Syndrome', similarity: 31.8, sharedPhenotypes: ['Hearing Loss', 'Ophthalmoplegia'], omimId: '#530000' },
    { id: 'c5', condition: 'Alpers-Huttenlocher', similarity: 24.5, sharedPhenotypes: ['Seizures', 'Liver Failure'], omimId: '#203700' },
  ]);

  const handleRunComparison = () => {
    setIsAnalyzing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Querying Global Rare Disease Cohorts...',
        success: () => {
          setIsAnalyzing(false);
          return 'Similarity Matrix Recalibrated';
        },
        error: 'Network timeout'
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Similarity Matcher</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Phenotypic Distance Benchmarking</p>
        </div>
        <button 
          onClick={handleRunComparison}
          disabled={isAnalyzing}
          className="group px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
        >
           <Target className={cn("w-4 h-4 text-emerald-400", isAnalyzing && "animate-spin")} />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Run Cohort Match</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Global Cohort Distribution</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                 <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Similarity Index</span>
              </div>
           </div>

           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matches} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="condition" type="category" width={120} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                 />
                <Bar dataKey="similarity" radius={[0, 20, 20, 0]} barSize={24}>
                  {matches.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>

           <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                 <Search className="w-5 h-5 text-slate-400" />
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Topological Resonance</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {matches.slice(0, 2).map((match, i) => (
                   <div key={match.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{match.similarity}% Match</span>
                         <span className="text-[9px] font-mono text-slate-400">{match.omimId}</span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">{match.condition}</h5>
                      <div className="flex flex-wrap gap-2">
                         {match.sharedPhenotypes.map(p => (
                           <span key={p} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black text-slate-500 uppercase">
                             {p}
                           </span>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Diagnosis Confidence</h4>
              </div>
              <div className="mb-6">
                 <span className="text-5xl font-mono font-black text-white">94.2</span>
                 <span className="text-xl font-black text-emerald-400 ml-2">%</span>
              </div>
              <p className="text-xs font-bold leading-relaxed mb-6 opacity-80 italic">
                Cross-cohort similarity indices identify a high-confidence match between Patient_01 and the established MELAS phenotypic cluster (OMIM #540000).
              </p>
              <button 
                onClick={() => {
                  toast.success('Compiling Case Synthesis...');
                  setActivePage('report');
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/50"
              >
                Generate Full Profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Analysis Parameters</h3>
             <div className="space-y-6">
                {[
                  { label: 'Ontology Depth', val: 'L-4', status: 'Optimal' },
                  { label: 'Weight Mode', val: 'Semantic', status: 'Fixed' },
                  { label: 'Database', val: 'OMIM/Orpha', status: 'Sync' },
                ].map(param => (
                  <div key={param.label} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{param.label}</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{param.val}</p>
                     </div>
                     <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{param.status}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
