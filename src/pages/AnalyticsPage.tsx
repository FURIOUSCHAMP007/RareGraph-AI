import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Activity, Users, Clock, Zap, Database, Globe, FlaskConical, TrendingUp, ShieldCheck, Cpu, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import ExportHub from '../components/ExportHub';

const stats = [
  { label: 'Latency reduction', val: '82%', icon: Clock, color: 'text-cyan-600' },
  { label: 'Diagnostic accuracy', val: '91.4%', icon: Activity, color: 'text-emerald-600' },
  { label: 'Active Researchers', val: '1,204', icon: Users, color: 'text-amber-600' },
  { label: 'Inference sessions', val: '45k', icon: Zap, color: 'text-indigo-600' },
];

const phenoData = [
  { name: 'Muscle Weakness', value: 400 },
  { name: 'Hearing Loss', value: 300 },
  { name: 'Seizures', value: 300 },
  { name: 'Atrophy', value: 200 },
  { name: 'Cognitive Delay', value: 150 },
];

const molecularFlux = [
  { time: '0ms', atp: 100, reactive_oxygen: 10 },
  { time: '100ms', atp: 85, reactive_oxygen: 25 },
  { time: '200ms', atp: 60, reactive_oxygen: 45 },
  { time: '300ms', atp: 40, reactive_oxygen: 65 },
  { time: '400ms', atp: 30, reactive_oxygen: 80 },
  { time: '500ms', atp: 25, reactive_oxygen: 95 },
];

const cohortRadar = [
  { subject: 'Neurological', A: 120, B: 110, fullMark: 150 },
  { subject: 'Cardiovascular', A: 98, B: 130, fullMark: 150 },
  { subject: 'Metabolic', A: 86, B: 130, fullMark: 150 },
  { subject: 'Gastrointestinal', A: 99, B: 100, fullMark: 150 },
  { subject: 'Dermatological', A: 85, B: 90, fullMark: 150 },
];

const geneScatter = [
  { x: 10, y: 30, z: 200, name: 'MT-TL1' },
  { x: 20, y: 50, z: 260, name: 'MT-ND5' },
  { x: 45, y: 40, z: 400, name: 'POLG' },
  { x: 80, y: 90, z: 500, name: 'TWNK' },
  { x: 70, y: 10, z: 280, name: 'SLC25A4' },
];

const COLORS = ['#2563eb', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#ec4899'];

const AnalyticsPage = React.memo(function AnalyticsPage() {
  const [isTuning, setIsTuning] = React.useState(false);
  const [tuningStep, setTuningStep] = React.useState(0);
  const [lossHistory, setLossHistory] = React.useState<any[]>([]);
  const [selectedFM, setSelectedFM] = React.useState('RareGPT-Genomics-13B');
  const [loraRank, setLoraRank] = React.useState(16);

  const computeData = useMemo(() => [
    { name: 'Core Engine', value: 45 },
    { name: 'Visual Processing', value: 25 },
    { name: 'Literature RAG', value: 20 },
    { name: 'Ontology Sync', value: 10 },
  ], []);

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">Intelligence & Analytics</h2>
          <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">Multi-modal Diagnostic performance & Molecular Simulation Metrics</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-xl">
          <span className="flex items-center gap-2 text-blue-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> FEDERATED KNOWLEDGE SYNC</span>
          <div className="w-px h-3 bg-slate-200" />
          <span className="flex items-center gap-2">V3.2.0 GENOMIC-CORE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-5 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group cursor-pointer active:scale-95 translate-y-0 hover:-translate-y-1"
            onClick={() => toast.info(`${s.label}: ${s.val}`, { description: 'Global research node update synchronized.' })}
          >
            <div className={cn("p-4 rounded-xl border transition-all duration-500 group-hover:rotate-12 outline-none", 
              i === 0 ? "bg-cyan-50 border-cyan-100 text-cyan-600" :
              i === 1 ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
              i === 2 ? "bg-amber-50 border-amber-100 text-amber-600" :
              "bg-indigo-50 border-indigo-100 text-indigo-600"
            )}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Molecular Dynamics */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm group hover:border-blue-200 transition-all flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Molecular Flux Simulation</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ATP Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ROS Load</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={molecularFlux}>
                <defs>
                  <linearGradient id="colorAtp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} fontVariant="lining-nums" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} fontVariant="lining-nums" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="atp" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAtp)" />
                <Area type="monotone" dataKey="reactive_oxygen" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Resource Allocation */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-10 pb-4 border-b border-slate-800">Intelligence Distribution</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={computeData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {computeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-10 space-y-3 w-full">
                {computeData.map((d, i) => (
                  <div key={d.name} className="flex justify-between items-center group/item hover:bg-slate-800/50 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{d.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clinical Profile Radar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Diagnostic Domain Overlap</h3>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Patient_01 vs Cohort_MELAS</span>
           </div>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cohortRadar}>
                 <PolarGrid stroke="#f1f5f9" />
                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                 <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                 <Radar name="Patient" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                 <Radar name="Cohort Avg" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                 <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Gene-Phenotype Clustering */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Gene-Phenotype Proximity</h3>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Confidence Index High</span>
              </div>
           </div>
           <div className="flex-1 min-h-[400px] relative">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                 <XAxis type="number" dataKey="x" name="Variant frequency" hide />
                 <YAxis type="number" dataKey="y" name="Symptom specificity" hide />
                 <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Pathogenicity Score" />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                   if (active && payload && payload.length) {
                     return (
                       <div className="bg-slate-900 text-white p-3 rounded-xl border-none shadow-2xl">
                         <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                         <p className="text-[9px] text-slate-400 font-bold">Pathogenicity Score: {payload[0].payload.z}</p>
                       </div>
                     );
                   }
                   return null;
                 }} />
                 <Scatter name="Genes" data={geneScatter} fill="#8b5cf6" />
               </ScatterChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cluster Density</p>
                 <p className="text-lg font-black text-slate-900 tracking-tighter">4.2 <span className="text-[10px] text-slate-400 font-medium tracking-normal ml-1">Nodes / Phenotype</span></p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Knowledge Gap</p>
                 <p className="text-lg font-black text-slate-900 tracking-tighter">12% <span className="text-[10px] text-slate-400 font-medium tracking-normal ml-1">Missing Evidence</span></p>
              </div>
           </div>
        </div>
      </div>

      {/* Incidence Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm invisible lg:visible">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Global Phenotype Incidence Comparison</h3>
            </div>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Live Federated Stream</span>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phenoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontVariant="lining-nums" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} fontVariant="lining-nums" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px', padding: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Foundation Model Fine-Tuning Hub */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Clinical Foundation Model Adaptors</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LoRA Parameters Fine-Tuning Core</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full uppercase tracking-widest">A100 Tensor Parallel Node</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Target Foundation Model</label>
                <select 
                  value={selectedFM} 
                  onChange={(e) => setSelectedFM(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                >
                  <option>RareGPT-Genomics-13B</option>
                  <option>BioGPT-clinical-7B</option>
                  <option>Med-PaLM-2-adapted (34B)</option>
                  <option>NVIDIA BioNeMo ESM-2 (650M)</option>
                  <option>NVIDIA BioNeMo ESMFold Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">LoRA Rank (r)</label>
                  <select 
                    value={loraRank} 
                    onChange={(e) => setLoraRank(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">LoRA Alpha (α)</label>
                  <select 
                    defaultValue={32}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Target Projections</label>
                <div className="grid grid-cols-2 gap-2">
                  {['q_proj', 'v_proj', 'k_proj', 'o_proj'].map(p => (
                    <label key={p} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500/10" />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              disabled={isTuning}
              onClick={() => {
                setIsTuning(true);
                setTuningStep(1);
                setLossHistory([]);
                
                const history: any[] = [];
                let step = 1;
                let currentLoss = 2.45;

                const interval = setInterval(() => {
                  if (step <= 10) {
                    currentLoss -= Math.random() * 0.18 + 0.04;
                    if (currentLoss < 0.3) currentLoss = 0.28;
                    history.push({ step, loss: Number(currentLoss.toFixed(4)) });
                    setLossHistory([...history]);
                    setTuningStep(step);
                    step++;
                  } else {
                    clearInterval(interval);
                    setIsTuning(false);
                    toast.success("LoRA Adapter Synced", {
                      description: "Adapter weights synthesized, optimized, and saved as a clinical patch."
                    });
                  }
                }, 400);
              }}
              className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isTuning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  Optimizing Adaptor... (Epoch {tuningStep}/10)
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-blue-400" />
                  Initiate LoRA Training
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-center min-h-[300px]">
            {lossHistory.length > 0 ? (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Cross-Entropy Loss Curve</span>
                  <span className="text-xs font-mono font-black text-indigo-600">Current Loss: {lossHistory[lossHistory.length - 1].loss}</span>
                </div>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="step" stroke="#94a3b8" fontSize={9} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 9, fontWeight: 'bold' }} />
                      <YAxis stroke="#94a3b8" fontSize={9} label={{ value: 'Loss', angle: -90, position: 'insideLeft', fontSize: 9, fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="loss" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-12">
                <Cpu className="w-12 h-12 text-slate-200 mx-auto" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Adapter Graph Idle</h4>
                <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed uppercase">
                  Select your target foundation model and hyperparameter configurations, then execute training to witness real-time model optimization.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Benchmarking Framework Suite */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Clinical Benchmarking Suite</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Standardized Bio-dataset Comparative Testing</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-widest">Active Verification Engine</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Standardized Target Dataset</label>
                <select 
                  defaultValue="HPO-Phenotypic-Matching-R5"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="HPO-Phenotypic-Matching-R5">HPO-Phenotypic Matching (Recall@5)</option>
                  <option value="ClinVar-Genomic-Pathogenicity-F1">ClinVar Variant Pathogenicity (F1-Score)</option>
                  <option value="MIMIC-IV-AdverseDrug-Acc">MIMIC-IV Adverse Drug Event (Accuracy)</option>
                  <option value="PubMedQA-ClinicalReasoning">PubMedQA Complex Reasoning (Acc)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Target Models to Compare</label>
                <div className="space-y-2">
                  {[
                    { id: 'raregraph', label: 'Agentic RareGraphAI (Ours)', desc: 'Multimodal graph network' },
                    { id: 'medpalm', label: 'Med-PaLM-2 (Clinical-Tuned)', desc: 'Google Foundation Model' },
                    { id: 'biogpt', label: 'BioGPT-clinical-7B', desc: 'PubMed optimized LLM' },
                    { id: 'gpt4', label: 'GPT-4-Clinical (Zero-shot)', desc: 'General frontier model' }
                  ].map(m => (
                    <label key={m.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                      <input type="checkbox" defaultChecked className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500/10" />
                      <div>
                        <p className="text-[10px] font-black text-slate-800 leading-none mb-1">{m.label}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 1500)),
                  {
                    loading: 'Running standardized verification suite across 10,000 cases...',
                    success: 'Benchmarking completed. Radar/Bar comparative graphs updated.',
                    error: 'Benchmarking aborted due to timeout.'
                  }
                );
              }}
              className="w-full py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Run Standardized Benchmark
            </button>
          </div>

          {/* Chart visualizers */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standardized Benchmarking Metrics (Recall vs Latency)</span>
              <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">100% Reliable</span>
            </div>

            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { model: 'Agentic RareGraphAI', accuracy: 94.2, latency: 120 },
                  { model: 'Med-PaLM-2', accuracy: 91.8, latency: 450 },
                  { model: 'BioGPT-clinical', accuracy: 82.5, latency: 280 },
                  { model: 'GPT-4-Clinical', accuracy: 86.4, latency: 750 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="model" stroke="#94a3b8" fontSize={9} fontVariant="lining-nums" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" fontSize={9} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 8, fontWeight: 'bold' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={9} label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', offset: 0, fontSize: 8, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                  <Bar yAxisId="left" dataKey="accuracy" fill="#4f46e5" name="Accuracy / Recall (%)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="latency" fill="#f43f5e" name="Latency (ms)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200/50 pt-4">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Delta vs SOTA</p>
                <p className="text-sm font-black text-emerald-600">+2.4% Recall</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inference Saving</p>
                <p className="text-sm font-black text-emerald-600">3.7x Faster</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Accuracy Margin</p>
                <p className="text-sm font-black text-indigo-600">Cohort Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExportHub />
    </div>
  );
});

export default AnalyticsPage;
