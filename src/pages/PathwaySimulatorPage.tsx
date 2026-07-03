import { useState, useMemo } from 'react';
import { 
  Zap, 
  Settings2, 
  Play, 
  Pause, 
  RefreshCw,
  Info,
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowRightCircle,
  Dna,
  Activity,
  ChevronUp,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useClinical } from '../context/ClinicalContext';

interface PathwayComponent {
  id: string;
  name: string;
  status: 'normal' | 'disrupted' | 'critical';
  efficiency: number;
  description: string;
}

const mitochondrialPathway: PathwayComponent[] = [
  { id: 'C1', name: 'Complex I', status: 'normal', efficiency: 95, description: 'NADH:ubiquinone oxidoreductase' },
  { id: 'C2', name: 'Complex II', status: 'normal', efficiency: 98, description: 'Succinate dehydrogenase' },
  { id: 'C3', name: 'Complex III', status: 'disrupted', efficiency: 45, description: 'Cytochrome bc1 complex' },
  { id: 'C4', name: 'Complex IV', status: 'critical', efficiency: 12, description: 'Cytochrome c oxidase' },
  { id: 'CV', name: 'ATP Synthase', status: 'disrupted', efficiency: 30, description: 'Complex V' }
];

export default function PathwaySimulatorPage() {
  const { setActivePage } = useClinical();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeComponent, setActiveComponent] = useState<PathwayComponent | null>(mitochondrialPathway[0]);
  const [mutationLoad, setMutationLoad] = useState(75); // Heteroplasmy %
  const [activeDrugs, setActiveDrugs] = useState<string[]>([]);

  const drugs = [
    { id: 'thiamine', name: 'Thiamine', target: 'C1', boost: 15, color: 'text-sky-400' },
    { id: 'coq10', name: 'CoQ10', target: 'C3', boost: 20, color: 'text-amber-400' },
    { id: 'idebenone', name: 'Idebenone', target: 'CV', boost: 25, color: 'text-indigo-400' }
  ];

  const overallEfficiency = useMemo(() => {
    let avg = mitochondrialPathway.reduce((acc, c) => {
      let eff = c.efficiency;
      const drug = drugs.find(d => d.target === c.id && activeDrugs.includes(d.id));
      if (drug) eff += drug.boost;
      return acc + eff;
    }, 0) / mitochondrialPathway.length;
    
    return Math.min(100, Math.max(0, avg - (mutationLoad * 0.5)));
  }, [mutationLoad, activeDrugs]);

  const atpFlux = useMemo(() => overallEfficiency / 100, [overallEfficiency]);
  const rosLeakage = (mutationLoad / 100) * 1.5;

  const toggleDrug = (drugId: string) => {
    setActiveDrugs(prev => prev.includes(drugId) 
      ? prev.filter(id => id !== drugId) 
      : [...prev, drugId]
    );
    toast.info(activeDrugs.includes(drugId) ? 'Therapeutic intervention removed' : 'Therapeutic intervention applied', {
      description: 'Pathway stoichiometry updated in real-time.'
    });
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50 p-12 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-slate-200 flex items-center justify-center border border-slate-100">
             <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Metabolic Flux Simulator</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Mitochondrial Dynamics</p>
          </div>
        </div>
        <div className="flex gap-4">
           {[
             { label: 'ATP Synthesis', val: `${overallEfficiency.toFixed(1)}%`, color: 'text-emerald-500' },
             { label: 'ROS Leakage', val: `${(rosLeakage * 100).toFixed(1)}%`, color: 'text-rose-500' },
             { label: 'H+ Gradient', val: `${(100 - (mutationLoad * 0.5)).toFixed(1)}%`, color: 'text-blue-500' }
           ].map(metric => (
             <div key={metric.label} className="px-6 py-3 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</span>
                <span className={cn("text-lg font-black", metric.color)}>{metric.val}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 pt-12 border-t border-slate-200">
        {/* Visual Flux Model */}
        <div className="col-span-8 space-y-8">
           <div className="relative h-[550px] bg-slate-950 rounded-[60px] border border-slate-800 shadow-2xl overflow-hidden p-12 flex flex-col justify-between">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]" />

              {/* Intermembrane Space */}
              <div className="p-6 bg-blue-500/5 rounded-[32px] border border-blue-500/10 flex items-center justify-between">
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Intermembrane Space [High H+]</span>
                 <div className="flex gap-1">
                    {isPlaying && Array.from({ length: 30 }).map((_, i) => (
                       <motion.div 
                         key={i}
                         animate={{ 
                            y: [0, 400],
                            opacity: [0, 1, 0],
                            x: [0, Math.random() * 40 - 20]
                         }}
                         transition={{ 
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                         }}
                         className="w-1 h-1 rounded-full bg-blue-400/60 shadow-[0_0_8px_#60a5fa]"
                       />
                    ))}
                 </div>
              </div>

              {/* Respiratory Chain */}
              <div className="flex justify-around items-center h-48 relative">
                 {mitochondrialPathway.map((step, idx) => (
                    <div key={step.id} className="relative group">
                       <motion.div 
                         onClick={() => setActiveComponent(step)}
                         animate={{ 
                           scale: activeComponent?.id === step.id ? 1.1 : 1,
                           borderColor: activeComponent?.id === step.id ? '#3b82f6' : (mutationLoad > 60 ? '#f43f5e' : '#1e293b')
                         }}
                         className="w-24 h-32 bg-slate-900/80 backdrop-blur-xl rounded-2xl border-2 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:border-blue-500/50 transition-all"
                       >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border",
                            step.status === 'normal' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            step.status === 'disrupted' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )}>
                             <span className="text-[11px] font-black">{step.id}</span>
                          </div>
                          <span className="text-[8px] font-black text-slate-500 uppercase text-center px-2">{step.name}</span>
                       </motion.div>
                       
                       {/* Flux Effect */}
                       <AnimatePresence>
                          {isPlaying && overallEfficiency > 30 && (
                             <motion.div 
                               initial={{ y: 20, opacity: 0 }}
                               animate={{ y: -60, opacity: [0, 1, 0] }}
                               transition={{ duration: 1, repeat: Infinity, delay: idx * 0.2 }}
                               className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                             >
                                <ChevronUp className="w-5 h-5 text-blue-400/40" />
                             </motion.div>
                          )}
                       </AnimatePresence>

                       {/* Leakage Effect */}
                       {mutationLoad > 50 && isPlaying && (
                          <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -bottom-4 right-0"
                          >
                             <Zap className="w-4 h-4 text-rose-500/30 blur-[1px]" />
                          </motion.div>
                       )}
                    </div>
                 ))}
              </div>

              {/* Matrix */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mitochondrial Matrix (ATP Synthesis Pool)</span>
                    <div className="flex gap-2">
                       {isPlaying && Array.from({ length: Math.floor(atpFlux * 20) }).map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase"
                          >
                             ATP
                          </motion.div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-8 flex gap-3 z-10">
                 <button 
                   onClick={() => setIsPlaying(!isPlaying)}
                   className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
                 >
                   {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                 </button>
                 <div className="h-12 px-6 bg-slate-950 border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Mutation Load</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={mutationLoad}
                      onChange={(e) => setMutationLoad(parseInt(e.target.value))}
                      className="w-32 accent-rose-500"
                    />
                    <span className="text-sm font-black text-white w-8 text-center">{mutationLoad}%</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-white border border-slate-200 rounded-[40px] flex items-start gap-6 group hover:border-blue-200 transition-all">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                    <Shield className="w-7 h-7" />
                 </div>
                 <div className="space-y-4 flex-1">
                    <div>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Therapeutic Response</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Active Countermeasures</p>
                    </div>
                    <div className="flex gap-2">
                       {drugs.map(drug => (
                         <button
                           key={drug.id}
                           onClick={() => toggleDrug(drug.id)}
                           className={cn(
                             "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                             activeDrugs.includes(drug.id) 
                               ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
                               : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                           )}
                         >
                           {drug.name}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-[40px] flex items-start gap-6 group hover:border-rose-200 transition-all">
                 <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                    <ShieldAlert className="w-7 h-7" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Clinical Risks</h4>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                       {mutationLoad > 60 
                         ? "High burden detected. ROS generation exceeding cellular cleanup capacity. Risk of immediate ATP depletion."
                         : "Operational efficiency within tolerable limits for sub-clinical mutation burden."}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Info Panel */}
        <div className="col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                 <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white">
                    <Dna className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Component Analysis</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enzyme Status Invariant</p>
                 </div>
              </div>

              {activeComponent ? (
                <div className="space-y-8">
                   <div className="space-y-2">
                      <div className={cn(
                         "inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                         activeComponent.status === 'normal' ? "bg-emerald-50 text-emerald-600" :
                         activeComponent.status === 'disrupted' ? "bg-amber-50 text-amber-600" :
                         "bg-rose-50 text-rose-600"
                      )}>
                         Status: {activeComponent.status}
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{activeComponent.name}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{activeComponent.description}</p>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Rating</span>
                         <span className="text-xs font-black text-slate-900">
                           {Math.max(0, activeComponent.efficiency - (mutationLoad * 0.4)).toFixed(1)}%
                         </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.max(0, activeComponent.efficiency - (mutationLoad * 0.4))}%` }}
                           className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              activeComponent.status === 'normal' ? "bg-emerald-500" :
                              activeComponent.status === 'disrupted' ? "bg-amber-500" : "bg-rose-500"
                           )}
                         />
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-[11px] text-slate-500 leading-relaxed">
                      "Bioenergetic simulations suggest that mutations at this locus disrupt the assembly of the respiratorysome superstructure."
                   </div>

                   <button 
                     onClick={() => setActivePage('genomics')}
                     className="w-full flex items-center justify-between px-8 py-5 bg-slate-900 text-white rounded-2xl group hover:bg-slate-800 transition-all active:scale-[0.98] mt-10"
                   >
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Map to Variants</span>
                      <ArrowRightCircle className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-all" />
                   </button>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 opacity-30">
                   <RefreshCw className="w-12 h-12 text-slate-400 mx-auto" />
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Select a complex to inspect mechanics</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
