import { 
  ArrowRight, Activity, Share2, BookOpen, ShieldCheck, Zap, Database, 
  Globe, ChevronRight, Binary, Microscope, Network, Clock, Sparkles, 
  Dna, Fingerprint, BrainCircuit, Cpu, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function HomePage({ onStart }: { onStart: () => void }) {
  const features = [
    {
      title: "Phenotype Extraction",
      desc: "Automated mapping of clinical notes to Human Phenotype Ontology (HPO) terms using Gemini Vision and Text.",
      icon: Activity,
      color: "text-cyan-400"
    },
    {
      title: "Cognitive Inference",
      desc: "Explainable AI reasoning chains that simulate expert diagnostic logic for rare genetic conditions.",
      icon: Zap,
      color: "text-amber-400"
    },
    {
      title: "Graph Visualization",
      desc: "Interactive D3-powered exploration of symptom-to-gene-to-disease network connections.",
      icon: Share2,
      color: "text-emerald-400"
    },
    {
      title: "Research Grounding",
      desc: "Live summarization of PubMed literature relevant to the identified phenotype patterns.",
      icon: BookOpen,
      color: "text-blue-400"
    }
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-8 lg:p-16">
        {/* Ticker Backdrop */}
        <div className="absolute top-0 left-0 w-full overflow-hidden bg-blue-50 border-b border-slate-200/50 py-1">
          <div className="flex animate-marquee whitespace-nowrap gap-12 text-[8px] font-black uppercase text-blue-600/40 tracking-[0.4em]">
            <span>Active Reasoning: MT-TL1 Pathway</span>
            <span>Grounding: PubMed Central v4.2</span>
            <span>Ontology: HPO 2024-R3</span>
            <span>Active Reasoning: MT-TL1 Pathway</span>
            <span>Grounding: PubMed Central v4.2</span>
            <span>Ontology: HPO 2024-R3</span>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Research-Grade Clinical Protocol
          </motion.div>
          <h1 className="text-4xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1] uppercase">
            Computational <br/> Reasoning for <span className="text-blue-600">Rare Diseases</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed font-bold max-w-2xl">
            Synthesizing clinical observations, genetic data, and multimodal evidence for rare disease intelligence. RareGraph AI is a high-precision clinical platform designed to minimize diagnostic latency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              "Neuro-symbolic multimodal reasoning engine",
              "Graph-based phenotype-gene-disease framework",
              "Zero-shot rare disease ranking system",
              "Uncertainty-aware explainable medical AI",
              "Ontology-grounded Clinical Cognition",
            ].map((contribution, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{contribution}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStart}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-[0.2em] rounded transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20"
            >
              Initialize Session
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => toast.info('Loading Technical Documentation...', { description: 'The formal research whitepaper is being prepared.' })}
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-[0.2em] rounded transition-all border border-slate-200 shadow-sm active:scale-95"
            >
              Technical Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Research Motivation & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="p-8 bg-white border border-slate-200 rounded-lg">
          <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Research Problem Statement</h2>
          <p className="text-sm text-slate-700 leading-relaxed font-bold">
            Rare disease patients experience an average diagnostic delay of 5–10 years due to fragmented symptoms and unfamiliar phenotypes. Existing AI systems often fail because they rely on large labeled datasets that don't exist for ultra-rare conditions.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
             <p className="text-[10px] text-blue-600 font-bold italic">"RareGraph AI introduces reasoning-first AI for sparse multimodal medicine."</p>
          </div>
        </div>
        <div className="p-8 bg-white border border-slate-200 rounded-lg h-full">
           <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Research Objective</h2>
           <p className="text-sm text-slate-700 leading-relaxed font-bold">
             Develop an AI-driven framework capable of calculating disease probability under sparse, incomplete, and uncertain clinical evidence through:
           </p>
           <div className="mt-4 font-mono text-blue-600 text-xs font-bold border-l-2 border-blue-600 pl-4 py-2">
             P(Disease | Symptoms + Labs + Imaging + Genetics)
           </div>
        </div>
      </div>

      {/* Diagnostic Odyssey Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 bg-white border border-slate-200 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Clock className="w-32 h-32" />
          </div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Traditional Diagnostic Odyssey</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400">01</div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Fragmented Care</p>
                <p className="text-[10px] text-slate-500 font-bold">5-7 specialists visited on average per patient.</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 ml-4"></div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400">02</div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Misdiagnosis Risk</p>
                <p className="text-[10px] text-slate-500 font-bold">40% of patients initially receive a wrong diagnosis.</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 ml-4"></div>
            <div className="flex items-center gap-4 py-2 px-4 bg-red-50 border border-red-100 rounded">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">Total Delay: 5 - 10 Years</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 bg-white border border-blue-100 rounded-xl relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.05)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32 text-blue-600" />
          </div>
          <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">RareGraph AI Integration</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">01</div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Multimodal Grounding</p>
                <p className="text-[10px] text-slate-500 font-bold">Immediate synergy of symptoms + labs + WES data.</p>
              </div>
            </div>
            <div className="h-8 w-px bg-blue-200 ml-4"></div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">02</div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Explainable Reasoning</p>
                <p className="text-[10px] text-slate-500 font-bold">Verifiable reasoning chains for clinician review.</p>
              </div>
            </div>
            <div className="h-8 w-px bg-blue-200 ml-4"></div>
            <div className="flex items-center gap-4 py-2 px-4 bg-blue-50 border border-blue-100 rounded">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Target Delay: &lt; 30 Minutes</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Research Architecture / Workflow Diagram */}
      <div className="py-8 bg-white border border-slate-200 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Binary className="w-64 h-64" />
        </div>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-12 text-center">Inference Architecture & Flow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 relative">
          {[
            { name: "Intake", icon: Activity },
            { name: "Vision", icon: Microscope },
            { name: "Phenotype", icon: Dna },
            { name: "Mapping", icon: Network },
            { name: "Knowledge", icon: Database },
            { name: "Inference", icon: BrainCircuit },
            { name: "Verify", icon: ShieldCheck },
            { name: "Report", icon: Binary }
          ].map((step, idx, arr) => (
            <div key={idx} className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-50 border border-slate-200 flex items-center justify-center relative group hover:border-blue-600 transition-all">
                <step.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                {idx < arr.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                )}
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition-all group shadow-sm hover:shadow-md"
          >
            <div className={cn("w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", f.color)}>
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">{f.title}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Google Tech Stack Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
           <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Google AI Native Infrastructure</h2>
           <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-600" />
             <div className="w-2 h-2 rounded-full bg-red-500" />
             <div className="w-2 h-2 rounded-full bg-yellow-400" />
             <div className="w-2 h-2 rounded-full bg-green-500" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
           <div className="p-8 group hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive Core</h3>
              </div>
              <ul className="space-y-4">
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Gemini 1.5 Pro</span>
                     <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-bold uppercase">REASONING</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Primary multimodal LLM reasoning engine.</p>
                 </li>
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Gemini Vision</span>
                     <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[8px] font-bold uppercase">COMPUTER VISION</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Extraction of phenotypes from medical imagery.</p>
                 </li>
              </ul>
           </div>

           <div className="p-8 group hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-5 h-5 text-green-600" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orchestration</h3>
              </div>
              <ul className="space-y-4">
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Vertex AI Search</span>
                     <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[8px] font-bold uppercase">GROUNDING</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Ontology-aligned document retrieval.</p>
                 </li>
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Cloud Run</span>
                     <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-bold uppercase">COMPUTE</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Serverless scalable inference execution.</p>
                 </li>
              </ul>
           </div>

           <div className="p-8 group hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-5 h-5 text-purple-600" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Persistence</h3>
              </div>
              <ul className="space-y-4">
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Firestore DB</span>
                     <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[8px] font-bold uppercase">STATE</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Real-time collaborative diagnostic session data.</p>
                 </li>
                 <li className="flex flex-col gap-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Firebase Auth</span>
                     <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[8px] font-bold uppercase">SECURITY</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold">Enterprise-grade HIPAA-aligned authentication.</p>
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {/* Future Research Roadmap */}
      <div className="py-8 border-t border-slate-200">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Future Research Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { phase: "PHASE 01", title: "Automated Phenotyping", desc: "Scale vision-based HPO extraction to rare metabolic conditions.", icon: Microscope },
             { phase: "PHASE 02", title: "Federated Learning", desc: "Privacy-preserving model training across collaborative hospital nodes.", icon: Network },
             { phase: "PHASE 03", title: "Synthetic Case Gen", desc: "Generate high-fidelity synthetic rare disease cases for model stress-testing.", icon: Binary },
           ].map((p, i) => (
             <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col items-center text-center">
                <span className="text-[10px] font-black text-blue-600 mb-2">{p.phase}</span>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">{p.title}</p>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{p.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
