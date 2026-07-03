import { useState, useMemo } from 'react';
import { 
  Database, 
  BarChart3, 
  Dna, 
  Microscope,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Download,
  Activity,
  Layers,
  Grid3X3
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const transcriptomeData = [
  { name: 'MT-ND1', zScore: -2.4, status: 'Under-expressed' },
  { name: 'MT-ND5', zScore: -3.1, status: 'Critically Low' },
  { name: 'MT-CO1', zScore: 0.2, status: 'Normal' },
  { name: 'MT-CO3', zScore: -0.8, status: 'Normal' },
  { name: 'MT-ATP6', zScore: -4.2, status: 'Critically Low' },
  { name: 'CASP3', zScore: 2.8, status: 'Over-expressed' },
  { name: 'NRF1', zScore: 1.5, status: 'Upregulated' }
];

const metabolomicsData = [
  { metabolite: 'Lactate', concentration: 15.4, normalRange: [0.5, 2.2], unit: 'mmol/L' },
  { metabolite: 'Pyruvate', concentration: 0.12, normalRange: [0.03, 0.12], unit: 'mmol/L' },
  { metabolite: 'Alanine', concentration: 840, normalRange: [200, 450], unit: 'µmol/L' },
  { metabolite: 'Citrulline', concentration: 12, normalRange: [15, 45], unit: 'µmol/L' },
  { metabolite: 'Glycine', concentration: 320, normalRange: [150, 600], unit: 'µmol/L' }
];

// Heatmap Data: Correlation between Genes (Rows) and Phenotypes (Cols)
const heatmapGenes = ['MT-ATP6', 'MT-ND5', 'MT-ND1', 'NRF1', 'CASP3'];
const heatmapPhenotypes = ['Ptosis', 'Myopathy', 'Lactic Acidosis', 'Hearing Loss', 'Cardiomyopathy'];
const heatmapMatrix = [
  [0.9, 0.8, 0.95, 0.4, 0.7],
  [0.85, 0.9, 0.8, 0.3, 0.6],
  [0.4, 0.5, 0.7, 0.9, 0.3],
  [0.2, 0.1, 0.1, 0.0, 0.1],
  [0.1, 0.2, 0.3, 0.1, 0.2]
];

export default function MultiOmicsPage() {
  const [activeTab, setActiveTab] = useState<'transcriptomics' | 'metabolomics' | 'heatmap'>('transcriptomics');

  const getHeatmapColor = (value: number) => {
    if (value > 0.8) return 'bg-rose-600';
    if (value > 0.6) return 'bg-rose-400';
    if (value > 0.4) return 'bg-amber-400';
    if (value > 0.2) return 'bg-slate-200';
    return 'bg-slate-100';
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
          <Database className="w-3 h-3" />
          Multi-Omics Expansion Module (v3.0)
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Functional Genomic profiling</h2>
        <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
          Rare diseases are often genomically silent. This module integrates RNA-Seq transcriptomics and mass-spec metabolomics to identify functional signatures and non-coding variant impacts.
        </p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl self-start">
         <button 
           onClick={() => setActiveTab('transcriptomics')}
           className={cn(
             "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'transcriptomics' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
           )}
         >
           Transcriptomics
         </button>
         <button 
           onClick={() => setActiveTab('metabolomics')}
           className={cn(
             "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'metabolomics' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
           )}
         >
           Metabolomics
         </button>
         <button 
           onClick={() => setActiveTab('heatmap')}
           className={cn(
             "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
             activeTab === 'heatmap' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
           )}
         >
           Correlation Matrix
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Chart Area */}
        <div className="xl:col-span-8 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm min-h-[600px]">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600">
                       {activeTab === 'transcriptomics' ? <Microscope className="w-6 h-6" /> : 
                        activeTab === 'metabolomics' ? <Activity className="w-6 h-6" /> :
                        <Grid3X3 className="w-6 h-6" />}
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                         {activeTab === 'transcriptomics' ? 'RNA Expression Landscape' : 
                          activeTab === 'metabolomics' ? 'Metabolic Signature Analysis' :
                          'Omics-Phenotype Correlation Heatmap'}
                       </h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                         {activeTab === 'transcriptomics' ? 'Differential Expression (Z-Scores)' : 
                          activeTab === 'metabolomics' ? 'Concentration vs Standard Deviation' :
                          'Multi-layer Correlation coefficients'}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors border border-slate-100">
                       <Download className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {activeTab === 'heatmap' ? (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <div />
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {heatmapPhenotypes.map(p => (
                        <div key={p} className="text-[9px] font-black uppercase tracking-widest text-slate-400 -rotate-45 h-12 flex items-end justify-center pb-2">
                          {p}
                        </div>
                      ))}
                    </div>
                    
                    {heatmapGenes.map((gene, rowIdx) => (
                      <div key={gene} className="contents">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight flex items-center h-16">
                          {gene}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {heatmapMatrix[rowIdx].map((val, colIdx) => (
                            <motion.div
                              key={`${rowIdx}-${colIdx}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (rowIdx * 5 + colIdx) * 0.02 }}
                              className={cn(
                                "h-16 rounded-xl flex items-center justify-center text-[10px] font-black text-white group relative cursor-pointer hover:ring-4 ring-slate-100 transition-all",
                                getHeatmapColor(val)
                              )}
                            >
                              {val}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 self-center mt-8">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-rose-600 rounded" />
                        <span className="text-[9px] font-black uppercase text-slate-400">High (&gt;0.8)</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded" />
                        <span className="text-[9px] font-black uppercase text-slate-400">Medium (0.4-0.8)</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-200 rounded" />
                        <span className="text-[9px] font-black uppercase text-slate-400">Low (&lt;0.4)</span>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      {activeTab === 'transcriptomics' ? (
                         <BarChart data={transcriptomeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '16px' }} />
                            <Bar dataKey="zScore" radius={[8, 8, 0, 0]}>
                               {transcriptomeData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.zScore < -2 ? '#f43f5e' : entry.zScore > 2 ? '#3b82f6' : '#94a3b8'} />
                               ))}
                            </Bar>
                         </BarChart>
                      ) : (
                         <AreaChart data={metabolomicsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="metabolite" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '16px' }} />
                            <Area type="monotone" dataKey="concentration" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={4} />
                         </AreaChart>
                      )}
                   </ResponsiveContainer>
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-white border border-slate-200 rounded-[32px] space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Transcriptome Insight
                 </h4>
                 <div className="space-y-4">
                    <p className="text-sm font-black text-slate-900 leading-tight">Severe down-regulation of <span className="text-rose-600">MT-ATP6</span> detected.</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      While the exome variant was classified as VUS, the RNA-Seq data demonstrates a significant clinical impact, with transcript levels dropping below 20% of control averages.
                    </p>
                 </div>
              </div>
              <div className="p-8 bg-white border border-slate-200 rounded-[32px] space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    <Layers className="w-3 h-3 text-blue-500" />
                    Metabolic Signature
                 </h4>
                 <div className="space-y-4">
                    <p className="text-sm font-black text-slate-900 leading-tight">Elevated <span className="text-rose-600">Lactate/Pyruvate Ratio</span> (128.3).</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Mass spectrometry across blood and CSF indicates a chronic state of anaerobic metabolism, reinforcing the mitochondrial dysfunction hypothesis.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Panel: Tabular results */}
        <div className="xl:col-span-4 space-y-6 h-full">
           <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                       <Database className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Anomaly Registry</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Multi-layer verification</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                 <div className="space-y-2">
                    {activeTab === 'heatmap' ? (
                       <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Top Correlations</h5>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-slate-500">MT-ATP6 → Ptosis</span>
                               <span className="text-xs font-black text-emerald-600">0.90</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-slate-500">MT-ND5 → Lactic Acidosis</span>
                               <span className="text-xs font-black text-emerald-600">0.95</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-slate-500">NRF1 → Hearing Loss</span>
                               <span className="text-xs font-black text-emerald-600">0.90</span>
                            </div>
                         </div>
                       </div>
                    ) : (
                      activeTab === 'transcriptomics' ? (
                        transcriptomeData.map((gene, idx) => (
                           <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all flex items-center justify-between group">
                              <div>
                                 <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{gene.name}</h5>
                                 <p className={cn("text-[8px] font-black uppercase tracking-widest", gene.zScore < -2 ? "text-rose-500" : "text-emerald-500")}>{gene.status}</p>
                              </div>
                              <div className="text-right">
                                 <span className="text-xs font-black text-slate-900">{gene.zScore}</span>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Z-Score</p>
                              </div>
                           </div>
                        ))
                     ) : (
                        metabolomicsData.map((met, idx) => (
                           <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all flex items-center justify-between group">
                              <div>
                                 <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{met.metabolite}</h5>
                                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Range: {met.normalRange[0]}-{met.normalRange[1]}</p>
                              </div>
                              <div className="text-right">
                                 <span className={cn("text-xs font-black", met.concentration > met.normalRange[1] ? "text-rose-500" : "text-slate-900")}>
                                    {met.concentration} {met.unit}
                                 </span>
                              </div>
                           </div>
                        ))
                     )
                    )}
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100">
                 <button className="w-full flex items-center justify-between px-8 py-5 bg-slate-900 text-white rounded-2xl group hover:bg-slate-800 transition-all active:scale-[0.98]">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Cross-layer Analysis</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-all" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

