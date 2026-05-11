import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

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
];

const accuracyHistory = [
  { month: 'Jan', val: 78 },
  { month: 'Feb', val: 81 },
  { month: 'Mar', val: 84 },
  { month: 'Apr', val: 88 },
  { month: 'May', val: 91 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];

export default function AnalyticsPage() {
  const computeData = [
    { name: 'Core Engine', value: 45 },
    { name: 'Visual Processing', value: 25 },
    { name: 'Literature RAG', value: 20 },
    { name: 'Ontology Sync', value: 10 },
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">Research Analytics Dashboard</h2>
          <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">Global Inference Statistics & System Performance</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> LIVE FEDERATED SYNC</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> V1.0.4 CORE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="p-6 bg-white border border-slate-200 rounded-lg flex items-center gap-5 shadow-sm hover:border-blue-200 transition-all group cursor-pointer active:scale-95"
            onClick={() => toast.info(`${s.label}: ${s.val}`, { description: 'Global research node update synchronized.' })}
          >
            <div className={cn("p-3 bg-slate-50 rounded border border-slate-100 group-hover:scale-110 transition-transform", s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tight">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phenotype Frequency */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phenotype Incidence (Global Federated)</h3>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">P-value &lt; 0.001</span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phenoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compute Load */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-2">Resource Allocation</h3>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={computeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {computeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-8 space-y-2 w-full">
                {computeData.map((d, i) => (
                  <div key={d.name} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-slate-500">{d.name}</span>
                    </div>
                    <span className="text-slate-900 font-black">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Model Accuracy Over Time */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-lg p-8 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-2">Diagnostic Inference Accuracy</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 flex justify-between items-center px-4">
             <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-600" />
                 <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Model Precision</span>
               </div>
             </div>
             <p className="text-[9px] text-slate-400 italic font-bold">P-value &lt; 0.001 (In-situ validation)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
