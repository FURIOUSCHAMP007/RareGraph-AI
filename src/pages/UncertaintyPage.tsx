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
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Uncertainty Risk</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Temporal Disease Progression & Clinical Milestones</p>
        </div>
        <div className="flex gap-3">
          <div className={cn(
             "px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all animate-pulse",
             activeEvidence.includes('Genomic') ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
          )}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Confidence Level: {activeEvidence.includes('Genomic') ? 'CRITICAL (HIGH)' : 'INTERMEDIATE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bayesian Confidence Distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Bayesian Prior Distribution</h3>
               <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Probabilistic Diagnosis Shift</p>
            </div>
            <div className="flex gap-2">
               {['Phenotype', 'Imaging', 'Genomic', 'Literature'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => handleToggleEvidence(cat)}
                   className={cn(
                     "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95",
                     activeEvidence.includes(cat) 
                       ? "bg-slate-900 border-slate-800 text-white shadow-lg" 
                       : "bg-white border-slate-100 text-slate-400"
                   )}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getAdjustedConfidenceData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ stroke: activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb", strokeWidth: 2 }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0', 
                    fontSize: '10px', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={activeEvidence.includes('Genomic') ? "#10b981" : "#2563eb"} 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baseline Posterior</span>
             </div>
             <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full transition-colors", activeEvidence.includes('Genomic') ? "bg-emerald-500" : "bg-slate-200")} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence-Adjusted Prior</span>
             </div>
          </div>
        </div>

        {/* Evidence Weighting */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col shadow-sm">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Evidence Salience Map</h3>
          <div className="space-y-8 flex-1">
            {evidenceHeatmap.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => handleToggleEvidence(item.category)}
                className="space-y-4 w-full text-left group"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                      activeEvidence.includes(item.category) ? "text-slate-900" : "text-slate-300"
                    )}>{item.category}</span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Information Gain Index</p>
                  </div>
                  <span className={cn(
                    "text-lg font-mono font-black",
                    activeEvidence.includes(item.category) ? "text-slate-900" : "text-slate-200"
                  )}>{activeEvidence.includes(item.category) ? item.score : 0}%</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: activeEvidence.includes(item.category) ? `${item.score}%` : '0%' }}
                    className={cn(
                      "h-full shadow-lg",
                      item.category === 'Phenotype' ? "bg-cyan-500 shadow-cyan-200" :
                      item.category === 'Genomic' ? "bg-emerald-500 shadow-emerald-200" :
                      item.category === 'Imaging' ? "bg-blue-500 shadow-blue-200" :
                      item.category === 'Literature' ? "bg-indigo-500 shadow-indigo-200" :
                      "bg-slate-400"
                    )}
                  />
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-slate-900 rounded-3xl group cursor-pointer hover:bg-slate-800 transition-all border border-slate-700">
             <div className="flex items-center gap-3 mb-4">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Real-time Synthesis</span>
             </div>
             <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tighter italic">
               "{activeEvidence.includes('Genomic') 
                 ? "Genomic confirmation observed. Diagnostic entropy reduced by 64.2%. Output stable."
                 : "Low genomic salience is creating a reasoning gap. Mitochondrial protocol highly recommended."}"
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alternative Hypotheses */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alternative Clinical Paths</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">Diversity Index: 0.82</span>
          </div>
          <div className="space-y-4">
            {[
              { id: 'H1', name: 'Leigh Syndrome', probability: 0.28, reason: 'Incomplete MRI coverage for basal ganglia.', impact: 'High' },
              { id: 'H2', name: 'Pearson Syndrome', probability: 0.12, reason: 'Wait-on lab result for bone marrow aspiration.', impact: 'Medium' },
              { id: 'H3', name: 'Kearns-Sayre', probability: 0.08, reason: 'Triad pattern not strictly fulfilled.', impact: 'Low' },
            ].map(h => (
              <div 
                key={h.id} 
                className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group active:scale-[0.98] shadow-sm"
                onClick={() => toast.info(`Investigating ${h.name}`, { description: `Calculating secondary priors based on ${h.reason}` })}
              >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shadow-sm group-hover:text-indigo-600 transition-colors">
                     {h.id}
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{h.name}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pr-4 leading-tight">{h.reason}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-black text-slate-900">{(h.probability * 100).toFixed(0)}%</span>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">P-VALUE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Evidence Impact */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Entropy Source Analysis</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-56 h-56 group cursor-crosshair">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entropyScores}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {COLORS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <Target className="w-6 h-6 text-slate-200 mb-2" />
                <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase">System Entropy</span>
                <span className="text-2xl font-mono font-black text-slate-900">{entropyScores.reduce((a, b) => a + b.value, 0)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-12 w-full px-8">
              {[
                { label: 'Genomics', val: entropyScores[0].value + '%', color: 'bg-rose-500' },
                { label: 'History', val: entropyScores[1].value + '%', color: 'bg-amber-500' },
                { label: 'Imaging', val: entropyScores[2].value + '%', color: 'bg-emerald-500' },
                { label: 'Clinical', val: entropyScores[3].value + '%', color: 'bg-indigo-500' },
              ].map(i => (
                <div key={i.label} className="flex items-center gap-3 group">
                  <div className={`w-3 h-3 rounded-full ${i.color} shadow-lg shadow-current/20 transition-transform group-hover:scale-125`} />
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em]">{i.label}</span>
                  <span className="text-[11px] text-slate-900 font-mono font-black ml-auto">{i.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
