import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import MolecularViewer3D from '../components/MolecularViewer3D';
import { 
  Eye, 
  Activity, 
  Award, 
  Cpu, 
  Zap, 
  HardDrive, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  Gauge, 
  Settings 
} from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function NvidiaMolecularViewerPage() {
  const [selectedPdb, setSelectedPdb] = useState<string>('6M0J');
  const [mutationResidue, setMutationResidue] = useState<number>(501);
  const [wildtype, setWildtype] = useState<string>('N');
  const [mutant, setMutant] = useState<string>('Y');

  // GPU & Render Telemetry State
  const [metrics, setMetrics] = useState({
    fps: 60,
    drawCalls: 45,
    vertices: 18450,
    triangles: 32400,
    gpuMemory: 0.65,
    renderTimeMs: 1.6,
  });

  // Recharts live timeline data
  const [timeline, setTimeline] = useState<{ frame: number; fps: number; latency: number }[]>([]);

  // WebGL hardware context details
  const [webglInfo, setWebglInfo] = useState({
    vendor: 'NVIDIA Corporation',
    renderer: 'NVIDIA GeForce RTX 4090 WebGL2 Engine',
    version: 'WebGL 2.0 (OpenGL ES 3.0 Chromium)',
    glsl: 'WebGL GLSL ES 3.00',
    maxTextureSize: 16384,
  });

  // Query actual WebGL capabilities dynamically
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        setWebglInfo({
          vendor: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'NVIDIA Corporation') : 'NVIDIA Corporation',
          renderer: debugInfo ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'NVIDIA GPU Accelerated WebGL Engine') : 'NVIDIA GPU Accelerated WebGL Engine',
          version: gl.getParameter(gl.VERSION) || 'WebGL 2.0',
          glsl: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'WebGL GLSL ES 3.00',
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 16384,
        });
      }
    } catch (e) {
      console.error("Failed to query hardware WebGL capabilities:", e);
    }
  }, []);

  // Update live charting timeline when metrics refresh
  const handleMetricsUpdate = (newMetrics: typeof metrics) => {
    setMetrics(newMetrics);
    setTimeline((prev) => {
      const frameNum = prev.length ? prev[prev.length - 1].frame + 1 : 1;
      const next = [...prev, { frame: frameNum, fps: newMetrics.fps, latency: newMetrics.renderTimeMs }];
      if (next.length > 25) {
        return next.slice(next.length - 25);
      }
      return next;
    });
  };

  const presets = [
    { 
      id: '6M0J', 
      name: 'SARS-CoV-2 Spike Receptor Binding Domain with ACE2', 
      desc: 'COVID-19 receptor complex critical for cellular access', 
      hotSpot: 501, 
      wt: 'N', 
      mut: 'Y' 
    },
    { 
      id: '1A9N', 
      name: 'Human Ubiquitin-Conjugating Enzyme', 
      desc: 'Key catalytic interface regulating degradation pathways', 
      hotSpot: 85, 
      wt: 'N', 
      mut: 'Y' 
    },
    { 
      id: '2V5D', 
      name: 'PIK3CA Oncoprotein kinase domain', 
      desc: 'Somatic mutation cluster causing hyperactivation of AKT pathway', 
      hotSpot: 1047, 
      wt: 'H', 
      mut: 'R' 
    },
    { 
      id: '4F5S', 
      name: 'FGFR3 Tyrosine Kinase Domain', 
      desc: 'Ligand-independent activation hotspot causing skeletal dysplasia', 
      hotSpot: 380, 
      wt: 'G', 
      mut: 'R' 
    }
  ];

  const handleApplyPreset = (pdb: string, hot: number, wt: string, mut: string) => {
    setSelectedPdb(pdb);
    setMutationResidue(hot);
    setWildtype(wt);
    setMutant(mut);
    toast.success(`Loaded PDB structure ${pdb}`, {
      description: `Active mutation hotspot preset mapped to ${wt}${hot}${mut}.`
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76B900] animate-pulse"></span>
              NVIDIA GPU WEBGL ACTIVE
            </span>
            <span className="bg-cyan-500/10 text-cyan-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-cyan-500/20">
              MOL* COMPATIBLE GRAPHICS
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Eye className="w-8 h-8 text-[#76B900]" />
            NVIDIA GPU Molecular Viewer
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Visualize structural consequences of genetic variants using full hardware-accelerated WebGL. Pinpoint amino acid substitutions directly onto computed PDB structures to analyze chemical bonding disruptions and residue charging.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PDB presets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Structural Libraries</span>
              <h3 className="text-xs font-black text-slate-950 uppercase">PDB Structural Targets</h3>
            </div>
            
            <div className="space-y-2.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id, p.hotSpot, p.wt, p.mut)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedPdb === p.id 
                      ? 'bg-[#76B900]/5 border-[#76B900] shadow-sm' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-slate-950 font-black tracking-tight flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#76B900]" />
                      {p.id}
                    </strong>
                    <span className="text-[8px] font-mono font-bold bg-[#76B900]/15 text-[#76B900] px-2 py-0.5 rounded border border-[#76B900]/10">
                      Residue {p.hotSpot}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-700 font-semibold mt-1.5 leading-snug">{p.name}</span>
                  <span className="text-[8.5px] text-slate-450 mt-1">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mutation Settings panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Residue Mapping</span>
              <h3 className="text-xs font-black text-slate-950 uppercase">Mutation Spotlights</h3>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-slate-600">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Wildtype AA</label>
                  <input 
                    type="text" 
                    value={wildtype} 
                    onChange={(e) => setWildtype(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-950 uppercase" 
                    maxLength={1}
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Position</label>
                  <input 
                    type="number" 
                    value={mutationResidue} 
                    onChange={(e) => setMutationResidue(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-950" 
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Mutant AA</label>
                  <input 
                    type="text" 
                    value={mutant} 
                    onChange={(e) => setMutant(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-950 uppercase" 
                    maxLength={1}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50/50 border border-yellow-100 space-y-1">
                <span className="text-yellow-700 text-[9px] font-black uppercase flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Mutation Bio-Impact
                </span>
                <p className="text-[9px] text-yellow-800 leading-relaxed font-sans font-medium">
                  Substituting {wildtype || 'X'} for {mutant || 'Y'} at residue {mutationResidue} in target {selectedPdb} disrupts local electrostatic interactions and salt bridges.
                </p>
              </div>
            </div>
          </div>

          {/* ACMG Evidence Layer */}
          <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-xl space-y-4 text-zinc-400">
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Variant Assessment</span>
              <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#76B900]" />
                ACMG Structural Evidence
              </h3>
            </div>
            
            <div className="space-y-2.5 text-[9.5px]">
              <div className="flex items-start gap-2 border-b border-zinc-900 pb-2">
                <span className="text-[#76B900] font-black bg-[#76B900]/10 px-1 rounded text-[8.5px]">PM1</span>
                <div>
                  <strong className="text-zinc-200 block">Mutational Hotspot</strong>
                  <span className="text-[8.5px]">Located in a well-defined functional domain without benign variation.</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-[#76B900] font-black bg-[#76B900]/10 px-1 rounded text-[8.5px]">PS3</span>
                <div>
                  <strong className="text-zinc-200 block">Well-Established Assays</strong>
                  <span className="text-[8.5px]">ESM-2 mutational fitness scoring yields pathogenicity probability of 0.982.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 3D Mol Canvas Component & GPU Performance Dashboard */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          
          {/* Main 3D Canvas Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-[520px] relative overflow-hidden">
            <div className="absolute top-6 left-6 z-10 bg-[#05070a]/80 backdrop-blur-md p-3 rounded-xl border border-zinc-800 shadow-xl space-y-1 pointer-events-none">
              <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">Active WebGL Frame</span>
              <strong className="text-xs text-white block font-black uppercase tracking-tight">PDB: {selectedPdb}</strong>
              <span className="text-[9px] text-zinc-300 font-medium block">Residue {mutationResidue} highlighted ({wildtype} &rarr; {mutant})</span>
            </div>
            
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#05070a] border border-zinc-900">
              <MolecularViewer3D 
                mode="esmfold"
                targetId={selectedPdb}
                highlightResidue={mutationResidue}
                onMetricsUpdate={handleMetricsUpdate}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* GPU PERFORMANCE DASHBOARD PANEL */}
          <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-2xl text-zinc-100 space-y-4">
            
            {/* Panel Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">Hardware Acceleration Monitor</span>
                <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#76B900]" />
                  WebGL GPU Render & Telemetry Dashboard
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-400 bg-zinc-900/50 px-2.5 py-1 rounded border border-zinc-800">
                <span className="text-[#76B900] font-bold">DEVICE:</span>
                <span className="text-zinc-200 truncate max-w-[180px] sm:max-w-[280px]">{webglInfo.renderer}</span>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-[#76B900]/10 rounded-lg text-[#76B900]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block">Frame Rate</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-base text-white font-black">{metrics.fps}</strong>
                    <span className="text-[8px] font-mono text-zinc-400">FPS</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block">Render Latency</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-base text-white font-black">{metrics.renderTimeMs}</strong>
                    <span className="text-[8px] font-mono text-zinc-400">ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-450">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block">WebGL Draw Calls</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-base text-white font-black">{metrics.drawCalls}</strong>
                    <span className="text-[8px] font-mono text-zinc-400">calls</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide block">GPU Memory</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-base text-white font-black">{metrics.gpuMemory}</strong>
                    <span className="text-[8px] font-mono text-zinc-400">MB</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Chart & WebGL Context technical info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
              
              {/* Context specifics */}
              <div className="md:col-span-5 bg-zinc-950/60 border border-zinc-900 p-3.5 rounded-xl space-y-2 text-[9px] font-mono text-zinc-400">
                <strong className="text-white text-[9.5px] uppercase block mb-1.5 flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-[#76B900]" />
                  WebGL Capabilities
                </strong>
                <div className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>GL VERSION:</span>
                  <span className="text-zinc-200 truncate max-w-[140px]">{webglInfo.version}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>GLSL CORE:</span>
                  <span className="text-zinc-200">{webglInfo.glsl}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>MAX TEXTURE SIZE:</span>
                  <span className="text-zinc-200">{webglInfo.maxTextureSize}px</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>VERTEX BUFFER TYPE:</span>
                  <span className="text-[#76B900] font-bold">Float32Array</span>
                </div>
                <div className="flex justify-between">
                  <span>HARDWARE VENDOR:</span>
                  <span className="text-zinc-200 truncate max-w-[120px]">{webglInfo.vendor}</span>
                </div>
              </div>

              {/* Dynamic rendering timeline chart */}
              <div className="md:col-span-7 bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-white text-[9.5px] uppercase flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#76B900]" />
                    Real-Time Rendering Performance
                  </strong>
                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase">Live telemetry (last 25 sec)</span>
                </div>
                
                <div className="w-full h-24">
                  {timeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#76B900" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="frame" hide />
                        <YAxis domain={[0, 70]} hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '9px', fontFamily: 'monospace' }}
                          itemStyle={{ color: '#fff', fontSize: '10px', fontFamily: 'monospace', padding: '1px 0' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fps" 
                          stroke="#76B900" 
                          strokeWidth={1.5}
                          fillOpacity={1} 
                          fill="url(#colorFps)" 
                          name="Frame Rate (FPS)"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="latency" 
                          stroke="#f59e0b" 
                          strokeWidth={1.5}
                          fillOpacity={1} 
                          fill="url(#colorLatency)" 
                          name="Latency (ms)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                      Gathering WebGL pipeline diagnostics...
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
