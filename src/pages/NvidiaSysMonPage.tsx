import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Activity, 
  Cpu, 
  Server, 
  Layers, 
  HardDrive, 
  Thermometer, 
  Zap, 
  TrendingUp, 
  Flame, 
  Gauge, 
  RefreshCw, 
  Sparkles, 
  Play, 
  Pause,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import RealTimeGpuTelemetry from '../components/RealTimeGpuTelemetry';
import GpuThermalStressTrend from '../components/GpuThermalStressTrend';
import GenomicKernelVramGraph from '../components/GenomicKernelVramGraph';

interface GpuStatus {
  id: number;
  name: string;
  load: number;
  memoryUsed: number; // GB
  memoryTotal: number; // GB
  temperature: number; // C
  powerDraw: number; // W
  powerLimit: number; // W
}

interface TelemetryPoint {
  time: string;
  gpu0_load: number;
  gpu0_vram: number;
  gpu0_temp: number;
  gpu1_load: number;
  gpu1_vram: number;
  gpu1_temp: number;
}

interface ThermalPoint {
  time: string;
  gpu0_temp: number;
  gpu1_temp: number;
}

export default function NvidiaSysMonPage() {
  const [activeGpuId, setActiveGpuId] = useState<number>(0);
  const [activeJob, setActiveJob] = useState<'idle' | 'llm' | 'folding' | 'docking'>('llm');
  const [showLoad, setShowLoad] = useState<boolean>(true);
  const [showVram, setShowVram] = useState<boolean>(true);
  const [showTemp, setShowTemp] = useState<boolean>(true);
  const [isMonitoringActive, setIsMonitoringActive] = useState<boolean>(true);
  const [liveVrams, setLiveVrams] = useState({
    cudf_vcf: 4.8,
    esm_annotation: 12.4,
    esmfold: 18.5,
    diffdock: 14.0
  });

  // Initial GPU parameters
  const [gpuList, setGpuList] = useState<GpuStatus[]>([
    { id: 0, name: 'NVIDIA H100 Tensor Core GPU PCIe', load: 84, memoryUsed: 62.4, memoryTotal: 80.0, temperature: 68, powerDraw: 284, powerLimit: 350 },
    { id: 1, name: 'NVIDIA H100 Tensor Core GPU PCIe', load: 12, memoryUsed: 14.2, memoryTotal: 80.0, temperature: 48, powerDraw: 112, powerLimit: 350 }
  ]);

  // Pre-seed 10-minute thermal history (60 points, every 10 seconds)
  const [thermalHistory, setThermalHistory] = useState<ThermalPoint[]>(() => {
    const data: ThermalPoint[] = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const timeStr = new Date(now.getTime() - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Calculate realistic thermal curves over the last 10 minutes:
      // GPU 0 has been running training/inference so it climbs from nominal to ~68-75C.
      // GPU 1 has been idling or moderately loaded, so it oscillates around 42-49C.
      const base0 = 48;
      const wave0 = Math.sin((59 - i) * 0.1) * 3;
      const drift0 = (59 - i) * 0.38; // slowly climbing
      const gpu0_temp = Math.min(82, Math.floor(base0 + wave0 + drift0));

      const base1 = 40;
      const wave1 = Math.cos((59 - i) * 0.08) * 1.5;
      const drift1 = (59 - i) * 0.12; // slight rising
      const gpu1_temp = Math.min(65, Math.floor(base1 + wave1 + drift1));

      data.push({
        time: timeStr,
        gpu0_temp,
        gpu1_temp,
      });
    }
    return data;
  });

  // Pre-seed telemetry history for immediate professional layout render
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const data: TelemetryPoint[] = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const timeStr = new Date(now.getTime() - i * 1500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      data.push({
        time: timeStr,
        gpu0_load: Math.floor(75 + Math.sin(i * 0.4) * 10),
        gpu0_vram: parseFloat((60.5 + Math.sin(i * 0.2) * 2).toFixed(1)),
        gpu0_temp: Math.floor(65 + Math.sin(i * 0.3) * 3),
        gpu1_load: Math.floor(10 + Math.cos(i * 0.4) * 3),
        gpu1_vram: parseFloat((14.0 + Math.cos(i * 0.2) * 0.5).toFixed(1)),
        gpu1_temp: Math.floor(46 + Math.cos(i * 0.3) * 2),
      });
    }
    return data;
  });

  // Handle active job simulation adjustments
  useEffect(() => {
    if (!isMonitoringActive) return;

    const interval = setInterval(() => {
      setGpuList((prevGpus) => {
        return prevGpus.map((gpu) => {
          let targetLoad = gpu.load;
          let targetVram = gpu.memoryUsed;
          let targetTemp = gpu.temperature;
          let targetPower = gpu.powerDraw;

          // Adjust targets based on the simulated workload
          if (activeJob === 'idle') {
            targetLoad = gpu.id === 0 ? 8 : 4;
            targetVram = gpu.id === 0 ? 8.4 : 6.2;
            targetTemp = gpu.id === 0 ? 42 : 39;
            targetPower = gpu.id === 0 ? 72 : 65;
          } else if (activeJob === 'llm') {
            // High utilization on GPU 0, moderate on GPU 1
            if (gpu.id === 0) {
              targetLoad = 94;
              targetVram = 76.8;
              targetTemp = 79;
              targetPower = 338;
            } else {
              targetLoad = 28;
              targetVram = 18.5;
              targetTemp = 52;
              targetPower = 145;
            }
          } else if (activeJob === 'folding') {
            // Intense distributed load on both
            if (gpu.id === 0) {
              targetLoad = 88;
              targetVram = 68.2;
              targetTemp = 74;
              targetPower = 310;
            } else {
              targetLoad = 82;
              targetVram = 64.5;
              targetTemp = 71;
              targetPower = 295;
            }
          } else if (activeJob === 'docking') {
            // Rapid fluctuating calculations on GPU 1
            if (gpu.id === 0) {
              targetLoad = 15;
              targetVram = 14.2;
              targetTemp = 48;
              targetPower = 110;
            } else {
              targetLoad = 91;
              targetVram = 74.0;
              targetTemp = 76;
              targetPower = 325;
            }
          }

          // Add subtle dynamic variance
          const loadVariance = Math.floor(Math.random() * 7) - 3;
          const tempVariance = Math.floor(Math.random() * 3) - 1;
          const vramVariance = parseFloat((Math.random() * 0.8 - 0.4).toFixed(1));
          const powerVariance = Math.floor(Math.random() * 11) - 5;

          const nextLoad = Math.max(2, Math.min(100, Math.round(targetLoad + loadVariance)));
          const nextTemp = Math.max(35, Math.min(85, Math.round(targetTemp + tempVariance)));
          const nextVram = Math.max(2.0, Math.min(gpu.memoryTotal, parseFloat((targetVram + vramVariance).toFixed(1))));
          const nextPower = Math.max(50, Math.min(gpu.powerLimit, Math.round(targetPower + powerVariance)));

          return {
            ...gpu,
            load: nextLoad,
            memoryUsed: nextVram,
            temperature: nextTemp,
            powerDraw: nextPower,
          };
        });
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJob, isMonitoringActive]);

  // Append new points to historical timeline
  useEffect(() => {
    if (!isMonitoringActive) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setTelemetryHistory((prev) => {
        const nextPoint: TelemetryPoint = {
          time: nowStr,
          gpu0_load: gpuList[0].load,
          gpu0_vram: gpuList[0].memoryUsed,
          gpu0_temp: gpuList[0].temperature,
          gpu1_load: gpuList[1].load,
          gpu1_vram: gpuList[1].memoryUsed,
          gpu1_temp: gpuList[1].temperature,
        };
        const updated = [...prev, nextPoint];
        if (updated.length > 25) {
          return updated.slice(updated.length - 25);
        }
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [gpuList, isMonitoringActive]);

  // Keep a ref of gpuList so the 10-second interval does not reset
  const gpuListRef = useRef(gpuList);
  useEffect(() => {
    gpuListRef.current = gpuList;
  }, [gpuList]);

  // Append new thermal points to 10-minute history every 10 seconds
  useEffect(() => {
    if (!isMonitoringActive) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentGpus = gpuListRef.current;
      setThermalHistory((prev) => {
        const nextPoint: ThermalPoint = {
          time: nowStr,
          gpu0_temp: currentGpus[0]?.temperature ?? 35,
          gpu1_temp: currentGpus[1]?.temperature ?? 35,
        };
        const updated = [...prev, nextPoint];
        if (updated.length > 60) {
          return updated.slice(updated.length - 60);
        }
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [isMonitoringActive]);

  const handleWorkloadChange = (job: typeof activeJob) => {
    setActiveJob(job);
    let jobLabel = "System Idle";
    if (job === 'llm') jobLabel = "ESM-3 3B LLM Training Node";
    if (job === 'folding') jobLabel = "AlphaFold v2 Protein Structure Folding";
    if (job === 'docking') jobLabel = "DiffDock Virtual Ligand Screening";

    toast.success(`Active Cluster Job Switched`, {
      description: `GPU state initialized for ${jobLabel}.`
    });
  };

  // Extract statistical metrics for the selected GPU
  const getCurrentStats = () => {
    const isGpu0 = activeGpuId === 0;
    const loads = telemetryHistory.map(h => isGpu0 ? h.gpu0_load : h.gpu1_load);
    const temps = telemetryHistory.map(h => isGpu0 ? h.gpu0_temp : h.gpu1_temp);
    
    const maxLoad = Math.max(...loads, 1);
    const avgLoad = Math.round(loads.reduce((a, b) => a + b, 0) / loads.length);
    const maxTemp = Math.max(...temps, 1);
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);

    return { maxLoad, avgLoad, maxTemp, avgTemp };
  };

  const currentStats = getCurrentStats();

  const getThermalRisk = () => {
    const temp0 = gpuList[0]?.temperature ?? 35;
    const temp1 = gpuList[1]?.temperature ?? 35;
    const load0 = gpuList[0]?.load ?? 0;
    const load1 = gpuList[1]?.load ?? 0;
    
    const maxTemp = Math.max(temp0, temp1);
    const maxLoad = Math.max(load0, load1);
    
    // Base temperature risk mapping: nominal of 35C is 0%, throttle limits at 85C is 100%
    let baseRisk = ((maxTemp - 35) / (85 - 35)) * 100;
    
    // Add load-induced stress multiplier if system runs hot (>60C)
    if (maxTemp > 60) {
      baseRisk += (maxLoad / 100) * 15;
    }
    
    const finalScore = Math.max(0, Math.min(100, Math.round(baseRisk)));
    
    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let barColor = 'bg-emerald-500';
    let bgGradient = 'from-emerald-500/10 to-transparent';
    let recommendation = 'Safe for all clinical modeling, large folding batches, and high-stress molecular docking tasks.';
    
    if (finalScore >= 80) {
      level = 'CRITICAL';
      colorClass = 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse';
      barColor = 'bg-rose-600';
      bgGradient = 'from-rose-500/20 to-transparent';
      recommendation = 'CRITICAL OVERHEAT WARNING: Clinicians are strongly advised to delay structural folding pipelines and complex docking jobs to prevent node-level thermal throttling.';
    } else if (finalScore >= 55) {
      level = 'HIGH';
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
      barColor = 'bg-amber-500';
      bgGradient = 'from-amber-500/20 to-transparent';
      recommendation = 'HIGH THERMAL STRESS: Please postpone or throttle multi-agent consensus validation runs and hardware-intensive sequence predictions.';
    } else if (finalScore >= 30) {
      level = 'MODERATE';
      colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200';
      barColor = 'bg-yellow-500';
      bgGradient = 'from-yellow-500/15 to-transparent';
      recommendation = 'MODERATE HEAT DISSIPATION: Hardware is operating within nominal stress parameters. Moderate clinical workloads can proceed safely.';
    }
    
    return { score: finalScore, level, colorClass, barColor, bgGradient, recommendation };
  };

  const thermalRisk = getThermalRisk();

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76B900] animate-pulse"></span>
              CLUSTER ONLINE
            </span>
            <span className="bg-slate-500/10 text-slate-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-slate-500/20">
              NVIDIA-SMI INFRASTRUCTURE
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Sliders className="w-8 h-8 text-[#76B900]" />
            GPU & System Monitoring
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Monitor real-time Hopper and Ampere architecture GPU cluster performance parameters. Inspect active VRAM offsets, hardware load ratios, and dynamic heat profiles under AI workloads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GPU details cards & Simulation Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Job Simulation Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">Workload Simulator</span>
                <h3 className="text-xs font-black text-slate-950 uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#76B900]" />
                  Trigger Heavy AI Job Loads
                </h3>
              </div>
              <button
                onClick={() => setIsMonitoringActive(!isMonitoringActive)}
                className={`px-3 py-1 rounded-lg border font-mono text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMonitoringActive 
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20' 
                    : 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/20 hover:bg-[#76B900]/30'
                }`}
              >
                {isMonitoringActive ? (
                  <>
                    <Pause className="w-3 h-3" />
                    PAUSE TELEMETRY
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    RESUME TELEMETRY
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleWorkloadChange('idle')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeJob === 'idle'
                    ? 'bg-[#76B900]/5 border-[#76B900]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">01 / LOW LOAD</span>
                <strong className="text-xs text-slate-900 font-black uppercase mt-1">Idle System</strong>
                <span className="text-[8.5px] text-slate-500 mt-1 leading-snug">Cooling state, basic dashboard operations</span>
              </button>

              <button
                onClick={() => handleWorkloadChange('llm')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeJob === 'llm'
                    ? 'bg-[#76B900]/5 border-[#76B900]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">02 / NLP MODEL</span>
                <strong className="text-xs text-slate-900 font-black uppercase mt-1">ESM-3 3B Model</strong>
                <span className="text-[8.5px] text-slate-500 mt-1 leading-snug">Heavy single-GPU load on GPU 0</span>
              </button>

              <button
                onClick={() => handleWorkloadChange('folding')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeJob === 'folding'
                    ? 'bg-[#76B900]/5 border-[#76B900]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">03 / STRUCTURAL AI</span>
                <strong className="text-xs text-slate-900 font-black uppercase mt-1">AlphaFold Pro</strong>
                <span className="text-[8.5px] text-slate-500 mt-1 leading-snug">Distributed load across both cluster nodes</span>
              </button>

              <button
                onClick={() => handleWorkloadChange('docking')}
                className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeJob === 'docking'
                    ? 'bg-[#76B900]/5 border-[#76B900]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">04 / MOLECULAR DYNAMICS</span>
                <strong className="text-xs text-slate-900 font-black uppercase mt-1">DiffDock Screening</strong>
                <span className="text-[8.5px] text-slate-500 mt-1 leading-snug">Active calculations focused on GPU 1</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gpuList.map((gpu) => (
              <div 
                key={gpu.id} 
                onClick={() => setActiveGpuId(gpu.id)}
                className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all cursor-pointer relative ${
                  activeGpuId === gpu.id 
                    ? 'border-[#76B900] ring-1 ring-[#76B900]/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {activeGpuId === gpu.id && (
                  <span className="absolute top-4 right-4 text-[7.5px] bg-[#76B900] text-black font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                    ACTIVE SOURCE
                  </span>
                )}
                
                <div className="flex items-center gap-2.5">
                  <Cpu className={`w-5 h-5 ${activeGpuId === gpu.id ? 'text-[#76B900]' : 'text-slate-400'}`} />
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">GPU ID: {gpu.id}</span>
                    <strong className="text-[11px] text-slate-950 font-black uppercase tracking-tight truncate max-w-[200px] block">{gpu.name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 font-mono text-[10px] pt-1">
                  
                  {/* GPU Core Load */}
                  <div className="space-y-1 p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">GPU CORE LOAD</span>
                    <strong className="text-base font-black text-slate-950">{gpu.load}%</strong>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-[#76B900] h-full transition-all duration-500" style={{ width: `${gpu.load}%` }} />
                    </div>
                  </div>

                  {/* GPU VRAM Allocated */}
                  <div className="space-y-1 p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">VRAM ALLOCATED</span>
                    <strong className="text-base font-black text-slate-950">{gpu.memoryUsed} GB</strong>
                    <span className="text-[7.5px] text-slate-400 font-bold block">of {gpu.memoryTotal} GB total</span>
                  </div>

                  {/* GPU Temperature */}
                  <div className="space-y-1 p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">CORE TEMP</span>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                      <strong className="text-base font-black text-slate-950">{gpu.temperature}°C</strong>
                    </div>
                    <span className="text-[7.5px] text-slate-400 font-bold block">Limit: 85°C</span>
                  </div>

                  {/* GPU Power Draw */}
                  <div className="space-y-1 p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">POWER DRAW</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <strong className="text-base font-black text-slate-950">{gpu.powerDraw} W</strong>
                    </div>
                    <span className="text-[7.5px] text-slate-400 font-bold block">Cap: {gpu.powerLimit} W</span>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* REAL-TIME GPU TELEMETRY CHART PANEL */}
          <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-2xl text-zinc-100 space-y-4">
            
            {/* Control Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">Real-time GPU Telemetry</span>
                <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#76B900]" />
                  WebGL Hardware Plot Timeline
                </h3>
              </div>
              
              {/* Layer toggles */}
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <button 
                  onClick={() => setShowLoad(!showLoad)}
                  className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                    showLoad 
                      ? 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/30 font-black' 
                      : 'bg-zinc-900/40 text-zinc-500 border-zinc-800'
                  }`}
                >
                  LOAD
                </button>
                <button 
                  onClick={() => setShowVram(!showVram)}
                  className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                    showVram 
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-black' 
                      : 'bg-zinc-900/40 text-zinc-500 border-zinc-800'
                  }`}
                >
                  VRAM
                </button>
                <button 
                  onClick={() => setShowTemp(!showTemp)}
                  className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                    showTemp 
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-black' 
                      : 'bg-zinc-900/40 text-zinc-500 border-zinc-800'
                  }`}
                >
                  TEMP
                </button>
              </div>
            </div>

            {/* Quick stats for active source */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[9px]">
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">ACTIVE NODE</span>
                <strong className="text-white uppercase">GPU {activeGpuId} (H100)</strong>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">AVG LOAD</span>
                <strong className="text-[#76B900] font-bold">{currentStats.avgLoad}%</strong>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">PEAK CORE LOAD</span>
                <strong className="text-white">{currentStats.maxLoad}%</strong>
              </div>
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">AVG TEMPERATURE</span>
                <strong className="text-orange-400">{currentStats.avgTemp}°C</strong>
              </div>
            </div>

            {/* Real-time Chart.js Telemetry View */}
            <div className="w-full h-64 bg-zinc-950/40 rounded-xl p-3 border border-zinc-900">
              <RealTimeGpuTelemetry
                telemetryHistory={telemetryHistory}
                activeGpuId={activeGpuId}
                showLoad={showLoad}
                showVram={showVram}
                showTemp={showTemp}
              />
            </div>

          </div>

          {/* 10-MINUTE TEMPERATURE STRESS HISTORICAL PLOT */}
          <GpuThermalStressTrend
            thermalHistory={thermalHistory}
            gpu0_name={gpuList[0].name}
            gpu1_name={gpuList[1].name}
          />

          {/* REAL-TIME GENOMIC KERNEL VRAM UTILIZATION CHART (D3) */}
          <GenomicKernelVramGraph activeJob={activeJob} onLatestVramChange={setLiveVrams} />

        </div>

        {/* Right Info panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* THERMAL THROTTLE RISK SCORE & ADVISORY SYSTEM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden">
            {/* Ambient indicator background glow */}
            <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${thermalRisk.bgGradient} rounded-full blur-2xl pointer-events-none`} />
            
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Core Hardware Safety</span>
              <h3 className="text-xs font-black text-slate-950 uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Thermal Throttle Risk
              </h3>
            </div>

            <div className="space-y-3 pt-1 relative z-10">
              {/* Score Display */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-950 font-mono tracking-tighter">
                    {thermalRisk.score}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider mt-0.5">ESTIMATED PROBABILITY</span>
                </div>
                
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${thermalRisk.colorClass}`}>
                  {thermalRisk.level} RISK
                </span>
              </div>

              {/* Dynamic Health Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full ${thermalRisk.barColor} transition-all duration-500`} style={{ width: `${thermalRisk.score}%` }} />
              </div>

              {/* Advisory Box */}
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Clinical Action Guideline
                </span>
                <p className="text-[9.5px] font-semibold text-slate-600 leading-relaxed">
                  {thermalRisk.recommendation}
                </p>
              </div>

              {/* Telemetry metadata footer */}
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-3">
                <span>PEAK TEMP: {Math.max(gpuList[0]?.temperature ?? 35, gpuList[1]?.temperature ?? 35)}°C</span>
                <span>SYSTEM TARGET: &lt; 85°C</span>
              </div>
            </div>
          </div>
          
          {/* Active Workload List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Active Instances</span>
              <h3 className="text-xs font-black text-slate-950 uppercase flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#76B900]" />
                Cluster Allocations
              </h3>
            </div>

            <div className="space-y-2 font-mono text-[9px]">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <strong className="text-slate-900 uppercase font-black">cuDF VCF Filter Kernel</strong>
                  <span className="text-[#76B900] font-bold">GPU 0</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Instance: container-cudf-vcf-01</span>
                  <span>{liveVrams.cudf_vcf.toFixed(1)} GB VRAM</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <strong className="text-slate-900 uppercase font-black">ESM-3 3B Variant Annotation</strong>
                  <span className="text-[#76B900] font-bold">GPU 0</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Instance: container-esm-3b-01</span>
                  <span>{liveVrams.esm_annotation.toFixed(1)} GB VRAM</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <strong className="text-slate-900 uppercase font-black">ESMFold Structure Predictor</strong>
                  <span className="text-cyan-500 font-bold">GPU 1</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Instance: container-esmfold-01</span>
                  <span>{liveVrams.esmfold.toFixed(1)} GB VRAM</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <strong className="text-slate-900 uppercase font-black">DiffDock Torsion Sim</strong>
                  <span className="text-cyan-500 font-bold">GPU 1</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Instance: container-diffdock-01</span>
                  <span>{liveVrams.diffdock.toFixed(1)} GB VRAM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Hardware Cluster Specs */}
          <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-xl text-zinc-400 space-y-4">
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Hardware Info</span>
              <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#76B900]" />
                Cluster Architecture
              </h3>
            </div>
            
            <div className="space-y-2.5 text-[9.5px] font-mono">
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span>GPU ARCH:</span>
                <strong className="text-zinc-200">Hopper GH100</strong>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span>VRAM TYPE:</span>
                <strong className="text-zinc-200">HBM3 ECC</strong>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span>TOTAL VRAM CAPACITY:</span>
                <strong className="text-zinc-200">160.0 GB</strong>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span>SYSTEM BUS:</span>
                <strong className="text-zinc-200">PCIe Gen 5 x16</strong>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span>NVIDIA NVLINK:</span>
                <strong className="text-[#76B900] font-bold">900 GB/s active</strong>
              </div>
              <div className="flex justify-between">
                <span>DRIVER THREADS:</span>
                <strong className="text-zinc-200">CUDA v12.2</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
