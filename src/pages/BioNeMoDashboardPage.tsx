import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BioNeMoDashboard from '../components/BioNeMoDashboard';
import { 
  Cpu, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Server, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useNIMHealth } from '../hooks/useNIMHealth';

export default function BioNeMoDashboardPage() {
  const {
    services,
    overallStatus,
    apiKeyConfigured,
    isLoading,
    isRefetching,
    error,
    refetch,
    healthData
  } = useNIMHealth();

  const [showDetails, setShowDetails] = useState(false);

  // Helper to get status pill styling and icon
  const getStatusConfig = () => {
    if (isLoading && !healthData) {
      return {
        bg: 'bg-blue-50/50 border-blue-100 text-blue-700',
        dot: 'bg-blue-500 animate-pulse',
        label: 'INITIALIZING MONITOR',
        icon: <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      };
    }
    if (error) {
      return {
        bg: 'bg-rose-50 border-rose-100 text-rose-700',
        dot: 'bg-rose-500',
        label: 'CONNECTION OFFLINE',
        icon: <XCircle className="w-4 h-4 text-rose-500" />
      };
    }
    if (overallStatus === 'DEGRADED') {
      return {
        bg: 'bg-amber-50 border-amber-100 text-amber-700',
        dot: 'bg-amber-500 animate-pulse',
        label: 'NIM DEGRADED',
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500 animate-ping-slow',
      label: 'NIM OPERATIONAL',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    };
  };

  const statusConfig = getStatusConfig();

  // Format a compact time string for "Last Checked"
  const formattedTime = healthData?.timestamp 
    ? new Date(healthData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-emerald-500/20">
              Generative AI Hub
            </span>
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20">
              NVIDIA BioNeMo™
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-[#76B900]" />
            NVIDIA BioNeMo™ Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Interact with state-of-the-art biological foundation models. Run ESM-2 zero-shot mutational scanning,
            predict high-fidelity protein folds using ESMFold, optimize chemical analogs via MegaMolBART, or simulate rigid and flexible docking with DiffDock.
          </p>
        </div>

        {/* Real-time Service Health Polling Monitor */}
        <div className="w-full xl:w-auto shrink-0 self-start xl:self-center">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm p-4 min-w-[320px] xl:w-[380px] space-y-3 relative overflow-hidden">
            
            {/* Health Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dot}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dot.split(' ')[0]}`} />
                </span>
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-700">
                  {statusConfig.label}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading || isRefetching}
                  className="p-1.5 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-300 disabled:opacity-50 cursor-pointer"
                  title="Manual Health Check Ping"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefetching || (isLoading && !healthData) ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1.5 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-300 flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>Stats</span>
                </button>
              </div>
            </div>

            {/* Core Info Row */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 border-t border-slate-150 pt-2.5">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>Source:</span>
                {apiKeyConfigured ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1 border border-emerald-200 uppercase">
                    <ShieldCheck className="w-2.5 h-2.5" /> NGC Live
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[9px] font-mono px-1.5 py-0.5 rounded-sm border border-slate-300 uppercase">
                    Sandbox Emulator
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Pings every 30s</span>
              </div>
            </div>

            {/* Expandable/Dropdown detailed micro services status list */}
            <AnimatePresence initial={false}>
              {(showDetails || error) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-slate-150 pt-2.5 space-y-2"
                >
                  {error ? (
                    <div className="text-[10px] text-rose-600 bg-rose-50/50 p-2 rounded-lg border border-rose-100 font-medium">
                      Error checking connectivity: {error}. Check your internet connection or server configurations.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {services.map((service) => (
                        <div 
                          key={service.id} 
                          className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wide truncate max-w-[160px]">
                              {service.id === 'esm2' ? 'ESM-2 scanning' : 
                               service.id === 'esmfold' ? 'ESMFold folding' : 
                               service.id === 'megamolbart' ? 'MegaMolBART chemistry' : 
                               'DiffDock docking'}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[200px]" title={service.url}>
                              {service.region || 'Unknown NGC region'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-right shrink-0">
                            <div className="space-y-0.5">
                              <span className="font-mono font-black text-slate-800 block">
                                {service.latency}ms
                              </span>
                              <span className="text-[7px] text-slate-400 block uppercase tracking-widest font-bold">
                                LATENCY
                              </span>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {healthData && (
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase pt-1 tracking-wider border-t border-slate-100">
                      <span>Last Checked: {formattedTime}</span>
                      <span>SLA Status: 99.9%</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* Main Dashboard Component */}
      <BioNeMoDashboard />
    </div>
  );
}
