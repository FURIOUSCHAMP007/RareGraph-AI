import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Zap, 
  Cpu, 
  Activity, 
  Gauge, 
  Sliders, 
  BarChart4, 
  RefreshCw, 
  Play, 
  Pause,
  Server,
  TrendingUp,
  HelpCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface BenchmarkPoint {
  id: number;
  batchSize: number; // number of variants
  cpuTime: number;   // ms
  gpuTime: number;   // ms
  throughput: number; // M variants / sec
  timestamp: Date;
}

export default function CudfPerformanceDashboard() {
  // Configurable state params
  const [batchSize, setBatchSize] = useState<number>(1500000); // Default 1.5M variants
  const [threadBlockSize, setThreadBlockSize] = useState<number>(512); // CUDA thread blocks
  const [cudaStreams, setCudaStreams] = useState<number>(4); // CUDA parallel streams
  const [isProfiling, setIsProfiling] = useState<boolean>(true); // Active stream running
  const [profileSpeed, setProfileSpeed] = useState<number>(1000); // ms per sample

  // History for the real-time stream graph
  const [history, setHistory] = useState<BenchmarkPoint[]>([]);
  const historyCounter = useRef<number>(0);

  // SVG Refs
  const realTimeChartRef = useRef<SVGSVGElement | null>(null);
  const scalingChartRef = useRef<SVGSVGElement | null>(null);
  const realTimeContainerRef = useRef<HTMLDivElement | null>(null);
  const scalingContainerRef = useRef<HTMLDivElement | null>(null);

  // Dimensions
  const [rtDims, setRtDims] = useState({ width: 500, height: 220 });
  const [scaleDims, setScaleDims] = useState({ width: 500, height: 220 });

  // Handle resizing for fluid container widths
  useEffect(() => {
    const handleResize = () => {
      if (realTimeContainerRef.current) {
        setRtDims({
          width: Math.max(300, realTimeContainerRef.current.clientWidth),
          height: 220
        });
      }
      if (scalingContainerRef.current) {
        setScaleDims({
          width: Math.max(300, scalingContainerRef.current.clientWidth),
          height: 220
        });
      }
    };

    const rtObserver = new ResizeObserver(handleResize);
    const scaleObserver = new ResizeObserver(handleResize);

    if (realTimeContainerRef.current) rtObserver.observe(realTimeContainerRef.current);
    if (scalingContainerRef.current) scaleObserver.observe(scalingContainerRef.current);

    handleResize();

    return () => {
      rtObserver.disconnect();
      scaleObserver.disconnect();
    };
  }, []);

  // Helper to generate a simulated single cuDF vs pandas benchmark point
  const generateBenchmarkPoint = (size: number, threads: number, streams: number): BenchmarkPoint => {
    // Math logic based on parameters:
    // CPU single-thread scales strictly linearly O(N)
    const baseCpuTime = (size * 0.0022); // ~2.2ms per 1000 variants
    const noiseCpu = (Math.random() * 0.1 - 0.05) * baseCpuTime;
    const cpuTime = parseFloat(Math.max(12, baseCpuTime + noiseCpu + 25).toFixed(1));

    // GPU scales with massive O(1) latency profile until saturating core warps
    // Stream concurrency improves throughput up to a point, block size optimizes occupancy
    const efficiencyFactor = (threads === 512 || threads === 256) ? 0.9 : 1.15;
    const streamFactor = 1.0 - (Math.min(streams, 8) * 0.04);
    const baseGpuTime = (size * 0.000008) * efficiencyFactor * streamFactor; // extremely low slope
    const overheadGpu = 3.5 + (1024 / threads) * 0.5; // JIT overheads
    const noiseGpu = (Math.random() * 0.08 - 0.04) * baseGpuTime;
    const gpuTime = parseFloat(Math.max(1.8, baseGpuTime + overheadGpu + noiseGpu).toFixed(2));

    // Throughput in Millions of Variants per second (MV/s)
    // Formula: size / (gpuTime in ms / 1000) / 1,000,000 = size / (gpuTime * 1000)
    const throughput = parseFloat((size / (gpuTime * 1000)).toFixed(2));

    historyCounter.current += 1;

    return {
      id: historyCounter.current,
      batchSize: size,
      cpuTime,
      gpuTime,
      throughput,
      timestamp: new Date()
    };
  };

  // Seed initial data
  useEffect(() => {
    const initialPoints: BenchmarkPoint[] = [];
    for (let i = 9; i >= 0; i--) {
      // Simulate historical points with slightly varying batch sizes
      const historicSize = batchSize * (0.85 + Math.random() * 0.3);
      const pt = generateBenchmarkPoint(historicSize, threadBlockSize, cudaStreams);
      // Adjust time so they look sequential
      pt.timestamp = new Date(Date.now() - i * profileSpeed);
      initialPoints.push(pt);
    }
    setHistory(initialPoints);
  }, [batchSize, threadBlockSize, cudaStreams]);

  // Real-time generator interval
  useEffect(() => {
    if (!isProfiling) return;

    const interval = setInterval(() => {
      // Add small jitter to batchSize to make the real-time line look dynamic and lively
      const dynamicSize = batchSize * (0.94 + Math.random() * 0.12);
      const newPt = generateBenchmarkPoint(dynamicSize, threadBlockSize, cudaStreams);
      
      setHistory(prev => {
        const updated = [...prev, newPt];
        if (updated.length > 25) {
          return updated.slice(updated.length - 25);
        }
        return updated;
      });
    }, profileSpeed);

    return () => clearInterval(interval);
  }, [isProfiling, batchSize, threadBlockSize, cudaStreams, profileSpeed]);

  // Render Chart 1: Real-time Latency & Throughput Stream (Dual Y-Axis)
  useEffect(() => {
    if (!realTimeChartRef.current || history.length === 0) return;

    const margin = { top: 20, right: 50, bottom: 30, left: 45 };
    const chartWidth = rtDims.width - margin.left - margin.right;
    const chartHeight = rtDims.height - margin.top - margin.bottom;

    const svg = d3.select(realTimeChartRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Scale: index/time
    const xScale = d3.scaleLinear()
      .domain([d3.min(history, h => h.id) || 0, d3.max(history, h => h.id) || 0])
      .range([0, chartWidth]);

    // Left Y Scale: GPU Latency (ms)
    const yLeftScale = d3.scaleLinear()
      .domain([0, d3.max(history, h => h.gpuTime) * 1.2 || 10])
      .range([chartHeight, 0]);

    // Right Y Scale: Throughput (M variants/sec)
    const yRightScale = d3.scaleLinear()
      .domain([0, d3.max(history, h => h.throughput) * 1.25 || 300])
      .range([chartHeight, 0]);

    // Left Grid Lines
    g.append('g')
      .attr('class', 'grid-lines')
      .style('color', '#18181b')
      .call(
        d3.axisLeft(yLeftScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(() => '') // Hide ids, just show continuous stream
      )
      .style('color', '#27272a');

    // Left Y Axis (Latency)
    g.append('g')
      .call(d3.axisLeft(yLeftScale).ticks(5).tickFormat(d => `${d} ms`))
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#a1a1aa')
      .selectAll('.domain, .tick line').style('stroke', '#27272a');

    // Right Y Axis (Throughput)
    g.append('g')
      .attr('transform', `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(yRightScale).ticks(5).tickFormat(d => `${d}M`))
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#76B900')
      .selectAll('.domain, .tick line').style('stroke', '#27272a');

    // Line Generator for GPU Latency (cyan)
    const latencyLine = d3.line<BenchmarkPoint>()
      .x(d => xScale(d.id))
      .y(d => yLeftScale(d.gpuTime))
      .curve(d3.curveMonotoneX);

    // Line Generator for Throughput (NVIDIA green)
    const throughputLine = d3.line<BenchmarkPoint>()
      .x(d => xScale(d.id))
      .y(d => yRightScale(d.throughput))
      .curve(d3.curveMonotoneX);

    // Area Generator for Throughput Glow
    const throughputArea = d3.area<BenchmarkPoint>()
      .x(d => xScale(d.id))
      .y0(chartHeight)
      .y1(d => yRightScale(d.throughput))
      .curve(d3.curveMonotoneX);

    // Render Throughput Area (Green shadow)
    g.append('path')
      .datum(history)
      .attr('fill', 'url(#throughput-gradient)')
      .attr('d', throughputArea)
      .style('opacity', 0.15);

    // Add Gradients
    const defs = svg.append('defs');
    const thGrad = defs.append('linearGradient')
      .attr('id', 'throughput-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    thGrad.append('stop').attr('offset', '0%').attr('stop-color', '#76B900');
    thGrad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent');

    // Render Latency Path
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2)
      .attr('d', latencyLine);

    // Render Throughput Path
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#76B900')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 1')
      .attr('d', throughputLine);

    // Live indicators on the last point
    const lastPoint = history[history.length - 1];
    if (lastPoint) {
      // Latency ring
      g.append('circle')
        .attr('cx', xScale(lastPoint.id))
        .attr('cy', yLeftScale(lastPoint.gpuTime))
        .attr('r', 4)
        .attr('fill', '#06b6d4');

      // Throughput ring
      g.append('circle')
        .attr('cx', xScale(lastPoint.id))
        .attr('cy', yRightScale(lastPoint.throughput))
        .attr('r', 4)
        .attr('fill', '#76B900');
    }

  }, [history, rtDims]);

  // Render Chart 2: Scaling Benchmark (O(N) CPU vs O(1) GPU)
  useEffect(() => {
    if (!scalingChartRef.current) return;

    const margin = { top: 20, right: 30, bottom: 35, left: 50 };
    const chartWidth = scaleDims.width - margin.left - margin.right;
    const chartHeight = scaleDims.height - margin.top - margin.bottom;

    const svg = d3.select(scalingChartRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define 5 testing sizes up to 5M
    const testSizes = [100000, 1000000, 2000000, 3500000, 5000000];
    
    // Generate static comparison coordinates using current configurations
    const comparisonData = testSizes.map(size => {
      const pt = generateBenchmarkPoint(size, threadBlockSize, cudaStreams);
      return {
        size,
        cpuTime: pt.cpuTime,
        gpuTime: pt.gpuTime
      };
    });

    // X Scale: Dataset Size (variants)
    const xScale = d3.scaleLinear()
      .domain([0, 5000000])
      .range([0, chartWidth]);

    // Y Scale: Log or linear latency representation
    // Let's use Logarithmic scale to elegantly show both extremely low (e.g., 3ms GPU) and high (e.g., 11000ms CPU) latencies
    const yScale = d3.scaleLog()
      .domain([1, 15000])
      .range([chartHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .style('color', '#18181b')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d => `${(Number(d) / 1000000).toFixed(1)}M`)
      )
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#a1a1aa')
      .selectAll('.domain, .tick line').style('stroke', '#27272a');

    // Y Axis (Logarithmic latency)
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues([1, 10, 100, 1000, 10000])
          .tickFormat(d => `${d}ms`)
      )
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#a1a1aa')
      .selectAll('.domain, .tick line').style('stroke', '#27272a');

    // Lines
    const cpuLineGen = d3.line<typeof comparisonData[0]>()
      .x(d => xScale(d.size))
      .y(d => yScale(d.cpuTime))
      .curve(d3.curveMonotoneX);

    const gpuLineGen = d3.line<typeof comparisonData[0]>()
      .x(d => xScale(d.size))
      .y(d => yScale(d.gpuTime))
      .curve(d3.curveMonotoneX);

    // Render CPU Path (Rose red linear curve)
    g.append('path')
      .datum(comparisonData)
      .attr('fill', 'none')
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 1.5)
      .attr('d', cpuLineGen);

    // Render GPU Path (NVIDIA Green flat curve)
    g.append('path')
      .datum(comparisonData)
      .attr('fill', 'none')
      .attr('stroke', '#76B900')
      .attr('stroke-width', 2)
      .attr('d', gpuLineGen);

    // Render points for CPU
    g.selectAll('.cpu-dot')
      .data(comparisonData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.size))
      .attr('cy', d => yScale(d.cpuTime))
      .attr('r', 3.5)
      .attr('fill', '#f43f5e')
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `Pandas CPU: ${d.cpuTime.toLocaleString()} ms at ${d.size.toLocaleString()} records`);

    // Render points for GPU
    g.selectAll('.gpu-dot')
      .data(comparisonData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.size))
      .attr('cy', d => yScale(d.gpuTime))
      .attr('r', 3.5)
      .attr('fill', '#76B900')
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `RAPIDS GPU: ${d.gpuTime.toFixed(2)} ms at ${d.size.toLocaleString()} records`);

  }, [threadBlockSize, cudaStreams, scaleDims]);

  // Derive latest values for stats panel
  const latest = history[history.length - 1] || { cpuTime: 2300, gpuTime: 12, throughput: 125, batchSize: 1500000 };
  const speedup = parseFloat((latest.cpuTime / latest.gpuTime).toFixed(1));

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      
      {/* Visual background ambient grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#76B900/4,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#06b6d4/3,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#76B900]/10 border border-[#76B900]/20 rounded-2xl text-[#76B900]">
            <Gauge className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[8.5px] font-mono font-black text-[#76B900] uppercase tracking-widest block">
              CUDA Compute Profiler
            </span>
            <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              cuDF GPU Accelerated Engine Performance Dashboard
            </h3>
          </div>
        </div>

        {/* Live Controller Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProfiling(!isProfiling)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border transition-all ${
              isProfiling 
                ? 'bg-[#76B900]/10 border-[#76B900]/30 text-[#76B900] hover:bg-[#76B900]/20' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {isProfiling ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                STREAMS ACTIVE
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                STREAMS PAUSED
              </>
            )}
          </button>

          <button
            onClick={() => {
              // Trigger a massive stress-test spike by temporarily setting batch size high
              setBatchSize(5000000);
              toast.info("GPU core saturated. Dispatched 5M sub-exome records down streams.");
            }}
            className="p-1.5 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white cursor-pointer transition-all"
            title="Inject Stress Test Point"
          >
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950/60 border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
            Stream Latency (cuDF)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-black text-white font-mono">{latest.gpuTime.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-zinc-400">ms</span>
          </div>
          <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">
            Kernel exome resolution JIT execution time.
          </p>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
            GPU Throughput
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-black text-[#76B900] font-mono">{latest.throughput.toLocaleString()}</span>
            <span className="text-[9px] font-mono text-zinc-400">M var/s</span>
          </div>
          <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">
            Parallel rows processed per stream second.
          </p>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
            GPGPU Speedup Factor
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-black text-cyan-400 font-mono">{speedup}x</span>
            <span className="text-[9px] font-mono text-zinc-400">faster</span>
          </div>
          <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">
            Speed multiplier relative to single-core pandas CPU.
          </p>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
            Active Buffer Size
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-black text-purple-400 font-mono">
              {(latest.batchSize / 1000000).toFixed(2)}M
            </span>
            <span className="text-[9.5px] font-mono text-zinc-400">Rows</span>
          </div>
          <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">
            Size of current VCF exome array uploaded to VRAM.
          </p>
        </div>
      </div>

      {/* Main Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Live Stream */}
        <div ref={realTimeContainerRef} className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-ping" />
              <h4 className="text-[10px] font-black uppercase text-zinc-200 tracking-tight">
                Live Throughput & Latency Stream
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[8.5px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#06b6d4]" /> Latency (ms)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 border-t border-dashed border-[#76B900]" /> Throughput (M var/s)
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <svg 
              ref={realTimeChartRef} 
              width={rtDims.width} 
              height={rtDims.height}
              className="w-full block"
            />
          </div>
        </div>

        {/* Graph 2: Algorithmic Complexity Scaling */}
        <div ref={scalingContainerRef} className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#76B900]" />
              <h4 className="text-[10px] font-black uppercase text-zinc-200 tracking-tight">
                Scale Complexity: CPU (Linear) vs GPU (Sublinear)
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[8.5px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#f43f5e]" /> Pandas CPU
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#76B900]" /> RAPIDS GPU
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <svg 
              ref={scalingChartRef} 
              width={scaleDims.width} 
              height={scaleDims.height}
              className="w-full block"
            />
          </div>
        </div>

      </div>

      {/* Interactive Controls & Params */}
      <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sliders 1: Payload Batch Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#76B900]" />
              Variant Batch Size
            </span>
            <span className="text-[10px] font-mono text-white font-bold">
              {(batchSize / 1000000).toFixed(1)}M variants
            </span>
          </div>
          <input 
            type="range" 
            min={100000} 
            max={5000000} 
            step={100000}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#76B900]"
          />
          <p className="text-[8px] text-zinc-500">
            Simulates the row width of the uploaded exome sequence VCF block.
          </p>
        </div>

        {/* Sliders 2: CUDA Thread Blocks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#76B900]" />
              CUDA Thread Block Size
            </span>
            <span className="text-[10px] font-mono text-white font-bold">
              {threadBlockSize} threads/block
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[128, 256, 512, 1024].map((size) => (
              <button
                key={size}
                onClick={() => setThreadBlockSize(size)}
                className={`py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                  threadBlockSize === size 
                    ? 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/40' 
                    : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-[8px] text-zinc-500">
            Warp hardware scheduling occupancy. 512 achieves peak register performance.
          </p>
        </div>

        {/* Sliders 3: Parallel CUDA Streams */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Server className="w-3 h-3 text-[#76B900]" />
              Hardware CUDA Streams
            </span>
            <span className="text-[10px] font-mono text-white font-bold">
              {cudaStreams} Concurrent Streams
            </span>
          </div>
          <input 
            type="range" 
            min={1} 
            max={8} 
            step={1}
            value={cudaStreams}
            onChange={(e) => setCudaStreams(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#76B900]"
          />
          <p className="text-[8px] text-zinc-500">
            Enables concurrent execution pipelines to overlap PCI transfer & kernel filters.
          </p>
        </div>

      </div>

    </div>
  );
}
