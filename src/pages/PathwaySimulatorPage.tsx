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
  Shield,
  Eye,
  Heart,
  Brain,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useClinical } from '../context/ClinicalContext';

interface PathwayComponent {
  id: string;
  name: string;
  pdbId: string;
  status: 'normal' | 'disrupted' | 'critical';
  efficiency: number;
  description: string;
  residues: string;
  deltaG: number;
  rmsd: number;
  disruptions: number;
  ribbonD: string; // SVG path representation for protein ribbon
}

const mitochondrialPathway: PathwayComponent[] = [
  { 
    id: 'C1', 
    name: 'Complex I', 
    pdbId: '7P6D',
    status: 'normal', 
    efficiency: 95, 
    description: 'NADH:ubiquinone oxidoreductase',
    residues: 'Glu-247, Arg-143, His-98',
    deltaG: 4.85,
    rmsd: 1.84,
    disruptions: 4,
    ribbonD: 'M 10 70 Q 25 20, 40 70 T 70 70 T 100 30 T 130 90 T 160 50 T 190 80'
  },
  { 
    id: 'C2', 
    name: 'Complex II', 
    pdbId: '1ZOY',
    status: 'normal', 
    efficiency: 98, 
    description: 'Succinate dehydrogenase',
    residues: 'Asp-42, Val-118, Gly-210',
    deltaG: 1.12,
    rmsd: 0.42,
    disruptions: 0,
    ribbonD: 'M 10 50 Q 30 90, 50 30 T 90 60 T 130 20 T 170 80 T 190 40'
  },
  { 
    id: 'C3', 
    name: 'Complex III', 
    pdbId: '6T0B',
    status: 'disrupted', 
    efficiency: 45, 
    description: 'Cytochrome bc1 complex',
    residues: 'Lys-192, Tyr-84, Thr-156',
    deltaG: 6.92,
    rmsd: 2.15,
    disruptions: 6,
    ribbonD: 'M 10 30 Q 40 80, 70 10 T 130 50 T 160 90 T 190 20'
  },
  { 
    id: 'C4', 
    name: 'Complex IV', 
    pdbId: '5Z62',
    status: 'critical', 
    efficiency: 12, 
    description: 'Cytochrome c oxidase',
    residues: 'Trp-104, Ser-215, Cys-321',
    deltaG: 12.4,
    rmsd: 4.56,
    disruptions: 11,
    ribbonD: 'M 10 80 Q 30 10, 60 90 T 110 20 T 150 90 T 190 10'
  },
  { 
    id: 'CV', 
    name: 'ATP Synthase', 
    pdbId: '6CP7',
    status: 'disrupted', 
    efficiency: 30, 
    description: 'Complex V',
    residues: 'Asn-152, Gln-88, Phe-112',
    deltaG: 8.76,
    rmsd: 2.98,
    disruptions: 8,
    ribbonD: 'M 10 40 Q 50 10, 90 90 T 130 10 T 170 90 T 190 50'
  }
];

export default function PathwaySimulatorPage() {
  const { setActivePage } = useClinical();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeComponent, setActiveComponent] = useState<PathwayComponent | null>(mitochondrialPathway[0]);
  const [mutationLoad, setMutationLoad] = useState(75); // Heteroplasmy %
  const [activeDrugs, setActiveDrugs] = useState<string[]>([]);
  const [activeProteinRot, setActiveProteinRot] = useState(0);

  // Bayesian priors and clinical assays
  const [maternalInheritance, setMaternalInheritance] = useState(true);
  const [serumLactate, setSerumLactate] = useState(true);
  const [raggedRedFibers, setRaggedRedFibers] = useState(false);
  const [acmgClass, setAcmgClass] = useState<'pathogenic' | 'vus' | 'benign'>('pathogenic');

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

  // Bayesian Posterior computation
  const bayesianPosterior = useMemo(() => {
    const priorProb = Math.max(0.01, Math.min(0.99, mutationLoad / 100));
    const priorOdds = priorProb / (1 - priorProb);
    
    const lrMaternal = maternalInheritance ? 3.5 : 0.4;
    const lrLactate = serumLactate ? 4.0 : 0.25;
    const lrBiopsy = raggedRedFibers ? 6.0 : 0.3;
    const lrAcmg = acmgClass === 'pathogenic' ? 8.0 : acmgClass === 'vus' ? 1.0 : 0.1;
    
    const postOdds = priorOdds * lrMaternal * lrLactate * lrBiopsy * lrAcmg;
    const postProb = postOdds / (1 + postOdds);
    
    return postProb * 100;
  }, [mutationLoad, maternalInheritance, serumLactate, raggedRedFibers, acmgClass]);

  // Digital Twin calculation based on mutation load, active therapies, and bayesian posterior
  const twinMetrics = useMemo(() => {
    const scale = mutationLoad / 100;
    const therapyOffset = activeDrugs.length * 0.15;
    const posteriorFactor = bayesianPosterior / 100;
    
    return {
      brain: Math.min(100, Math.max(10, 98 - (scale * 45) - (posteriorFactor * 25) + (therapyOffset * 100))),
      heart: Math.min(100, Math.max(15, 96 - (scale * 40) - (posteriorFactor * 20) + (therapyOffset * 100))),
      muscle: Math.min(100, Math.max(5, 94 - (scale * 55) - (posteriorFactor * 30) + (therapyOffset * 100))),
      hearing: Math.min(100, Math.max(20, 92 - (scale * 30) - (posteriorFactor * 15) + (therapyOffset * 60)))
    };
  }, [mutationLoad, activeDrugs, bayesianPosterior]);

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50 p-12 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-slate-200 flex items-center justify-center border border-slate-100">
             <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Metabolic Flux & Digital Twin Simulator</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Mitochondrial Dynamics & Patient Twin Modeling</p>
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

           {/* Patient Digital Twin Panel (Feature 9) */}
           <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                 <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Patient Digital Twin Phenotype Mapper</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Organ-Specific Metabolic Failure Probabilities</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {[
                   { label: 'Neurological (Cerebral)', val: twinMetrics.brain, icon: Brain, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                   { label: 'Cardiovascular (Cardiac)', val: twinMetrics.heart, icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-100' },
                   { label: 'Skeletal Myopathy', val: twinMetrics.muscle, icon: Activity, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                   { label: 'Auditory Deficit', val: twinMetrics.hearing, icon: Eye, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' }
                 ].map((organ, i) => (
                   <div key={i} className="p-5 border border-slate-200 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                         <div className={cn("p-2 rounded-xl border", organ.color)}>
                            <organ.icon className="w-4 h-4" />
                         </div>
                         <span className={cn(
                           "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                           organ.val > 70 ? "bg-emerald-50 text-emerald-600" :
                           organ.val > 40 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                         )}>
                            {organ.val > 70 ? "Functional" : organ.val > 40 ? "Impaired" : "Critical"}
                         </span>
                      </div>
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{organ.label}</span>
                         <div className="flex items-end justify-between">
                            <span className="text-xl font-black text-slate-900">{organ.val.toFixed(0)}%</span>
                            <span className="text-[8px] font-mono font-bold text-slate-400 mb-0.5">VIABILITY</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                            <div className={cn(
                              "h-full rounded-full transition-all duration-700",
                              organ.val > 70 ? "bg-emerald-500" : organ.val > 40 ? "bg-amber-500" : "bg-rose-500"
                            )} style={{ width: `${organ.val}%` }} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Bayesian Network Panel (Feature 9) */}
           <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <div>
                       <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Bayesian Clinical Decision Panel</h3>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Real-Time Posterior Odds & Prior Belief Fusion</p>
                    </div>
                 </div>
                 <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-100">
                    Active Bayesian Inference
                 </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Left Column: Toggles & Dropdown */}
                 <div className="space-y-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Clinical Priors & Assays</span>
                    
                    <div className="space-y-3">
                       {/* Maternal Inheritance */}
                       <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div>
                             <span className="text-[10px] font-black text-slate-900 uppercase block">Maternal Pedigree Link</span>
                             <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Prior evidence of matrilineal inheritance (LR: 3.5x)</span>
                          </div>
                          <button
                            onClick={() => setMaternalInheritance(!maternalInheritance)}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer",
                              maternalInheritance ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
                            )}
                          >
                             <span className="w-4 h-4 rounded-full bg-white shadow mx-1" />
                          </button>
                       </div>

                       {/* Elevated Serum/CSF Lactate */}
                       <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div>
                             <span className="text-[10px] font-black text-slate-900 uppercase block">Elevated Serum/CSF Lactate</span>
                             <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Biochemical indicator of metabolic stress (LR: 4.0x)</span>
                          </div>
                          <button
                            onClick={() => setSerumLactate(!serumLactate)}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer",
                              serumLactate ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
                            )}
                          >
                             <span className="w-4 h-4 rounded-full bg-white shadow mx-1" />
                          </button>
                       </div>

                       {/* Ragged Red Fibers */}
                       <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div>
                             <span className="text-[10px] font-black text-slate-900 uppercase block">Ragged Red Fibers on Biopsy</span>
                             <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Histological muscle biopsy confirmation (LR: 6.0x)</span>
                          </div>
                          <button
                            onClick={() => setRaggedRedFibers(!raggedRedFibers)}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer",
                              raggedRedFibers ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
                            )}
                          >
                             <span className="w-4 h-4 rounded-full bg-white shadow mx-1" />
                          </button>
                       </div>

                       {/* ACMG Pathogenicity */}
                       <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                             <div>
                                <span className="text-[10px] font-black text-slate-900 uppercase block">ACMG Variant Pathology</span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Target variant pathogenicity level (LR: up to 8.0x)</span>
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                             {(['pathogenic', 'vus', 'benign'] as const).map((lvl) => (
                                <button
                                  key={lvl}
                                  onClick={() => setAcmgClass(lvl)}
                                  className={cn(
                                    "py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                                    acmgClass === lvl 
                                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                  )}
                                >
                                   {lvl}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Probabilities Display & Node Map */}
                 <div className="flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Probability Convergence</span>
                       
                       <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-3xl space-y-4">
                          {/* Prior Slider Reference */}
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Heteroplasmy Prior Probability</span>
                             <span className="text-xs font-mono font-black text-slate-700">{(mutationLoad).toFixed(0)}%</span>
                          </div>

                          {/* Posterior */}
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                             <div className="flex items-end justify-between">
                                <div>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Bayesian Posterior Probability</span>
                                   <span className="text-xs text-slate-500 font-bold uppercase">Mitochondrial Cytopathy Belief</span>
                                </div>
                                <span className={cn(
                                   "text-2xl font-black",
                                   bayesianPosterior > 80 ? "text-rose-600" :
                                   bayesianPosterior > 40 ? "text-amber-500" : "text-emerald-500"
                                )}>
                                   {bayesianPosterior.toFixed(1)}%
                                </span>
                             </div>
                             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    bayesianPosterior > 80 ? "bg-rose-500" :
                                    bayesianPosterior > 40 ? "bg-amber-500" : "bg-emerald-500"
                                  )} 
                                  style={{ width: `${bayesianPosterior}%` }}
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Belief Flow Diagram */}
                    <div className="p-4 bg-slate-900 rounded-3xl space-y-3 font-mono text-[9px] text-slate-300">
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Active Inference Network Graph</span>
                       
                       <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <div className="text-center flex-1">
                             <span className="text-slate-500 block">PRIOR</span>
                             <span className="text-white font-black">{mutationLoad}%</span>
                          </div>
                          <span className="text-slate-600">→</span>
                          <div className="text-center flex-1">
                             <span className="text-slate-500 block">LR PRODUCT</span>
                             <span className="text-indigo-400 font-black">
                                {((maternalInheritance ? 3.5 : 0.4) * (serumLactate ? 4.0 : 0.25) * (raggedRedFibers ? 6.0 : 0.3) * (acmgClass === 'pathogenic' ? 8.0 : acmgClass === 'vus' ? 1.0 : 0.1)).toFixed(2)}x
                             </span>
                          </div>
                          <span className="text-slate-600">→</span>
                          <div className="text-center flex-1">
                             <span className="text-slate-500 block">POSTERIOR</span>
                             <span className="text-emerald-400 font-black">{bayesianPosterior.toFixed(0)}%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Info & Protein Structure Panel */}
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

                   {/* Protein Structure Modeler Segment (Feature 7) */}
                   <div className="space-y-4 border-t border-slate-100 pt-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3D Protein Structure Modeler</h4>
                         <span className="text-[8px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">PDB: {activeComponent.pdbId}</span>
                      </div>

                      {/* Interactive Ribbon Visualization */}
                      <div 
                        className="h-44 bg-slate-950 rounded-2xl relative border border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer group"
                        onClick={() => {
                          setActiveProteinRot(prev => prev + 45);
                          toast.info('Protein structures rotated', { description: `Visualizing structural residue changes on PDB ${activeComponent.pdbId}.` });
                        }}
                      >
                         <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
                         <span className="absolute top-2.5 left-3 text-[7px] font-mono font-black text-white/40 uppercase tracking-widest">Interactive Ribbon View (Click to rotate)</span>
                         
                         <motion.svg 
                           animate={{ rotate: activeProteinRot }}
                           transition={{ type: 'spring', stiffness: 60 }}
                           className="w-full h-full p-4" 
                           viewBox="0 0 200 100"
                         >
                            {/* Helix Ribbon paths */}
                            <path d={activeComponent.ribbonD} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" opacity={0.3} />
                            <path d={activeComponent.ribbonD} fill="none" stroke="#2563eb" strokeWidth={1} strokeLinecap="round" />
                            
                            {/* Mutation locus */}
                            <motion.circle 
                              cx="100" 
                              cy="30" 
                              r={mutationLoad > 50 ? 5 : 3} 
                              fill={mutationLoad > 50 ? '#f43f5e' : '#10b981'} 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            
                            {/* Alpha fold predictions */}
                            <line x1="100" y1="30" x2="130" y2="70" stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" opacity={0.8} />
                            <circle cx="130" cy="70" r="2" fill="#f59e0b" />
                         </motion.svg>
                         <div className="absolute bottom-2.5 right-3 text-[7px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                            {mutationLoad > 50 ? '● Mutated Residue Highlighted' : '● Structurally Wild-Type'}
                         </div>
                      </div>

                      {/* Structure Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">AlphaFold ΔΔG</span>
                            <span className="text-xs font-mono font-black text-slate-800">
                              +{ (activeComponent.deltaG * (mutationLoad / 100)).toFixed(2) } kcal/mol
                            </span>
                         </div>
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">In-Silico RMSD</span>
                            <span className="text-xs font-mono font-black text-slate-800">
                              { (activeComponent.rmsd * (mutationLoad / 100)).toFixed(2) } Å
                            </span>
                         </div>
                      </div>

                      <div className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-center">
                         Target Loci: <strong className="text-slate-600">{activeComponent.residues}</strong>
                      </div>
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

