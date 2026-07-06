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

interface TelemetryPoint {
  time: string;
  gpu0_load: number;
  gpu0_vram: number;
  gpu0_temp: number;
  gpu1_load: number;
  gpu1_vram: number;
  gpu1_temp: number;
}

interface RealTimeGpuTelemetryProps {
  telemetryHistory: TelemetryPoint[];
  activeGpuId: number;
  showLoad: boolean;
  showVram: boolean;
  showTemp: boolean;
}

export default function RealTimeGpuTelemetry({
  telemetryHistory,
  activeGpuId,
  showLoad,
  showVram,
  showTemp,
}: RealTimeGpuTelemetryProps) {
  
  const labels = telemetryHistory.map((h) => h.time);
  const loadData = telemetryHistory.map((h) => (activeGpuId === 0 ? h.gpu0_load : h.gpu1_load));
  const vramData = telemetryHistory.map((h) => (activeGpuId === 0 ? h.gpu0_vram : h.gpu1_vram));
  const tempData = telemetryHistory.map((h) => (activeGpuId === 0 ? h.gpu0_temp : h.gpu1_temp));

  const datasets = [];

  if (showLoad) {
    datasets.push({
      label: 'Core Utilization (%)',
      data: loadData,
      borderColor: '#76B900',
      backgroundColor: 'rgba(118, 185, 0, 0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHitRadius: 10,
    });
  }

  if (showVram) {
    datasets.push({
      label: 'Allocated VRAM (GB)',
      data: vramData,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHitRadius: 10,
    });
  }

  if (showTemp) {
    datasets.push({
      label: 'Core Temp (°C)',
      data: tempData,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHitRadius: 10,
    });
  }

  const chartData: ChartData<'line'> = {
    labels,
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    plugins: {
      legend: {
        display: false,
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
          color: '#9ca3af',
          font: {
            size: 8,
            family: 'monospace',
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: '#111827',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 8,
            family: 'monospace',
          },
          stepSize: 20,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[220px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
