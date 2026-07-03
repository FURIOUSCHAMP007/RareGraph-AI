import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Tooltip 
} from 'recharts';
import { ShieldCheck, Crosshair } from 'lucide-react';
import { useClinical } from '../context/ClinicalContext';
import { cn } from '../lib/utils';

export default function RiskRadar() {
  const { mutationLoad = 75, hpoTerms } = useClinical();

  const data = useMemo(() => {
    // Generate risk based on Phenotypes + Mutation Burden
    const base = mutationLoad / 100;
    return [
      { subject: 'Neurological', A: Math.min(100, Math.floor((base * 80) + (hpoTerms.length * 5))), fullMark: 100 },
      { subject: 'Metabolic', A: Math.min(100, Math.floor((base * 95))), fullMark: 100 },
      { subject: 'Cardiac', A: Math.min(100, Math.floor((base * 40))), fullMark: 100 },
      { subject: 'Muscular', A: Math.min(100, Math.floor((base * 70))), fullMark: 100 },
      { subject: 'Renal', A: Math.min(100, Math.floor((base * 20))), fullMark: 100 },
      { subject: 'Ophthalmology', A: Math.min(100, Math.floor((base * 50))), fullMark: 100 },
    ];
  }, [mutationLoad, hpoTerms]);

  return (
    <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-6">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
               <Crosshair className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Phenotypic Risk Radar</h3>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Multi-System Burden Analysis</p>
            </div>
         </div>
         <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100">
            <ShieldCheck className="w-3 h-3" /> System Guard Active
         </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Clinical Burden"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full mt-6">
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[18px] font-black text-slate-900">{(data.reduce((acc, v) => acc + v.A, 0) / 6).toFixed(0)}</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Mean System Score</p>
         </div>
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-[18px] font-black text-rose-500">{Math.max(...data.map(v => v.A))}</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Peak Critical Risk</p>
         </div>
      </div>
    </div>
  );
}
