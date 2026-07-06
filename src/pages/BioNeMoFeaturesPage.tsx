import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Dna, 
  Atom, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Database,
  Terminal,
  Server,
  Network,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface FeatureCardProps {
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  specs: string[];
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

function FeatureCard({ title, badge, description, icon: Icon, specs, colorClass, bgClass, borderClass }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className={`p-6 rounded-2xl border ${borderClass} bg-[#06080c] shadow-xl flex flex-col justify-between transition-all`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${colorClass} bg-white/5`}>
            {badge}
          </span>
          <div className={`p-2 rounded-xl bg-white/5 border ${borderClass}`}>
            <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-white">{title}</h3>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="border-t border-zinc-800/80 pt-4 mt-5 space-y-1.5">
        <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-wider block">Model Specifications</span>
        <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono font-bold text-zinc-300">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="truncate">{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function BioNeMoFeaturesPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const models = [
    {
      title: "ESM-2 Sequence Scanning",
      badge: "Codon Pathogenicity",
      description: "State-of-the-art biological language model trained on 250M+ sequences. Captures deep biophysical and biochemical properties to estimate mutation fitness landscapes without 3D structures.",
      icon: Dna,
      specs: ["3B Parameters", "36 Attention Layers", "H100 Optimized", "Zero-Shot Scoring"],
      colorClass: "text-[#76B900] border-[#76B900]/20",
      bgClass: "",
      borderClass: "border-zinc-850 hover:border-[#76B900]/50"
    },
    {
      title: "ESMFold Protein 3D Structure",
      badge: "Structure Prediction",
      description: "Leverages ESM-2 representations to fold primary amino acid sequences into accurate 3D coordinates. Bypasses Multiple Sequence Alignments (MSAs) for order-of-magnitude speedups.",
      icon: Cpu,
      specs: ["IPA Attention Trunk", "MSA-Free Pipeline", "Atomic Backbones", "<5s Latency"],
      colorClass: "text-emerald-400 border-emerald-500/20",
      bgClass: "",
      borderClass: "border-zinc-850 hover:border-emerald-500/50"
    },
    {
      title: "MegaMolBART Generative Chem",
      badge: "Small Molecule Design",
      description: "Generative chemical transformer for chemical space exploration. Performs SMILES embeddings, drug-like molecule generation, retrosynthesis planning, and structural interpolation.",
      icon: Atom,
      specs: ["BART Transformer", "SMILES Encoding", "Latent Interpolation", "QSAR Property Predict"],
      colorClass: "text-amber-400 border-amber-500/20",
      bgClass: "",
      borderClass: "border-zinc-850 hover:border-amber-500/50"
    },
    {
      title: "DiffDock Molecular Docking",
      badge: "Rigid & Flexible Binding",
      description: "Diffusion generative model for molecular docking. Predicts the 3D binding structure of a small molecule ligand to a protein target, simulating real-world binding configurations.",
      icon: Layers,
      specs: ["Equivariant GNN", "Diffusion Scoring", "Flexible Torsions", "Confidence Score"],
      colorClass: "text-cyan-400 border-cyan-500/20",
      bgClass: "",
      borderClass: "border-zinc-850 hover:border-cyan-500/50"
    }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* Hero Banner Section */}
      <div className="relative bg-[#05070a] border border-zinc-900 rounded-[24px] p-8 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_1px,transparent_1px),linear-gradient(to_bottom,#76B900_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.015] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#76B900]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-[#76B900]/30 animate-pulse">
              Platform Architecture
            </span>
            <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-zinc-700">
              LITE FEEDS ACTIVE
            </span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              NVIDIA BioNeMo™ Hub <span className="text-[#76B900]">Generative AI Suite</span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-3xl">
              NVIDIA BioNeMo™ is a generative AI platform for drug discovery that simplifies and accelerates 
              the training and deployment of biological foundation models. Access production-ready NIM microservices 
              for molecular folding, zero-shot mutational scanning, binding simulations, and generative chemistry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={() => {
                onNavigate('bionemo-hub');
                toast.success('Entering BioNeMo interactive sandbox...');
              }}
              className="px-6 py-3 bg-[#76B900] hover:bg-[#66a000] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20"
            >
              Interactive Hub Sandbox
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button 
              onClick={() => onNavigate('bionemo-monitor')}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Verify NIM Gateway Probes
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Platform Core Models */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">NVIDIA BioNeMo Foundation Models</h2>
          <p className="text-base font-black text-slate-900 uppercase">Interactive Molecular Intelligence Engines</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {models.map((model, idx) => (
            <FeatureCard key={idx} {...model} />
          ))}
        </div>
      </div>

      {/* Interactive Infrastructure Diagram Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 bg-[#05070a] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_0.5px,transparent_0.5px)] bg-[size:2rem] opacity-[0.01]" />
          
          <div className="space-y-2 mb-6">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Deployment Blueprint</span>
            <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Network className="w-4 h-4 text-[#76B900]" />
              Containerized NIM Architecture
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed max-w-xl">
              NVIDIA Inference Microservices (NIMs) package optimized engines (such as Triton and TensorRT-LLM) into self-contained deployment stacks that can run on any NVIDIA-certified GPU system.
            </p>
          </div>

          {/* Interactive Topology Visualizer */}
          <div className="bg-[#020305] rounded-xl border border-zinc-900 p-5 space-y-4 font-mono text-[9px] text-zinc-400 select-none">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-black uppercase">Clinician Workspace Frontend</span>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">PORT 3000</span>
            </div>

            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-zinc-850" />
              <div className="bg-zinc-950 border border-zinc-850 px-4 py-2 rounded text-zinc-300 font-bold flex items-center gap-2.5">
                <Terminal className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Express API Proxy Router (server.ts)</span>
              </div>
              <div className="w-0.5 h-4 bg-zinc-850" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border border-zinc-900 bg-[#030508] p-3 rounded text-center space-y-1">
                <span className="text-zinc-500 text-[8px] font-black uppercase block">Step 1</span>
                <strong className="text-zinc-200 block text-[8.5px]">Guardrails Audit</strong>
                <span className="text-[7.5px] text-zinc-600">NeMo Guardrails PHI check</span>
              </div>
              <div className="border border-zinc-900 bg-[#030508] p-3 rounded text-center space-y-1">
                <span className="text-zinc-500 text-[8px] font-black uppercase block">Step 2</span>
                <strong className="text-zinc-200 block text-[8.5px]">API Token Route</strong>
                <span className="text-[7.5px] text-zinc-600">NVIDIA NGC Cloud authorization</span>
              </div>
              <div className="border border-zinc-900 bg-[#030508] p-3 rounded text-center space-y-1">
                <span className="text-zinc-500 text-[8px] font-black uppercase block">Step 3</span>
                <strong className="text-zinc-200 block text-[8.5px]">NIM Execution</strong>
                <span className="text-[7.5px] text-zinc-600">High-throughput TensorRT infer</span>
              </div>
            </div>

            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-zinc-850" />
              <div className="bg-[#76B900]/10 border border-[#76B900]/20 px-4 py-2 rounded text-[#76B900] font-black flex items-center gap-2.5 animate-pulse">
                <Cpu className="w-3.5 h-3.5" />
                <span>NVIDIA Tensor Core GPU Clusters (H100/A100)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Operational Highlights panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Enterprise Capabilities</span>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                BioNeMo Platform Advantages
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#76B900]/10 text-[#76B900] rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-[11px] font-black text-slate-900 uppercase block">Enterprise Security & Compliance</strong>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Integrated with custom clinical data privacy guardrails to enforce HIPAA compliance, prevent patient PHI leaks, and verify output toxicity constraints.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-600 rounded-lg shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-[11px] font-black text-slate-900 uppercase block">Scale-Out High-Throughput Pipelines</strong>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Bypasses expensive database fetches or search computations by packaging weights directly inside fast Hopper and Ampere memory-mapped layers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-[11px] font-black text-slate-900 uppercase block">Zero-Shot Mutation Landscapes</strong>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Instantly score point mutations to predict benign versus pathogenic variations in hereditary cancer syndromes or respiratory pathogens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-6">
            <div className="flex justify-between items-center text-[8.5px] font-mono font-black uppercase text-slate-500 mb-1">
              <span>NVIDIA NIM Gateway status</span>
              <span className="text-emerald-600 animate-pulse">● Probes Active</span>
            </div>
            <p className="text-[9.5px] font-bold text-slate-600 leading-relaxed">
              Verify real-time endpoint latency metrics, health routes, and trace diagnostics inside the custom status console.
            </p>
            <button 
              onClick={() => onNavigate('bionemo-monitor')}
              className="mt-3 text-[9px] font-mono font-black text-blue-600 hover:text-blue-700 uppercase flex items-center gap-1 cursor-pointer"
            >
              Go to live monitor
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
