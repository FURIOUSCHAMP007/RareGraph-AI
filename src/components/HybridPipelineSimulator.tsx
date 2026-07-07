import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Terminal, 
  RefreshCw, 
  Server, 
  Cpu, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Workflow
} from 'lucide-react';

interface LogMessage {
  time: string;
  category: 'system' | 'google' | 'nvidia' | 'success';
  text: string;
}

interface Step {
  id: number;
  name: string;
  provider: 'google' | 'nvidia';
  icon: React.ElementType;
  description: string;
  badge: string;
  color: string;
  glowColor: string;
}

const PIPELINE_STEPS: Step[] = [
  {
    id: 0,
    name: "GCS raw VCF Stream",
    provider: "google",
    icon: Database,
    description: "Read patient multi-exome variant files directly from gs://clinical-genomics-vault",
    badge: "Storage",
    color: "text-[#4285F4]",
    glowColor: "shadow-[#4285F4]/30 border-[#4285F4]/40"
  },
  {
    id: 1,
    name: "cuDF RAPIDS Filter",
    provider: "nvidia",
    icon: Cpu,
    description: "JIT compile and filter 1.4M mutations for rare pathogenic significance in 45ms",
    badge: "RAPIDS GPU",
    color: "text-[#76B900]",
    glowColor: "shadow-[#76B900]/30 border-[#76B900]/40"
  },
  {
    id: 2,
    name: "ESMFold Mutation Folding",
    provider: "nvidia",
    icon: Layers,
    description: "Generate 3D structural protein folding prediction coordinate sheets for variant residues",
    badge: "ESMFold NIM",
    color: "text-[#22d3ee]",
    glowColor: "shadow-cyan-400/30 border-cyan-400/40"
  },
  {
    id: 3,
    name: "Gemini 1.5 Pro Analysis",
    provider: "google",
    icon: Sparkles,
    description: "Evaluate mutated folds, query clinical papers, and identify localized trials matching",
    badge: "Vertex AI LLM",
    color: "text-[#a855f7]",
    glowColor: "shadow-purple-500/30 border-purple-500/40"
  },
  {
    id: 4,
    name: "FHIR Store Publishing",
    provider: "google",
    icon: ShieldCheck,
    description: "Save structured medical reports and register clinical resources with HIPAA compliance",
    badge: "Healthcare API",
    color: "text-[#10b981]",
    glowColor: "shadow-emerald-500/30 border-emerald-500/40"
  }
];

export default function HybridPipelineSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [pipelineType, setPipelineType] = useState<'screening' | 'oncology' | 'protein'>('screening');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Log helper
  const addLog = (text: string, category: 'system' | 'google' | 'nvidia' | 'success') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time: timestamp, category, text }]);
  };

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    
    // Workload specific logs template
    let textWorkload = "";
    if (pipelineType === 'screening') textWorkload = "Hereditary Breast/Ovarian Cancer Rare Variant Pipeline [BRCA-1/2]";
    else if (pipelineType === 'oncology') textWorkload = "Somatic Tumor Mutational Load Analysis [EGFR-L858R]";
    else textWorkload = "De Novo Structural Epitope Engineering [ESM-3 Pods]";

    addLog(`INITIALIZED: Starting ${textWorkload}...`, 'system');
    addLog(`[STEP 1/5] Est. pipeline routing with GKE autopilot...`, 'system');
    
    // Step 0: Ingest
    setCurrentStep(0);
    setTimeout(() => {
      addLog(`[GCS_INGEST] Successfully pulled patient WGS_9921 exome manifest from secure GCP bucket.`, 'google');
      addLog(`[GCS_INGEST] Ingested 1,429,510 raw mutations; streaming VCF data stream downstream to GPU buffer.`, 'google');
      
      // Step 1: cuDF Filter
      setCurrentStep(1);
    }, 1800);

    setTimeout(() => {
      addLog(`[NVIDIA_cuDF] Received exome variant dataframe in CUDA device memory.`, 'nvidia');
      addLog(`[NVIDIA_cuDF] Applied RAPIDS accelerated dataframe logic: Quality >= 150, ReadDepth >= 40x, ExAC_AF <= 0.005`, 'nvidia');
      addLog(`[NVIDIA_cuDF] GPU Filter ran in 38.2 milliseconds. Isolated 3 highly significant rare-pathogenic sites.`, 'nvidia');
      
      // Step 2: ESMFold
      setCurrentStep(2);
    }, 4000);

    setTimeout(() => {
      addLog(`[NVIDIA_ESMFold] Dispatched mutation coordinate sequences to local NIM microservice cluster.`, 'nvidia');
      addLog(`[NVIDIA_ESMFold] ESMFold-2 3B structural generator folded 3D mutant domains (Avg pLDDT: 91.2%).`, 'nvidia');
      addLog(`[NVIDIA_ESMFold] Captured 3D coordinate vector arrays; streaming spatial structure telemetry to Gemini SDK.`, 'nvidia');
      
      // Step 3: Gemini 1.5 Pro
      setCurrentStep(3);
    }, 6500);

    setTimeout(() => {
      addLog(`[GEMINI_COGNITION] Ingested folded PDB mutant structure and historical patient phenotype records.`, 'google');
      addLog(`[GEMINI_COGNITION] Scanning scientific literature indices: Indexed 14 recently published genome papers.`, 'google');
      addLog(`[GEMINI_COGNITION] Found active clinical trial match: NCT04294821 (Phase II PARP inhibitor trial in geographical proximity).`, 'google');
      addLog(`[GEMINI_COGNITION] Generated synthetic structured clinical brief in 480ms.`, 'google');
      
      // Step 4: FHIR Store
      setCurrentStep(4);
    }, 9500);

    setTimeout(() => {
      addLog(`[GCP_FHIR] Archiving clinical summaries and structured annotations to FHIR server instance.`, 'google');
      addLog(`[GCP_FHIR] Emitted HIPAA compliant DiagnosticReport JSON package to Cloud Healthcare API logs.`, 'google');
      addLog(`[GCP_FHIR] Exported high-dimensional analytical tables into BigQuery genomics warehouse.`, 'google');
      
      addLog(`SUCCESS: Full Google Cloud & NVIDIA hybrid supercomputing pipeline execution finished!`, 'success');
      setCurrentStep(5);
      setIsSimulating(false);
    }, 12000);
  };

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-[24px] p-6 shadow-2xl relative overflow-hidden space-y-6">
      
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#4285F4/5,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#76B900/4,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#4285F4]/10 to-[#76B900]/10 border border-zinc-800 rounded-2xl">
            <Workflow className="w-5 h-5 text-[#4285F4] animate-spin-slow" />
          </div>
          <div>
            <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block">
              Joint Integration Fabric
            </span>
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              Hybrid Google AI & NVIDIA Pipeline Simulator
            </h3>
          </div>
        </div>

        {/* Pipeline Workload Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 rounded-xl p-1">
          {[
            { id: 'screening', label: 'Rare Variant exome' },
            { id: 'oncology', label: 'Somatic oncology' },
            { id: 'protein', label: 'De novo design' }
          ].map((type) => (
            <button
              key={type.id}
              disabled={isSimulating}
              onClick={() => setPipelineType(type.id as any)}
              className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                pipelineType === type.id 
                  ? 'bg-zinc-900 text-white shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Interactive Pipeline Nodes */}
      <div className="relative bg-zinc-950/40 rounded-2xl border border-zinc-900/60 p-6 overflow-hidden">
        
        {/* Connection Flow Lines Backing */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-zinc-900 -translate-y-1/2 hidden md:block z-0" />
        
        {/* Animated Flow Dot */}
        {isSimulating && currentStep >= 0 && currentStep < 5 && (
          <motion.div 
            className="absolute top-1/2 h-1 bg-gradient-to-r from-[#4285F4] via-[#76B900] to-cyan-400 rounded-full hidden md:block z-10"
            initial={{ left: "10%", right: "90%" }}
            animate={{ 
              left: `${10 + currentStep * 20}%`, 
              right: `${90 - (currentStep + 1) * 20}%` 
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
          {PIPELINE_STEPS.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx || currentStep === 5;
            const isPending = currentStep < idx && currentStep !== 5;

            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? `bg-zinc-950 border-zinc-700 shadow-lg ${step.glowColor}` 
                    : isCompleted
                    ? 'bg-zinc-950/20 border-[#10b981]/25 opacity-90'
                    : 'bg-zinc-950/60 border-zinc-900/80 opacity-60'
                }`}
              >
                {/* Node circular header */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border relative transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-900 border-zinc-600 scale-110' 
                    : isCompleted
                    ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  ) : (
                    <IconComponent className={`w-4 h-4 ${isActive ? step.color : 'text-zinc-500'}`} />
                  )}

                  {/* Active Pulse rings */}
                  {isActive && (
                    <>
                      <span className="absolute inset-0 rounded-full border border-inherit animate-ping opacity-60" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse" />
                    </>
                  )}
                </div>

                {/* Node Info */}
                <div className="mt-3 space-y-1">
                  <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${
                    step.provider === 'google' ? 'text-[#4285F4]' : 'text-[#76B900]'
                  }`}>
                    {step.provider === 'google' ? 'Google Cloud' : 'NVIDIA Suite'}
                  </span>
                  <h4 className="text-[10px] font-black uppercase text-white tracking-tight leading-tight">
                    {step.name}
                  </h4>
                  <p className="text-[9px] text-zinc-500 font-medium leading-relaxed max-w-[150px] mx-auto hidden md:block">
                    {step.description}
                  </p>
                </div>

                {/* Step Pill */}
                <div className="mt-3.5">
                  <span className={`text-[7.5px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    isActive 
                      ? 'bg-zinc-800 text-white border-zinc-700' 
                      : isCompleted
                      ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/10'
                      : 'bg-zinc-950 text-zinc-600 border-zinc-900'
                  }`}>
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controller & Logs terminal console layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Panel */}
        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/60 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block">
              Execution Dashboard
            </span>
            <h4 className="text-xs font-black uppercase text-white">Hybrid Control Desk</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Manually trigger an asynchronous pipeline iteration. Watch raw genomics logs process dynamically between local accelerators and Google cognitive servers.
            </p>
          </div>

          <div className="space-y-3">
            {/* Status readouts */}
            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 space-y-2 font-mono text-[9px] text-zinc-400">
              <div className="flex justify-between">
                <span>PIPELINE ROUTER:</span>
                <span className="text-emerald-500 font-bold">● ACTIVE GATEWAY</span>
              </div>
              <div className="flex justify-between">
                <span>MUTATION FOCUS:</span>
                <span className="text-white font-black uppercase">
                  {pipelineType === 'screening' ? 'BRCA1 MUTATIONS' : pipelineType === 'oncology' ? 'EGFR ONCOGENES' : 'ESM-3 DESIGN'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>EST. TOTAL LATENCY:</span>
                <span className="text-[#76B900] font-bold">~12.0 SECONDS</span>
              </div>
            </div>

            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSimulating 
                  ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' 
                  : 'bg-gradient-to-r from-[#4285F4] to-[#76B900] hover:brightness-110 text-white shadow-xl shadow-[#4285F4]/10'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ANALYSIS RUNNING...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  TRIGGER PIPELINE TRACE
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Logs terminal screen */}
        <div className="lg:col-span-2 p-4 rounded-2xl border border-zinc-900 bg-black flex flex-col justify-between h-[230px] font-mono text-[9.5px]">
          
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2 text-zinc-500 text-[8.5px]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold uppercase tracking-wider">Secure Pipeline Console: /var/log/gke-nemo-hybrid</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            </div>
          </div>

          {/* Log Statements Stream */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-zinc-900">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-1">
                <p className="text-[8.5px] uppercase tracking-wider font-bold">Stream Standby</p>
                <p className="text-[9px] text-zinc-700 max-w-xs">Click "Trigger Pipeline Trace" on the left to output real-time system logs.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                  <span className={`font-black uppercase flex-shrink-0 ${
                    log.category === 'google' 
                      ? 'text-[#4285F4]' 
                      : log.category === 'nvidia' 
                      ? 'text-[#76B900]' 
                      : log.category === 'success'
                      ? 'text-[#10b981]'
                      : 'text-zinc-400'
                  }`}>
                    {log.category === 'google' 
                      ? '[GCP]' 
                      : log.category === 'nvidia' 
                      ? '[NVIDIA]' 
                      : log.category === 'success'
                      ? '[OK]'
                      : '[SYS]'}
                  </span>
                  <span className="text-zinc-300 font-medium break-all">{log.text}</span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="border-t border-zinc-900 pt-2 mt-2 flex items-center justify-between text-[8px] text-zinc-600">
            <span>TERMINAL STATUS: {isSimulating ? 'STREAMING' : 'IDLE'}</span>
            <span>UTF-8 x86_64</span>
          </div>
        </div>

      </div>

    </div>
  );
}
