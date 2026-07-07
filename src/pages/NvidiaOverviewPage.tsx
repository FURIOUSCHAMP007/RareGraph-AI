import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  BookOpen, 
  Radio, 
  Eye, 
  FlaskConical, 
  Atom, 
  Activity, 
  ListOrdered, 
  Settings, 
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Server,
  Network,
  ArrowRight,
  Database,
  History,
  Workflow,
  Cloud,
  Sparkles,
  Terminal,
  Play,
  Share2,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import HybridPipelineSimulator from '../components/HybridPipelineSimulator';

interface OverviewCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  pageId: string;
  onNavigate: (page: string) => void;
  badge?: string;
  badgeColor?: string;
  techStack?: string;
}

function OverviewCard({ title, subtitle, description, icon: Icon, pageId, onNavigate, badge, badgeColor = "bg-[#76B900]/10 text-[#76B900] border-[#76B900]/20", techStack }: OverviewCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => {
        onNavigate(pageId);
        toast.info(`Navigating to ${title}...`);
      }}
      className="p-5 rounded-2xl border border-slate-200 hover:border-[#76B900]/40 bg-white hover:bg-[#76B900]/[0.01] transition-all cursor-pointer flex flex-col justify-between shadow-xs group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">{subtitle}</span>
          <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#76B900]/10 border border-slate-100 group-hover:border-[#76B900]/20 transition-all">
            <Icon className="w-4 h-4 text-slate-600 group-hover:text-[#76B900] transition-colors" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#76B900] transition-colors">{title}</h3>
            {badge && (
              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
        <span className="text-[8px] font-mono font-bold text-slate-400">{techStack || 'NGC NIM Service'}</span>
        <div className="flex items-center gap-1 text-[9px] font-black text-[#76B900] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Open Workspace
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>
    </motion.div>
  );
}

export default function NvidiaOverviewPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const cards: OverviewCardProps[] = [
    {
      title: "BioNeMo™ Hub",
      subtitle: "NVIDIA Platform",
      description: "Generative AI suite featuring biological foundation models for drug discovery and structural analysis (ESM-2, ESMFold, MegaMolBART, DiffDock).",
      icon: Cpu,
      pageId: "bionemo-hub",
      onNavigate,
      badge: "Sandbox Active",
      techStack: "H100 Optimized"
    },
    {
      title: "BioNeMo™ Model Catalog",
      subtitle: "NVIDIA Platform",
      description: "Comprehensive biological foundation registry (ESMFold, DiffDock, Geneformer, DNABERT) featuring direct resource requirements and inline launch inference shortcuts.",
      icon: BookOpen,
      pageId: "bionemo-catalog",
      onNavigate,
      badge: "Full Directory",
      techStack: "7 Foundation Models"
    },
    {
      title: "NIM™ Gateway Monitor",
      subtitle: "Live Inference",
      description: "Audit microservice latencies, global routing tables, packet headers, SSL TLS states, and diagnostic trace probes for real-time biological requests.",
      icon: Radio,
      pageId: "bionemo-monitor",
      onNavigate,
      badge: "Probes Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      techStack: "Express API Proxy"
    },
    {
      title: "Molecular Viewer",
      subtitle: "3D Visualizer",
      description: "Interactive Mol* spatial molecular rendering with atomic residue mutation overlays, HPO matching, and full clinical variant annotation integration.",
      icon: Eye,
      pageId: "bionemo-viewer",
      onNavigate,
      badge: "GPU Render",
      badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      techStack: "WebGL Spatial engine"
    },
    {
      title: "Protein Folding Studio",
      subtitle: "ESMFold Predictor",
      description: "Direct sequencing studio to trigger de novo atomic structure prediction from primary amino acid residues without searching massive MSAs.",
      icon: FlaskConical,
      pageId: "bionemo-folding",
      onNavigate,
      badge: "Structure",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      techStack: "ESMFold-2 3B Param"
    },
    {
      title: "Drug Discovery Workspace",
      subtitle: "Chemical Space",
      description: "Perform ligand molecular docking and small molecule generation pipelines powered by MegaMolBART and DiffDock AI generative models.",
      icon: Atom,
      pageId: "bionemo-discovery",
      onNavigate,
      badge: "Generative",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      techStack: "MegaMolBART / DiffDock"
    },
    {
      title: "AI Bioreactor Monitor",
      subtitle: "Bioprocess Telemetry",
      description: "Track live cell biomass density, pH, oxygenation, and temperature metrics in autonomous fermentation chambers controlled by AI feedback agents.",
      icon: Activity,
      pageId: "bionemo-bioreactor",
      onNavigate,
      badge: "Live Telemetry",
      badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
      techStack: "Autonomous Controller"
    },
    {
      title: "Inference Jobs Queue",
      subtitle: "Job Pipeline",
      description: "Manage async high-throughput drug screening jobs, batch PDB structure folded downloads, execution history, and active job dispatchers.",
      icon: ListOrdered,
      pageId: "bionemo-jobs",
      onNavigate,
      badge: "Job Engine",
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      techStack: "Redis/Task Dispatcher"
    },
    {
      title: "GPU & System Monitoring",
      subtitle: "Hardware Metrics",
      description: "Audit actual core Hopper/Ampere GPU cluster loads, dedicated VRAM allocations, node temperature trends, and active model pipelines.",
      icon: Sliders,
      pageId: "bionemo-sysmon",
      onNavigate,
      badge: "Hardware",
      badgeColor: "bg-slate-500/10 text-slate-600 border-slate-500/20",
      techStack: "NVIDIA-SMI Integration"
    },
    {
      title: "Developer/API Center",
      subtitle: "Gateway Management",
      description: "Configure NGC API authorization keys, secure token variables, proxy endpoints, live curl requests, and custom model server wrappers.",
      icon: Settings,
      pageId: "bionemo-dev",
      onNavigate,
      badge: "Keys & Tokens",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      techStack: "Config Workspace"
    }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Enterprise Nvidia Banner */}
      <div className="relative bg-[#05070a] border border-zinc-900 rounded-[24px] p-8 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_1px,transparent_1px),linear-gradient(to_bottom,#76B900_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#76B900]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 max-w-5xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-[#76B900]/30">
              NVIDIA AI Enterprise
            </span>
            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-zinc-700">
              Agentic RareGraphAI Production Integration
            </span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              NVIDIA Clinical <span className="text-[#76B900]">Supercomputing Suite</span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-4xl">
              Agentic RareGraphAI harnesses NVIDIA's GPU-accelerated computing architecture to process clinical whole-genome data, 
              simulate atomic-level protein folding, and execute small molecule generative docking. Deploying production NIM 
              microservices unlocks real-time clinical diagnostics for rare hereditary disorders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={() => {
                onNavigate('bionemo-features');
                toast.success('Entering NVIDIA features portal...');
              }}
              className="px-6 py-3 bg-[#76B900] hover:bg-[#66a000] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#76B900]/10"
            >
              NVIDIA Features Gateway
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button 
              onClick={() => onNavigate('bionemo-monitor')}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Verify Active NIM Gateway Probes
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 10 NVIDIA Pages (Using 9 interactive cards + Feature page link) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Platform Directories</h2>
          <p className="text-base font-black text-slate-900 uppercase">Interactive Hardware & AI Model Workspaces</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onNavigate('bionemo-features')}
            className="p-5 rounded-2xl border border-[#76B900]/30 bg-gradient-to-br from-[#76B900]/[0.05] to-transparent hover:bg-[#76B900]/[0.08] transition-all cursor-pointer flex flex-col justify-between shadow-xs group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-[#76B900] uppercase tracking-widest">NVIDIA Features</span>
                <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-[#76B900]/40 transition-all">
                  <BookOpen className="w-4 h-4 text-[#76B900]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#76B900] transition-colors">
                  NVIDIA BIO NO ME FEATURES - HOME
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Interactive reference portal, documentation sheets, structural pipelines, and clinical validation diagrams.
                </p>
              </div>
            </div>
            <div className="border-t border-[#76B900]/10 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-[#76B900]/80">Documentation & Theory</span>
              <div className="flex items-center gap-1 text-[9px] font-black text-[#76B900] uppercase tracking-wider">
                Explore Portal
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </motion.div>

          {cards.map((card, idx) => (
            <OverviewCard key={idx} {...card} />
          ))}
        </div>
      </div>

      {/* Recommended Integration Architecture Map */}
      <div className="bg-[#05070a] border border-zinc-900 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_0.5px,transparent_0.5px)] bg-[size:3rem] opacity-[0.015]" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <span className="text-[8.5px] font-mono font-black text-[#76B900] uppercase tracking-widest block">NVIDIA Integration Blueprint</span>
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Workflow className="w-5 h-5 text-[#76B900]" />
              Recommended Agentic RareGraphAI Multi-Stage Architecture
            </h3>
          </div>
          <span className="text-[8px] bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 px-2 py-1 rounded font-mono font-black uppercase">
            Active Workspace Schema
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-[10px] font-mono text-zinc-400">
          <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-[11px] border-b border-zinc-900 pb-2">
              <span className="bg-[#76B900] text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono">1</span>
              <span>Production BioNeMo NIMs</span>
            </div>
            <p className="text-zinc-500 text-[9.5px] leading-relaxed">
              Provides high-throughput endpoints via local Docker/Kubernetes container pods, executing latency-optimized ESM-2 and ESMFold calculations.
            </p>
            <div className="text-[8.5px] text-[#76B900] font-bold bg-[#76B900]/5 px-2 py-1 rounded border border-[#76B900]/10">
              ● API Layer Integration Complete
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-[11px] border-b border-zinc-900 pb-2">
              <span className="bg-cyan-500 text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono">2</span>
              <span>GPU Molecular Visuals</span>
            </div>
            <p className="text-zinc-500 text-[9.5px] leading-relaxed">
              Direct integration of fast WebGL structure loaders (such as Mol* or 3Dmol.js) to display real-time computed molecular models of predicted protein coordinates.
            </p>
            <div className="text-[8.5px] text-cyan-400 font-bold bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/10">
              ● WebGL Rendering Implemented
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-[11px] border-b border-zinc-900 pb-2">
              <span className="bg-purple-500 text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono">3</span>
              <span>NeMo LLM Guardrails</span>
            </div>
            <p className="text-zinc-500 text-[9.5px] leading-relaxed">
              Secures patient clinical summaries by processing models through custom policy chains to eliminate PHI leaks, prompt injections, and scope drifts.
            </p>
            <div className="text-[8.5px] text-purple-400 font-bold bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
              ● Guardrails Audit Logs Active
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-[11px] border-b border-zinc-900 pb-2">
              <span className="bg-amber-500 text-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono">4</span>
              <span>Accelerated Data Rap</span>
            </div>
            <p className="text-zinc-500 text-[9.5px] leading-relaxed">
              GPU acceleration for massive whole-exome sequencing variant arrays, using cuDF pipelines for lightning fast ClinVar matches and ACMG rules checks.
            </p>
            <div className="text-[8.5px] text-amber-400 font-bold bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
              ● RAPIDS Integration Scalable
            </div>
          </div>
        </div>
      </div>

      {/* NEW: GOOGLE AI NATIVE INFRASTRUCTURE SUITE */}
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black text-[#4285F4] uppercase tracking-widest font-mono">Google Cloud Integration</span>
          <h2 className="text-base font-black text-slate-900 uppercase">Google AI Native Infrastructure Suite</h2>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed">
            Harness Google Cloud's distributed AI platforms to ingest large clinical cohort data, drive automated multi-agent disease consensus, and persist secure patient health records.
          </p>
        </div>

        {/* Google Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Vertex AI & Gemini Clinical Agents */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-2xl border border-slate-200 hover:border-[#4285F4]/40 bg-white transition-all flex flex-col justify-between shadow-xs group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Cognitive Engine</span>
                <div className="p-2 rounded-xl bg-[#4285F4]/5 group-hover:bg-[#4285F4]/10 border border-[#4285F4]/10 transition-all">
                  <Sparkles className="w-4 h-4 text-[#4285F4]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#4285F4] transition-colors">
                  Gemini Clinical Agents
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Orchestrate Gemini 1.5 Pro medical agents to parse raw whole-genome reports, synthesize literature database annotations, and match rare disease trials.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-slate-400">Gemini 1.5 / Vertex SDK</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-blue-500/10 text-blue-600 border-blue-500/20">
                Cognition Ready
              </span>
            </div>
          </motion.div>

          {/* Card 2: BigQuery Genomics Warehouse */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-2xl border border-slate-200 hover:border-[#EA4335]/40 bg-white transition-all flex flex-col justify-between shadow-xs group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Analytics Lake</span>
                <div className="p-2 rounded-xl bg-[#EA4335]/5 group-hover:bg-[#EA4335]/10 border border-[#EA4335]/10 transition-all">
                  <Database className="w-4 h-4 text-[#EA4335]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#EA4335] transition-colors">
                  BigQuery Genomics
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Run massive multi-terabyte federated queries joining patients' rare genomic mutation arrays with public variant reference datasets like ClinVar.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-slate-400">BigQuery BigLake / SQL</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-red-500/10 text-red-600 border-red-500/20">
                Federated Lake
              </span>
            </div>
          </motion.div>

          {/* Card 3: Google Cloud TPU v5p Clusters */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-2xl border border-slate-200 hover:border-[#FBBC05]/40 bg-white transition-all flex flex-col justify-between shadow-xs group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Compute Pods</span>
                <div className="p-2 rounded-xl bg-[#FBBC05]/5 group-hover:bg-[#FBBC05]/10 border border-[#FBBC05]/10 transition-all">
                  <Cpu className="w-4 h-4 text-[#FBBC05]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#FBBC05] transition-colors">
                  Cloud TPU v5p Clusters
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Train and fine-tune custom DNA-BERT sequence models or biological transformers at peak scale using highly synchronized TPU v5p supercomputing pods.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-slate-400">TPU v5p / GKE Autopilot</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-600 border-amber-500/20">
                Peak Scale
              </span>
            </div>
          </motion.div>

          {/* Card 4: Healthcare API & FHIR Store */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-2xl border border-slate-200 hover:border-[#34A853]/40 bg-white transition-all flex flex-col justify-between shadow-xs group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">HIPAA Compliance</span>
                <div className="p-2 rounded-xl bg-[#34A853]/5 group-hover:bg-[#34A853]/10 border border-[#34A853]/10 transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#34A853]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-[#34A853] transition-colors">
                  FHIR Clinical Vault
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Stream patient records, molecular diagnostic summaries, and medical imaging into highly protected, interoperable clinical structures.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-slate-400">Cloud Healthcare API / GCS</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Secure Vault
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* INTERACTIVE HYBRID ORCHESTRATION PIPELINE SIMULATOR */}
      <HybridPipelineSimulator />

    </div>
  );
}
