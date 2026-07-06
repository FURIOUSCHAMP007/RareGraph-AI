import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Activity,
  Droplet,
  Thermometer,
  Wind,
  Settings,
  Zap,
  RefreshCw,
  Plus,
  Play,
  Pause,
  AlertCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Terminal,
  Clock,
  FlaskConical,
  Gauge,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface BioreactorMetrics {
  timestampMs: number;
  timeString: string;
  ph: number;
  temperature: number;
  dissolvedOxygen: number;
  biomass: number;
  agitation: number;
  feedRate: number;
}

interface BioreactorResponse {
  status: string;
  statusMessage: string;
  currentTime: string;
  apiKeyConfigured: boolean;
  current: BioreactorMetrics;
  history: BioreactorMetrics[];
}

export default function BioreactorStatus() {
  const [data, setData] = useState<BioreactorMetrics[]>([]);
  const [current, setCurrent] = useState<BioreactorMetrics | null>(null);
  const [status, setStatus] = useState<string>("STABLE");
  const [statusMsg, setStatusMsg] = useState<string>("Initializing bioreactor stream...");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ph' | 'temp' | 'do' | 'biomass'>('all');
  
  // Controls state
  const [isLive, setIsLive] = useState<boolean>(true);
  const [pollInterval, setPollInterval] = useState<number>(3000); // 3 seconds real-time update
  const [agentActionMode, setAgentActionMode] = useState<'autonomous' | 'manual'>('autonomous');
  
  // Custom action states to simulate active corrections
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [reactorLogs, setReactorLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'alert' | 'agent' }>>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'alert' | 'agent' = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setReactorLogs(prev => [{ time: timeStr, msg, type }, ...prev.slice(0, 15)]);
  };

  const exportTelemetryToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No Telemetry Data Available", {
        description: "The fermentation stream buffer is empty. Please wait for live data."
      });
      return;
    }

    // Define CSV Headers
    const headers = [
      'Timestamp (ms)',
      'Time String',
      'pH',
      'Temperature (°C)',
      'Dissolved Oxygen (% dO₂)',
      'Biomass (g/L)',
      'Agitation (RPM)',
      'Feed Rate (mL/min)'
    ];
    
    // Map rows
    const csvRows = data.map(row => [
      row.timestampMs,
      `"${row.timeString}"`,
      row.ph,
      row.temperature,
      row.dissolvedOxygen,
      row.biomass,
      row.agitation,
      row.feedRate
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');

    // Generate blob and initiate download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestampString = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('download', `bioreactor_telemetry_export_${timestampString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog("Fermentation telemetry data exported to CSV.", "success");
    toast.success("Telemetry Exported Successfully", {
      description: `Downloaded ${data.length} telemetry records to CSV.`
    });
  };

  const fetchBioreactorData = async (isManual = false) => {
    try {
      const response = await fetch('/api/bionemo/bioreactor-stream');
      if (response.ok) {
        const json: BioreactorResponse = await response.json();
        setCurrent(json.current);
        setStatus(json.status);
        setStatusMsg(json.statusMessage);
        
        setData(prev => {
          // If we have no previous data, populate with history from backend
          if (prev.length === 0) {
            return json.history;
          }
          // Otherwise, append the current point and keep last 20 points
          const updated = [...prev, json.current];
          if (updated.length > 20) {
            return updated.slice(updated.length - 20);
          }
          return updated;
        });

        if (isManual) {
          addLog("Bioreactor telemetry polled manually via NGC telemetry node.", "success");
          toast.success("Bioreactor State Updated", {
            description: "Live fermentation process parameters successfully updated."
          });
        }
      } else {
        throw new Error("Proxy error while fetching bioreactor telemetry stream.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Stream Error: ${err.message || 'Server connection failed'}`, 'alert');
    } finally {
      setLoading(false);
    }
  };

  // Setup initial polling & default events
  useEffect(() => {
    addLog("Bioreactor telemetry interface bound to Port 3000.", "info");
    addLog("Initializing real-time protein expressions via NIM agent control logic.", "agent");
    fetchBioreactorData();

    // Setup periodic logging of biological optimizations
    const logsInterval = setInterval(() => {
      const events = [
        { msg: "NIM ESMfold model optimizes structural stability of secretion peptide.", type: "agent" as const },
        { msg: "Automated pH sensor checks calibration against buffer cell.", type: "info" as const },
        { msg: "DO levels steady. Cell respiration coefficient (RQ) is 0.92.", type: "success" as const },
        { msg: "Continuous feeding loop calculated: 1.25 mL/min glucose vector.", type: "info" as const },
        { msg: "BioNeMo agents run zero-shot scanning to verify plasmid stability.", type: "agent" as const },
        { msg: "Cooling jacket activates to balance metabolic heat coefficient.", type: "info" as const }
      ];
      const selected = events[Math.floor(Math.random() * events.length)];
      addLog(selected.msg, selected.type);
    }, 12000);

    return () => clearInterval(logsInterval);
  }, []);

  // Sync polling intervals
  useEffect(() => {
    if (!isLive) return;
    const t = setInterval(() => {
      fetchBioreactorData();
    }, pollInterval);
    return () => clearInterval(t);
  }, [isLive, pollInterval]);

  // Simulate bioreactor corrective actions
  const triggerCorrection = (type: 'acid' | 'base' | 'o2' | 'feed') => {
    if (actionInProgress) return;
    
    let actionName = "";
    let completionMsg = "";
    let logMsg = "";
    
    if (type === 'acid') {
      actionName = "Acid Injection Loop";
      logMsg = "Initiating phosphoric acid injection to counter basic pH drift.";
      completionMsg = "pH corrected to 7.15. Injection valve sealed.";
    } else if (type === 'base') {
      actionName = "Sodium Carbonate Flush";
      logMsg = "Injecting sodium carbonate buffer to raise acidotic pH.";
      completionMsg = "pH restored to 7.21. Buffer stabilization completed.";
    } else if (type === 'o2') {
      actionName = "Pure Oxygen Flush";
      logMsg = "Boosting sparger gas ratio to 95% pure O₂.";
      completionMsg = "Dissolved oxygen saturated at 82%. Respiration rate normal.";
    } else if (type === 'feed') {
      actionName = "Glucose Vector Feed Pulse";
      logMsg = "Pushing accelerated nutrient feed pulse to accelerate cell density growth.";
      completionMsg = "15mL glucose vector administered. Cell division coefficient peaked.";
    }

    setActionInProgress(actionName);
    addLog(`Operator Action: ${logMsg}`, 'info');
    toast.info(`Triggered: ${actionName}`, {
      description: "NIM controller is regulating process parameters."
    });

    // Artificially modify the live states locally for instant client feedback
    setTimeout(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        if (type === 'acid') last.ph = parseFloat((last.ph - 0.12).toFixed(2));
        if (type === 'base') last.ph = parseFloat((last.ph + 0.14).toFixed(2));
        if (type === 'o2') last.dissolvedOxygen = parseFloat(Math.min(95, last.dissolvedOxygen + 25).toFixed(1));
        if (type === 'feed') {
          last.biomass = parseFloat((last.biomass + 1.25).toFixed(2));
          last.feedRate = 4.5;
        }
        return [...prev.slice(0, -1), last];
      });
      
      if (current) {
        const nextCurrent = { ...current };
        if (type === 'acid') nextCurrent.ph = parseFloat((nextCurrent.ph - 0.12).toFixed(2));
        if (type === 'base') nextCurrent.ph = parseFloat((nextCurrent.ph + 0.14).toFixed(2));
        if (type === 'o2') nextCurrent.dissolvedOxygen = parseFloat(Math.min(95, nextCurrent.dissolvedOxygen + 25).toFixed(1));
        if (type === 'feed') {
          nextCurrent.biomass = parseFloat((nextCurrent.biomass + 1.25).toFixed(2));
          nextCurrent.feedRate = 4.5;
        }
        setCurrent(nextCurrent);
      }

      addLog(`NIM Process Controller: ${completionMsg}`, 'success');
      toast.success(`${actionName} Complete`, {
        description: "Fermenter telemetry successfully stabilized."
      });
      setActionInProgress(null);
    }, 2500);
  };

  // Color helpers
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'STABLE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'ACID_ACCUMULATION': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'SPARGER_BOOST': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'FEED_SUSPENDED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const currentPh = current?.ph ?? 7.18;
  const currentTemp = current?.temperature ?? 37.04;
  const currentDo = current?.dissolvedOxygen ?? 62.4;
  const currentBiomass = current?.biomass ?? 8.42;
  const currentAgitation = current?.agitation ?? 352;
  const currentFeed = current?.feedRate ?? 1.12;

  return (
    <div id="bioreactor-process-monitor" className="bg-[#05070a] border border-zinc-900 rounded-[24px] p-6 relative overflow-hidden font-sans shadow-2xl">
      {/* Grid Pattern Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_1px,transparent_1px),linear-gradient(to_bottom,#76B900_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.015] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#76B900]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-zinc-900 mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#76B900]/10 rounded-2xl border border-[#76B900]/20 text-[#76B900] shadow-inner shrink-0 mt-0.5">
            <FlaskConical className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              NIM-Controlled Bioreactor State
              <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded border animate-pulse ${getStatusColor(status)}`}>
                {status}
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">
              Process parameters for expression pipelines of ESMFold folded biological compounds
            </p>
          </div>
        </div>

        {/* Real-time controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Loop Interval Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-sm">
            <span className="text-[9px] font-mono font-black text-zinc-500 uppercase px-2">Stream Rate:</span>
            {[1000, 3000, 5000].map(val => (
              <button
                key={val}
                onClick={() => setPollInterval(val)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase transition-all cursor-pointer ${
                  pollInterval === val
                    ? 'bg-[#76B900] text-black shadow-md'
                    : 'bg-transparent text-zinc-500 hover:text-white'
                }`}
              >
                {val / 1000}s
              </button>
            ))}
          </div>

          {/* Autoplay toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              isLive 
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isLive ? "LIVE STREAM ACTIVE" : "STREAM PAUSED"}
          </button>

          {/* Manual Query */}
          <button
            onClick={() => fetchBioreactorData(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#76B900]' : 'text-zinc-400'}`} />
            REFRESH
          </button>

          {/* Export telemetry data as CSV */}
          <button
            onClick={exportTelemetryToCSV}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export fermentation telemetry data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            EXPORT CSV
          </button>
        </div>
      </div>

      {/* Critical telemetry display dials */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        
        {/* pH Card */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between h-32 group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Hydrogen Ion Index</span>
            <Droplet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-white font-mono">{currentPh.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1.5">pH</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-zinc-500 uppercase">Target range</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">7.10 - 7.30</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between h-32 group hover:border-rose-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Thermal Chamber</span>
            <Thermometer className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-white font-mono">{currentTemp.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1.5">°C</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-zinc-500 uppercase">Target range</span>
            <span className="text-rose-400 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">36.8 - 37.2</span>
          </div>
        </div>

        {/* DO Card */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between h-32 group hover:border-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Dissolved Oxygen</span>
            <Wind className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-black text-white font-mono">{currentDo.toFixed(1)}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1.5">% dO₂</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-zinc-500 uppercase">Critical low</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/10">&gt; 40.0%</span>
          </div>
        </div>

        {/* Biomass Density Card */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between h-32 group hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Cell Biomass</span>
            <Activity className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-1 flex items-baseline">
            <span className="text-2xl font-black text-white font-mono">{currentBiomass.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1.5">g/L density</span>
            <TrendingUp className="w-3 h-3 text-emerald-400 ml-2 animate-bounce" />
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-zinc-500 uppercase">Growth Status</span>
            <span className="text-amber-400 font-bold bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">EXPONENTIAL PHASE</span>
          </div>
        </div>

      </div>

      {/* Main Graph Content and Tab Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 relative z-10">
        
        {/* Real-time Graph Visualizer */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-2xl border border-zinc-900 p-5 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-0.5">
              <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Process Analytics</span>
              <h4 className="text-xs font-black text-white uppercase tracking-tight">Real-time Fermentation Spectrum Chart</h4>
            </div>

            {/* Metric Tab Selector */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-850">
              {(['all', 'ph', 'temp', 'do', 'biomass'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#76B900] text-black font-black'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All Metrics' : tab === 'temp' ? 'Temp' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full bg-[#020305] rounded-xl border border-zinc-900/60 p-2 relative">
            {data.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500 font-mono text-[10px]">
                <RefreshCw className="w-6 h-6 animate-spin text-[#76B900]" />
                <span>Synchronizing telemetry coordinate buffers...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis 
                    dataKey="timeString" 
                    stroke="#52525b" 
                    fontSize={8} 
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={8} 
                    fontFamily="monospace"
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#05070a', 
                      borderColor: '#18181b', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace',
                      fontSize: '9px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', paddingTop: '10px' }}
                  />

                  {/* Dynamic Area / Line Rendering depending on tab selected */}
                  {(activeTab === 'all' || activeTab === 'ph') && (
                    <Area 
                      type="monotone" 
                      dataKey="ph" 
                      name="pH level" 
                      stroke="#34d399" 
                      fillOpacity={1} 
                      fill="url(#colorPh)" 
                      strokeWidth={2}
                    />
                  )}
                  {(activeTab === 'all' || activeTab === 'temp') && (
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      name="Temp (°C)" 
                      stroke="#f87171" 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      strokeWidth={2}
                    />
                  )}
                  {(activeTab === 'all' || activeTab === 'do') && (
                    <Area 
                      type="monotone" 
                      dataKey="dissolvedOxygen" 
                      name="DO %" 
                      stroke="#22d3ee" 
                      fillOpacity={1} 
                      fill="url(#colorDo)" 
                      strokeWidth={2}
                    />
                  )}
                  {(activeTab === 'all' || activeTab === 'biomass') && (
                    <Area 
                      type="monotone" 
                      dataKey="biomass" 
                      name="Biomass (g/L)" 
                      stroke="#fbbf24" 
                      fillOpacity={1} 
                      fill="url(#colorBiomass)" 
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Diagnostic Logs Sidebar */}
        <div className="lg:col-span-4 bg-zinc-950 rounded-2xl border border-zinc-900 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-0.5 mb-3">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Event stream</span>
            <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#76B900]" />
              Bioprocess Diagnostic Logs
            </h4>
          </div>

          <div className="flex-1 min-h-[180px] bg-[#020305] rounded-xl border border-zinc-900/60 p-3 overflow-y-auto space-y-2 font-mono text-[8px] custom-scrollbar">
            {reactorLogs.length > 0 ? (
              reactorLogs.map((log, idx) => (
                <div key={idx} className="border-b border-zinc-900/30 pb-1.5 last:border-b-0 flex items-start gap-1.5">
                  <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                  <p className={`flex-1 ${
                    log.type === 'alert' ? 'text-rose-400 font-bold' :
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'agent' ? 'text-[#76B900] font-black' : 'text-zinc-400'
                  }`}>
                    {log.type === 'agent' && <Sparkles className="w-2.5 h-2.5 inline mr-1 text-[#76B900]" />}
                    {log.msg}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                Listening for fermenter telemetry signals...
              </div>
            )}
          </div>

          <div className="border-t border-zinc-900/50 pt-3 mt-3 flex items-center justify-between text-[8px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              POLLING RATE: {pollInterval / 1000}s
            </span>
            <span className="uppercase text-[#76B900] animate-pulse">
              ● AGENT CONNECTED
            </span>
          </div>
        </div>

      </div>

      {/* Operator Override Commands and Micro-adjustments */}
      <div className="bg-zinc-950/40 rounded-2xl border border-zinc-900 p-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-0.5">
            <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Interactive overrides</span>
            <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#76B900]" />
              Automated Process Controller Tweaks
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setAgentActionMode('autonomous');
                addLog("Switched back to NVIDIA Autonomous NIM orchestration agent.", "agent");
              }}
              className={`px-3 py-1 rounded text-[8.5px] font-mono font-black uppercase border transition-all cursor-pointer ${
                agentActionMode === 'autonomous'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                  : 'bg-transparent text-zinc-500 border-transparent hover:text-white'
              }`}
            >
              Autonomous Agent AI Loop
            </button>
            <button
              onClick={() => {
                setAgentActionMode('manual');
                addLog("Operator overrides enabled. Direct microservice controls active.", "info");
              }}
              className={`px-3 py-1 rounded text-[8.5px] font-mono font-black uppercase border transition-all cursor-pointer ${
                agentActionMode === 'manual'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                  : 'bg-transparent text-zinc-500 border-transparent hover:text-white'
              }`}
            >
              Manual Override
            </button>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => triggerCorrection('feed')}
            disabled={!!actionInProgress || agentActionMode === 'autonomous'}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-[#76B900]/40 text-zinc-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Plus className="w-4 h-4 text-[#76B900] group-hover:scale-115 transition-transform" />
            Feed Nutrient Pulse
          </button>

          <button
            onClick={() => triggerCorrection('o2')}
            disabled={!!actionInProgress || agentActionMode === 'autonomous'}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-[#76B900]/40 text-zinc-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Wind className="w-4 h-4 text-cyan-400 group-hover:scale-115 transition-transform" />
            Flush Pure Oxygen
          </button>

          <button
            onClick={() => triggerCorrection('base')}
            disabled={!!actionInProgress || agentActionMode === 'autonomous'}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-[#76B900]/40 text-zinc-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Droplet className="w-4 h-4 text-emerald-400 group-hover:scale-115 transition-transform" />
            Inject Carbonate Base
          </button>

          <button
            onClick={() => triggerCorrection('acid')}
            disabled={!!actionInProgress || agentActionMode === 'autonomous'}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-[#76B900]/40 text-zinc-300 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 group-hover:scale-115 transition-transform" />
            Counteract pH Drift
          </button>
        </div>

        {/* Loading/Action Overlay HUD */}
        <AnimatePresence>
          {actionInProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020305]/90 rounded-2xl flex flex-col items-center justify-center gap-3 z-30 font-mono text-[10px]"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#76B900]" />
                <Zap className="w-3.5 h-3.5 text-[#76B900] absolute animate-pulse" />
              </div>
              <span className="text-white font-black uppercase tracking-widest">{actionInProgress} ACTIVE</span>
              <span className="text-zinc-500 text-[8px] animate-pulse">VALVES ADJUSTING • FEEDBACK CHANNELS SYNCING</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
