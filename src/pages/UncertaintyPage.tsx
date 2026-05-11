import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AlertTriangle, ShieldAlert, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const confidenceData = [
  { name: '0.1', value: 5 },
  { name: '0.2', value: 12 },
  { name: '0.3', value: 18 },
  { name: '0.4', value: 25 },
  { name: '0.5', value: 45 },
  { name: '0.6', value: 78 },
  { name: '0.7', value: 92 },
  { name: '0.8', value: 85 },
  { name: '0.9', value: 60 },
  { name: '1.0', value: 20 },
];

const evidenceHeatmap = [
  { category: 'Phenotype', score: 95 },
  { category: 'Genomic', score: 42 },
  { category: 'Imaging', score: 78 },
  { category: 'Literature', score: 65 },
  { category: 'Family History', score: 30 },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function UncertaintyPage() {
  const [activeEvidence, setActiveEvidence] = useState<string[]>(['Phenotype', 'Imaging', 'Literature']);
  const [entropyScores, setEntropyScores] = useState([
    { name: 'Missing Genomics', value: 40 },
    { name: 'Incomplete History', value: 30 },
    { name: 'Low Image Res', value: 20 },
    { name: 'Vague Symptoms', value: 10 },
  ]);

  const handleToggleEvidence = (cat: string) => {
    setActiveEvidence(prev => {
      const isRemoving = prev.includes(cat);
      if (isRemoving) return prev.filter(c => c !== cat);
      return [...prev, cat];
    });
    
    // Update entropy scores mock logic
    if (cat === 'Genomic') {
      setEntropyScores(prev => prev.map(s => s.name === 'Missing Genomics' ? { ...s, value: activeEvidence.includes('Genomic') ? 40 : 5 } : s));
    }
    
    toast.success('Priors Updated', { description: `Bayesian distribution recalibrated based on ${cat} evidence availability.` });
  };

  const getAdjustedConfidenceData = () => {
    const multiplier = activeEvidence.includes('Genomic') ? 1.5 : 1;
    return confidenceData.map(d => ({
      ...d,
      value: activeEvidence.includes('Genomic') && Number(d.name) > 0.7 ? d.value * multiplier : d.value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Uncertainty Risk</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Probabilistic Entropy & Reasoning Gaps</p>
        </div>
        <div className="flex gap-3">
          <div className={cn(
             "px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all animate-pulse",
             activeEvidence.includes('Genomic') ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
          )}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Confidence: {activeEvidence.includes('Genomic') ? 'STABLE' : 'UNSTABLE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bayesian Confidence Distribution */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
            <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inference Probability Field</h3>
               <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Bayesian Posterior Shift</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
               {['Phenotype', 'Imaging', 'Genomic', 'Literature'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => handleToggleEvidence(cat)}
                   className={cn(
                     "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-[0.98]",
                     activeEvidence.includes(cat) 
                       ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                       : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300"
                   )}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getAdjustedConfidenceData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={9} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip 
                  cursor={{ stroke: activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb", strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9', 
                    fontSize: '10px', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 border-t border-slate-50 pt-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Baseline</span>
             </div>
             <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full transition-colors", activeEvidence.includes('Genomic') ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200")} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Adjusted Precision</span>
             </div>
          </div>
        </div>

        {/* Evidence Weighting */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Clinical Evidence Gradient</h3>
          <div className="space-y-6 flex-1">
            {evidenceHeatmap.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => handleToggleEvidence(item.category)}
                className="space-y-3 w-full text-left group"
              >
                <div className="flex justify-between items-end">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    activeEvidence.includes(item.category) ? "text-slate-900" : "text-slate-300"
                  )}>{item.category}</span>
                  <span className={cn(
                    "text-sm font-mono font-black",
                    activeEvidence.includes(item.category) ? "text-slate-900" : "text-slate-200"
                  )}>{activeEvidence.includes(item.category) ? item.score : 0}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: activeEvidence.includes(item.category) ? `${item.score}%` : '0%' }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      item.category === 'Phenotype' ? "bg-cyan-500 shadow-sm shadow-cyan-200" :
                      item.category === 'Genomic' ? "bg-emerald-500 shadow-sm shadow-emerald-200" :
                      item.category === 'Imaging' ? "bg-blue-500 shadow-sm shadow-blue-200" :
                      item.category === 'Literature' ? "bg-indigo-500 shadow-sm shadow-indigo-200" :
                      "bg-slate-400"
                    )}
                  />
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-900 rounded-[24px] group border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 rounded-full -mr-12 -mt-12 blur-3xl opacity-20" />
             <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Synthesis Report</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight italic relative z-10">
               "{activeEvidence.includes('Genomic') 
                 ? "Genomic anchors confirmed. Entropy reduced by 64.2%. Model stabilized."
                 : "Significant reasoning gaps detected. Mitochondrial protocol recommended."}"
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alternative Hypotheses */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Differential Stability</h3>
              <p className="text-xl font-black uppercase text-slate-900">Alternative Paths</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">DIV: 0.82</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { id: 'H1', name: 'Leigh Syndrome', probability: 0.28, reason: 'MRI gap in basal ganglia.', impact: 'High' },
              { id: 'H2', name: 'Pearson Syndrome', probability: 0.12, reason: 'Waiting on marrow biopsy.', impact: 'Medium' },
              { id: 'H3', name: 'Kearns-Sayre', probability: 0.08, reason: 'Triad pattern incomplete.', impact: 'Low' },
              { id: 'H4', name: 'POLG Disorder', probability: 0.05, reason: 'Hepatic overlap observed.', impact: 'Medium' },
            ].map((h, idx) => (
              <div 
                key={h.id} 
                className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-900 transition-all cursor-pointer group active:scale-[0.98] shadow-sm relative overflow-hidden"
                onClick={() => toast.info(`Investigating ${h.name}`, { description: `Recalculating priors based on ${h.reason}` })}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-slate-900 transition-colors" />
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                     {h.id}
                   </div>
                   <div>
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{h.name}</h4>
                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{h.reason}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black text-slate-900">{(h.probability * 100).toFixed(0)}%</span>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-300">P-VALUE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Evidence Impact */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Structural Entropy Scan</h3>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-48 h-48 group cursor-crosshair">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entropyScores}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={10}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {COLORS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <Target className="w-5 h-5 text-slate-200 mb-1" />
                <span className="text-2xl font-mono font-black text-slate-900">{entropyScores.reduce((a, b) => a + b.value, 0)}%</span>
                <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">System Entropy</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8 w-full">
              {[
                { label: 'Genomics', val: entropyScores[0].value + '%', color: 'bg-rose-500' },
                { label: 'History', val: entropyScores[1].value + '%', color: 'bg-amber-500' },
                { label: 'Imaging', val: entropyScores[2].value + '%', color: 'bg-emerald-500' },
                { label: 'Clinical', val: entropyScores[3].value + '%', color: 'bg-indigo-500' },
              ].map(i => (
                <div key={i.label} className="flex items-center gap-3 py-2 px-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${i.color} shadow-sm transition-transform group-hover:scale-125`} />
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{i.label}</span>
                  <span className="text-xs text-slate-900 font-mono font-black ml-auto">{i.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
