import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Thermometer, Flame, AlertTriangle, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface ThermalPoint {
  time: string;
  gpu0_temp: number;
  gpu1_temp: number;
}

interface GpuThermalStressTrendProps {
  thermalHistory: ThermalPoint[];
  gpu0_name: string;
  gpu1_name: string;
}

export default function GpuThermalStressTrend({
  thermalHistory,
  gpu0_name,
  gpu1_name,
}: GpuThermalStressTrendProps) {
  
  const labels = thermalHistory.map((pt) => pt.time);
  const gpu0Temps = thermalHistory.map((pt) => pt.gpu0_temp);
  const gpu1Temps = thermalHistory.map((pt) => pt.gpu1_temp);

  // Calculate stats for clinician display
  const current0 = gpu0Temps[gpu0Temps.length - 1] || 0;
  const current1 = gpu1Temps[gpu1Temps.length - 1] || 0;
  
  const max0 = Math.max(...gpu0Temps, 0);
  const max1 = Math.max(...gpu1Temps, 0);
  
  const avg0 = Math.round(gpu0Temps.reduce((a, b) => a + b, 0) / (gpu0Temps.length || 1));
  const avg1 = Math.round(gpu1Temps.reduce((a, b) => a + b, 0) / (gpu1Temps.length || 1));

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'GPU 0 Temperature (°C)',
        data: gpu0Temps,
        borderColor: '#76B900',
        backgroundColor: 'rgba(118, 185, 0, 0.04)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 8,
      },
      {
        label: 'GPU 1 Temperature (°C)',
        data: gpu1Temps,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.04)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 8,
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    plugins: {
      legend: {
        display: false, // Custom legend below for precise tailwind styling matching our branding
      },
      tooltip: {
        backgroundColor: '#090d16',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 8,
        bodyFont: {
          family: 'monospace',
          size: 10,
        },
        titleFont: {
          family: 'monospace',
          size: 9,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 8,
            family: 'monospace',
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: '#18181b',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 8,
            family: 'monospace',
          },
          stepSize: 10,
        },
        min: 30,
        max: 90,
      },
    },
  };

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-2xl text-zinc-100 space-y-4">
      {/* Header section with status alert indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="space-y-0.5">
          <span className="text-[8px] font-mono font-black text-orange-400 uppercase tracking-widest block">Thermal stress analysis</span>
          <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-orange-500 animate-pulse" />
            10-Minute Core Thermal Stress Trend
          </h3>
        </div>
        
        {/* Hardware Status Tag for clinical environments */}
        <div className="flex items-center gap-2">
          {max0 > 78 || max1 > 78 ? (
            <span className="bg-red-500/15 text-red-400 text-[8.5px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              THERMAL THROTTLING RISK
            </span>
          ) : (
            <span className="bg-[#76B900]/15 text-[#76B900] text-[8.5px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded border border-[#76B900]/20 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              STABLE THERMALS
            </span>
          )}
        </div>
      </div>

      {/* Clinician Heat Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9px]">
        {/* GPU 0 status block */}
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76B900]" />
              <strong className="text-white uppercase truncate max-w-[120px] sm:max-w-[180px]">GPU 0: H100</strong>
            </div>
            <p className="text-zinc-500 text-[8px] truncate max-w-[200px]">{gpu0_name}</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">AVG HEAT</span>
              <span className="text-zinc-200 font-bold">{avg0}°C</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">PEAK</span>
              <span className={`font-bold ${max0 > 75 ? 'text-red-400' : 'text-zinc-200'}`}>{max0}°C</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">CURRENT</span>
              <span className="text-[#76B900] font-black text-xs">{current0}°C</span>
            </div>
          </div>
        </div>

        {/* GPU 1 status block */}
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <strong className="text-white uppercase truncate max-w-[120px] sm:max-w-[180px]">GPU 1: H100</strong>
            </div>
            <p className="text-zinc-500 text-[8px] truncate max-w-[200px]">{gpu1_name}</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">AVG HEAT</span>
              <span className="text-zinc-200 font-bold">{avg1}°C</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">PEAK</span>
              <span className={`font-bold ${max1 > 75 ? 'text-red-400' : 'text-zinc-200'}`}>{max1}°C</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[7.5px] uppercase">CURRENT</span>
              <span className="text-cyan-400 font-black text-xs">{current1}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Chart Render View */}
      <div className="w-full h-72 bg-zinc-950/40 rounded-xl p-4 border border-zinc-900 relative">
        <Line data={chartData} options={options} />

        {/* Dynamic visual lines to mark key thermodynamic benchmarks */}
        <div className="absolute top-4 right-6 flex flex-col items-end gap-1.5 pointer-events-none font-mono text-[7px] text-zinc-500">
          <div className="flex items-center gap-1 bg-red-950/30 border border-red-900/30 px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span>THERMAL LIMIT: 85°C</span>
          </div>
          <div className="flex items-center gap-1 bg-orange-950/20 border border-orange-900/30 px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-orange-500" />
            <span>HEAVY STRESS: 75°C</span>
          </div>
          <div className="flex items-center gap-1 bg-[#76B900]/10 border border-[#76B900]/20 px-1.5 py-0.5 rounded">
            <span className="w-1 h-1 rounded-full bg-[#76B900]" />
            <span>NOMINAL OPERATING ZONE</span>
          </div>
        </div>
      </div>

      <p className="text-[9.5px] text-zinc-500 leading-relaxed font-medium">
        * <strong>Thermal Stability Log:</strong> Continuously records hardware temperatures at 10-second intervals. Excessive temperatures exceeding 78°C trigger automated system throttle alarms and cooling cycle requests. Useful for safeguarding machine learning models under deep tensor calculations.
      </p>
    </div>
  );
}
