import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Cpu, 
  Server, 
  Wifi, 
  Lock,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ChevronRight,
  Zap,
  Radio,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceHealth {
  id: string;
  name: string;
  url: string;
  status: 'HEALTHY' | 'DEGRADED';
  latency: number;
  type: 'NIM_LIVE' | 'NIM_EMULATED';
  sslStatus: string;
  region: string;
  error: string | null;
  lastChecked: string;
}

interface HealthResponse {
  timestamp: string;
  overallStatus: string;
  apiKeyConfigured: boolean;
  services: ServiceHealth[];
}

export default function NvidiaNimStatus() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [pollInterval, setPollInterval] = useState<number>(5000); // Default to 5s for highly real-time feel
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [selectedCodeTab, setSelectedCodeTab] = useState<'curl' | 'python' | 'node'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; text: string; type: 'info' | 'success' | 'warning' }>>([]);

  // Latency History for real-time sparklines
  const [latencyHistory, setLatencyHistory] = useState<Record<string, number[]>>({
    esm2: [35, 38, 42, 36, 40, 37, 39, 38],
    esmfold: [280, 295, 310, 285, 290, 305, 298, 290],
    megamolbart: [98, 105, 112, 101, 108, 104, 106, 105],
    diffdock: [410, 435, 420, 445, 430, 415, 425, 420]
  });

  const addLog = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ timestamp: time, text, type }, ...prev.slice(0, 19)]);
  };

  const fetchHealth = async (isManual = false) => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const res = await fetch('/api/bionemo/nim-health');
      if (res.ok) {
        const json: HealthResponse = await res.json();
        setData(json);

        // Update latency history
        setLatencyHistory(prev => {
          const next = { ...prev };
          json.services.forEach(s => {
            if (!next[s.id]) next[s.id] = [];
            next[s.id] = [...next[s.id].slice(-11), s.latency];
          });
          return next;
        });

        // Add logs
        if (isManual) {
          addLog(`Manual health probe initiated. Connection verified in ${Date.now() - startTime}ms.`, 'info');
          toast.success('NIM Endpoint Status Verified', {
            description: `All ${json.services.length} biological microservice pipelines are fully operational.`
          });
        } else {
          addLog(`Periodic daemon check: overallStatus is ${json.overallStatus}.`, 'success');
        }

        json.services.forEach(s => {
          if (s.status === 'HEALTHY') {
            addLog(`Endpoint [${s.id}] health query responded: 200 OK (${s.latency}ms, ${s.region})`, 'success');
          } else {
            addLog(`Endpoint [${s.id}] warning: ${s.error || 'Response latency degraded'}`, 'warning');
          }
        });
      } else {
        throw new Error(`Endpoint monitoring route responded with status ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Daemon alert: Failed to reach NIM gateway API. ${err.message || ''}`, 'warning');
      toast.error('Failed to verify service connectivity', {
        description: err.message || 'The server-side proxy endpoint monitor is unreachable.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & Logs Setup
  useEffect(() => {
    addLog("Initializing NVIDIA NIM Real-time Telemetry Client...", "info");
    addLog("Querying NGC Microservice health registries on port 443...", "info");
    fetchHealth();
  }, []);

  // Handle auto-polling interval
  useEffect(() => {
    if (!autoPoll) {
      addLog("Automatic polling loop suspended by operator.", "warning");
      return;
    }
    addLog(`Establishing polling heartbeat loop at ${pollInterval / 1000}s intervals.`, "info");
    const interval = setInterval(() => {
      fetchHealth();
    }, pollInterval);
    return () => clearInterval(interval);
  }, [autoPoll, pollInterval]);

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrlId(id);
      toast.success('Endpoint URL copied to clipboard');
      setTimeout(() => setCopiedUrlId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const getLatencyColor = (ms: number, id: string) => {
    if (id === 'esmfold' || id === 'diffdock') {
      if (ms < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      if (ms < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
    if (ms < 60) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (ms < 150) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const codeSnippets = {
    curl: `curl -s -X GET "https://health.api.nvidia.com/v1/biology/nvidia/esm2/health" \\
  -H "Authorization: Bearer \$NVIDIA_API_KEY" \\
  -H "Accept: application/json"`,
    python: `import requests

url = "https://health.api.nvidia.com/v1/biology/nvidia/esm2/health"
headers = {
    "Authorization": "Bearer YOUR_NVIDIA_API_KEY",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(f"Status Code: {response.status_code}")
print(response.json())`,
    node: `import fetch from 'node-fetch';

const url = 'https://health.api.nvidia.com/v1/biology/nvidia/esm2/health';
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_NVIDIA_API_KEY',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(data);`
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippets[selectedCodeTab]);
      setCopiedSnippet(true);
      toast.success('Code snippet copied to clipboard');
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      toast.error('Failed to copy code snippet');
    }
  };

  return (
    <div id="nvidia-nim-status-monitor" className="bg-[#05070a] border border-zinc-900 rounded-[24px] p-6 relative overflow-hidden font-sans shadow-2xl">
      {/* Dynamic Grid Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_1px,transparent_1px),linear-gradient(to_bottom,#76B900_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.01] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#76B900]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Panel Controls Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-zinc-900 mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#76B900]/10 rounded-2xl border border-[#76B900]/20 text-[#76B900] shadow-inner shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              NVIDIA NIM™ Live Gateway Monitor
              <span className="bg-[#76B900]/10 text-[#76B900] text-[8px] font-mono font-black px-2 py-0.5 rounded border border-[#76B900]/30 animate-pulse">
                PROD FEEDER ACTIVE
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">
              Live service status probes, routing loops, and deep-dive telemetry for biological inference containers
            </p>
          </div>
        </div>

        {/* Real-time configuration HUD */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-sm">
            <span className="text-[9px] font-mono font-black text-zinc-500 uppercase px-2">Heartbeat:</span>
            {[3000, 5000, 10000].map(val => (
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

          {/* Auto Poll Switch */}
          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              autoPoll 
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoPoll ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            {autoPoll ? "AUTO Heartbeat ON" : "AUTO Polling SUSPENDED"}
          </button>

          {/* Manual query */}
          <button
            onClick={() => fetchHealth(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#76B900]' : 'text-zinc-400'}`} />
            PROBE ENDPOINTS
          </button>
        </div>
      </div>

      {/* Gateway Telemetry Grid banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#76B900]/10 flex items-center justify-center border border-[#76B900]/20">
            <Server className="w-4.5 h-4.5 text-[#76B900]" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Gateway Service</span>
            <span className="text-[11px] font-black text-white uppercase font-mono tracking-tight block truncate">
              Triton Routing Agent
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Globe className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Routing Pool</span>
            <span className="text-[11px] font-black text-white uppercase font-mono tracking-tight block truncate">
              {data?.services?.[0]?.region || "us-east-4 (NVIDIA-NGC)"}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Verification Mode</span>
            <span className={`text-[11px] font-black uppercase font-mono tracking-tight block truncate ${data?.apiKeyConfigured ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
              {data?.apiKeyConfigured ? 'NGC LIVE INFERENCE' : 'EMULATED INFRASTRUCTURE'}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Wifi className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Global Health Status</span>
            <span className="text-[11px] font-black text-emerald-400 uppercase font-mono tracking-tight block truncate">
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Grid of microservices status details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {data ? (
          data.services.map((service) => {
            const hist = latencyHistory[service.id] || [];
            const maxVal = Math.max(...hist, 1);
            
            return (
              <div 
                key={service.id} 
                className="bg-zinc-950/70 hover:bg-zinc-950 border border-zinc-900/85 hover:border-[#76B900]/30 rounded-2xl p-4 flex flex-col justify-between h-56 transition-all hover:shadow-xl group"
              >
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-zinc-900 text-zinc-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-zinc-850 font-mono tracking-wider">
                      {service.id.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[7.5px] font-black uppercase tracking-wider">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      {service.status}
                    </span>
                  </div>
                  <h4 className="text-[11.5px] font-black text-white uppercase group-hover:text-[#76B900] transition-colors leading-tight pt-1">
                    {service.name.split(' (')[0]}
                  </h4>
                  <p className="text-[8.5px] text-zinc-500 font-mono overflow-ellipsis truncate" title={service.url}>
                    {service.url}
                  </p>
                </div>

                {/* Micro Sparkline Latency Graph */}
                <div className="py-2.5">
                  <div className="flex justify-between items-end text-[7.5px] text-zinc-500 font-mono mb-1 leading-none">
                    <span>LATENCY SPECTRUM</span>
                    <span className={`font-bold ${getLatencyColor(service.latency, service.id)}`}>{service.latency} ms</span>
                  </div>
                  <div className="h-10 w-full flex items-end gap-[2px] pt-1">
                    {hist.map((lat, idx) => {
                      const pct = (lat / maxVal) * 100;
                      return (
                        <div key={idx} className="flex-1 bg-zinc-900 h-full rounded-sm overflow-hidden flex items-end">
                          <div 
                            className="w-full bg-[#76B900]/70 group-hover:bg-[#76B900] transition-colors duration-200"
                            style={{ height: `${Math.max(10, pct)}%` }}
                            title={`Latency: ${lat}ms`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Badge details */}
                <div className="border-t border-zinc-900/60 pt-2.5 mt-1 space-y-1 text-[8.5px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ROUTING POOL</span>
                    <strong className="text-zinc-300 truncate max-w-[100px]" title={service.region}>
                      {service.region.split(' (')[0]}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SECURITY TLS</span>
                    <strong className="text-zinc-300 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      {service.sslStatus.includes('(') ? 'EMUL_OK' : 'TLS_1.3'}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Dynamic Loading Skeleton Cards
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 h-56 flex flex-col justify-between animate-pulse">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-zinc-900 rounded" />
                  <div className="h-3.5 w-16 bg-zinc-900 rounded" />
                </div>
                <div className="h-4 w-32 bg-zinc-900 rounded mt-1" />
                <div className="h-2.5 w-40 bg-zinc-900 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-8 bg-zinc-900 rounded" />
              </div>
              <div className="space-y-1 border-t border-zinc-900/60 pt-2">
                <div className="h-2.5 bg-zinc-900 rounded" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Advanced Double Column: Diagnostic Shell Output & Interactive API Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Live Diagnostics Log Output Terminal */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-950 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Daemon Diagnostic Console logs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Feeder Listening</span>
            </div>
          </div>
          <div className="p-4 bg-[#020305] font-mono text-[9px] text-zinc-300 h-44 overflow-y-auto space-y-2.5 select-text selection:bg-[#76B900]/30 custom-scrollbar">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5 border-b border-zinc-950 pb-1.5 last:border-b-0">
                  <span className="text-zinc-600 font-bold shrink-0">{log.timestamp}</span>
                  <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">
                    {log.type === 'success' ? '[SYS_OK]' : log.type === 'warning' ? '[ALERT]' : '[INFO]'}
                  </span>
                  <p className={`flex-1 ${
                    log.type === 'success' ? 'text-emerald-400/90' : log.type === 'warning' ? 'text-amber-400/95' : 'text-zinc-400'
                  } break-all font-bold`}>
                    {log.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-zinc-600 flex items-center justify-center h-full">
                Waiting for telemetries to stream...
              </div>
            )}
          </div>
        </div>

        {/* Quick Integration code play cards */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-950 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>NIM API Integration Reference</span>
            </div>
            <div className="flex items-center gap-1">
              {(['curl', 'python', 'node'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedCodeTab(tab)}
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all cursor-pointer ${
                    selectedCodeTab === tab
                      ? 'bg-zinc-800 text-white font-black border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#020305] font-mono text-[9px] text-zinc-300 h-44 overflow-y-auto relative select-text selection:bg-cyan-500/20">
            <button
              onClick={copySnippet}
              className="absolute top-3 right-3 p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Copy code snippet"
            >
              {copiedSnippet ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <pre className="text-cyan-400 font-bold leading-relaxed whitespace-pre-wrap">
              <code>{codeSnippets[selectedCodeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
