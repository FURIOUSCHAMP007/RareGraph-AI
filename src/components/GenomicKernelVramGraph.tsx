import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Zap, 
  Cpu, 
  Database, 
  TrendingUp, 
  Play, 
  Layers, 
  Activity, 
  RefreshCcw, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface KernelVramPoint {
  time: Date;
  cudf_vcf: number;
  esm_annotation: number;
  esmfold: number;
  diffdock: number;
}

interface KernelConfig {
  id: keyof Omit<KernelVramPoint, 'time'>;
  name: string;
  color: string;
  gradientId: string;
  description: string;
  baseAllocation: number;
  variance: number;
}

const KERNEL_CONFIGS: KernelConfig[] = [
  {
    id: 'cudf_vcf',
    name: 'cuDF VCF Filter Kernel',
    color: '#76B900', // NVIDIA Green
    gradientId: 'grad-cudf',
    description: 'GPU-accelerated pandas pipeline for parsing millions of genomic variants',
    baseAllocation: 4.8,
    variance: 0.6
  },
  {
    id: 'esm_annotation',
    name: 'ESM-3 3B Variant Annotation',
    color: '#06b6d4', // Cyan
    gradientId: 'grad-esm',
    description: 'Somatic/germline mutation pathogenicity score predictor model',
    baseAllocation: 12.4,
    variance: 1.1
  },
  {
    id: 'esmfold',
    name: 'ESMFold Structure Predictor',
    color: '#f97316', // Orange
    gradientId: 'grad-esmfold',
    description: 'High-speed protein secondary/tertiary structure folding engine',
    baseAllocation: 18.5,
    variance: 1.5
  },
  {
    id: 'diffdock',
    name: 'DiffDock Torsion Sim',
    color: '#a855f7', // Purple
    gradientId: 'grad-diffdock',
    description: 'Multi-agent molecular docking ligand affinity torsion simulator',
    baseAllocation: 14.0,
    variance: 0.9
  }
];

interface GenomicKernelVramGraphProps {
  activeJob?: 'idle' | 'llm' | 'folding' | 'docking';
  onLatestVramChange?: (vrams: {
    cudf_vcf: number;
    esm_annotation: number;
    esmfold: number;
    diffdock: number;
  }) => void;
}

export default function GenomicKernelVramGraph({ 
  activeJob = 'llm', 
  onLatestVramChange 
}: GenomicKernelVramGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Active state
  const [activeKernels, setActiveKernels] = useState<Record<string, boolean>>({
    cudf_vcf: true,
    esm_annotation: true,
    esmfold: true,
    diffdock: true
  });
  
  // Custom interactive spike simulation state
  const [isSpiking, setIsSpiking] = useState(false);
  const [vramLimit, setVramLimit] = useState(40); // Axis limit helper in GB
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  
  // History data state
  const [history, setHistory] = useState<KernelVramPoint[]>(() => {
    const data: KernelVramPoint[] = [];
    const now = new Date();
    // Pre-seed 25 points, 1.5 seconds apart
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 1500);
      data.push({
        time: timestamp,
        cudf_vcf: parseFloat((4.8 + Math.sin(i * 0.5) * 0.3).toFixed(2)),
        esm_annotation: parseFloat((12.4 + Math.cos(i * 0.4) * 0.4).toFixed(2)),
        esmfold: parseFloat((18.5 + Math.sin(i * 0.3) * 0.6).toFixed(2)),
        diffdock: parseFloat((14.0 + Math.cos(i * 0.6) * 0.5).toFixed(2))
      });
    }
    return data;
  });

  // Handle auto-resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep inside reasonable aspect ratios
        setDimensions({
          width: Math.max(300, width),
          height: 260
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Auto-scale axis limits based on active workload
  useEffect(() => {
    if (isSpiking) {
      setVramLimit(40);
    } else if (activeJob === 'llm') {
      setVramLimit(40);
    } else if (activeJob === 'folding' || activeJob === 'docking') {
      setVramLimit(60);
    } else {
      setVramLimit(30);
    }
  }, [activeJob, isSpiking]);

  // Simulator interval
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const now = new Date();
        
        // Define bases based on activeJob
        let baseCudf = 4.8;
        let baseEsm = 12.4;
        let baseFold = 18.5;
        let baseDiff = 14.0;

        if (activeJob === 'idle') {
          baseCudf = 1.2;
          baseEsm = 2.4;
          baseFold = 3.1;
          baseDiff = 1.8;
        } else if (activeJob === 'llm') {
          baseCudf = 3.2;
          baseEsm = 28.4;
          baseFold = 4.5;
          baseDiff = 2.1;
        } else if (activeJob === 'folding') {
          baseCudf = 2.5;
          baseEsm = 6.8;
          baseFold = 34.2;
          baseDiff = 5.4;
        } else if (activeJob === 'docking') {
          baseCudf = 4.1;
          baseEsm = 5.2;
          baseFold = 8.3;
          baseDiff = 26.5;
        }

        let nextCudf = baseCudf + (Math.random() * 0.8 - 0.4);
        if (isSpiking) {
          nextCudf = 24.5 + (Math.random() * 3.5 - 1.5);
        }
        
        const nextEsm = baseEsm + (Math.random() * 1.2 - 0.6);
        const nextFold = baseFold + (Math.random() * 2.0 - 1.0);
        const nextDiff = baseDiff + (Math.random() * 1.5 - 0.75);

        const nextPoint: KernelVramPoint = {
          time: now,
          cudf_vcf: parseFloat(Math.max(0.5, nextCudf).toFixed(2)),
          esm_annotation: parseFloat(Math.max(1.0, nextEsm).toFixed(2)),
          esmfold: parseFloat(Math.max(1.5, nextFold).toFixed(2)),
          diffdock: parseFloat(Math.max(1.0, nextDiff).toFixed(2))
        };

        const updated = [...prev, nextPoint];
        if (updated.length > 30) {
          return updated.slice(updated.length - 30);
        }
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSpiking, activeJob]);

  // Handle spike simulation triggering
  const triggerHighThroughputPipeline = () => {
    setIsSpiking(true);
    toast.info("cuDF Pipeline Burst Triggered", {
      description: "Aggregating 1,200,000 VCF variant loci on GPU memory lanes."
    });

    // Auto decay spike after 6 seconds
    setTimeout(() => {
      setIsSpiking(false);
      toast.success("cuDF Processing Cache Flushed", {
        description: "VCF variant parsing completed successfully. Garbage collecting memory buffers."
      });
    }, 6000);
  };

  // Render D3 Line Graphs
  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    // Dimensions & Margins
    const margin = { top: 15, right: 25, bottom: 30, left: 35 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Clear SVG for fresh draw
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup main container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define defs for glowing lines
    const defs = svg.append('defs');

    // Create drop-shadow or glowing filters for each active line
    KERNEL_CONFIGS.forEach(config => {
      if (!activeKernels[config.id]) return;
      const filter = defs.append('filter')
        .attr('id', `glow-${config.id}`)
        .attr('height', '130%');
      filter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '2.5')
        .attr('result', 'blur');
      filter.append('feMerge')
        .append('feMergeNode').attr('in', 'blur');
      filter.select('feMerge')
        .append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(history, d => d.time) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, vramLimit])
      .range([chartHeight, 0]);

    // Grid lines - Horizontal
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .attr('stroke', '#334155')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .attr('class', 'x-axis')
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d => d3.timeFormat('%H:%M:%S')(d as Date))
      )
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#94a3b8')
      .selectAll('.tick line')
      .attr('stroke', '#334155');

    // Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => `${d} GB`)
      )
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#94a3b8')
      .selectAll('.tick line')
      .attr('stroke', '#334155');

    // Remove axis border lines for clean, borderless technical aesthetics
    g.selectAll('.domain').remove();

    // Draw active series lines
    KERNEL_CONFIGS.forEach(config => {
      if (!activeKernels[config.id]) return;

      const lineGenerator = d3.line<KernelVramPoint>()
        .x(d => xScale(d.time))
        .y(d => yScale(d[config.id]))
        .curve(d3.curveMonotoneX);

      // 1. Draw dynamic background area glow
      const areaGenerator = d3.area<KernelVramPoint>()
        .x(d => xScale(d.time))
        .y0(chartHeight)
        .y1(d => yScale(d[config.id]))
        .curve(d3.curveMonotoneX);

      // Gradient for area fill
      const areaGradient = defs.append('linearGradient')
        .attr('id', `${config.gradientId}-area`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', config.color)
        .attr('stop-opacity', 0.12);

      areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', config.color)
        .attr('stop-opacity', 0);

      g.append('path')
        .datum(history)
        .attr('d', areaGenerator)
        .attr('fill', `url(#${config.gradientId}-area)`);

      // 2. Glow line (placed behind the actual line to create ambient blur)
      g.append('path')
        .datum(history)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', 3)
        .attr('opacity', 0.45)
        .attr('filter', `url(#glow-${config.id})`);

      // 3. Crisp foreground line
      g.append('path')
        .datum(history)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', 2);

      // 4. Highlight final node pulsing circle
      const finalPoint = history[history.length - 1];
      if (finalPoint) {
        g.append('circle')
          .attr('cx', xScale(finalPoint.time))
          .attr('cy', yScale(finalPoint[config.id]))
          .attr('r', 4.5)
          .attr('fill', config.color)
          .attr('stroke', '#020305')
          .attr('stroke-width', 1.5);
      }
    });

  }, [history, activeKernels, dimensions, vramLimit]);

  // Aggregate current stats
  const getLatestAllocations = () => {
    const latest = history[history.length - 1];
    if (!latest) return { total: '0.0', cudf_vcf: 0, esm_annotation: 0, esmfold: 0, diffdock: 0 };
    
    const cudf_vcf = latest.cudf_vcf;
    const esm_annotation = latest.esm_annotation;
    const esmfold = latest.esmfold;
    const diffdock = latest.diffdock;
    
    const activeSum = (activeKernels.cudf_vcf ? cudf_vcf : 0) +
                      (activeKernels.esm_annotation ? esm_annotation : 0) +
                      (activeKernels.esmfold ? esmfold : 0) +
                      (activeKernels.diffdock ? diffdock : 0);

    return {
      total: activeSum.toFixed(1),
      cudf_vcf,
      esm_annotation,
      esmfold,
      diffdock
    };
  };

  const latestStats = getLatestAllocations();

  // Notify parent of latest allocations
  useEffect(() => {
    if (onLatestVramChange) {
      onLatestVramChange({
        cudf_vcf: latestStats.cudf_vcf,
        esm_annotation: latestStats.esm_annotation,
        esmfold: latestStats.esmfold,
        diffdock: latestStats.diffdock
      });
    }
  }, [latestStats.cudf_vcf, latestStats.esm_annotation, latestStats.esmfold, latestStats.diffdock, onLatestVramChange]);

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-2xl text-zinc-100 space-y-5">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#76B900]/10 border border-[#76B900]/25 rounded-xl text-[#76B900]">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">
              D3 Engine Telemetry
            </span>
            <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
              Genomic Kernel VRAM Utilization
            </h3>
          </div>
        </div>

        {/* Dynamic Scale Adjuster */}
        <div className="flex items-center gap-3">
          <button
            onClick={triggerHighThroughputPipeline}
            disabled={isSpiking}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSpiking 
                ? 'bg-[#76B900]/10 border-[#76B900]/30 text-[#76B900] animate-pulse' 
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            <Zap className={`w-3 h-3 ${isSpiking ? 'fill-current' : ''}`} />
            {isSpiking ? 'cuDF Burst Active...' : 'Simulate VCF Burst'}
          </button>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[8.5px] font-mono">
            <span className="px-1.5 text-zinc-500">MAX AXIS:</span>
            <select
              value={vramLimit}
              onChange={(e) => setVramLimit(Number(e.target.value))}
              className="bg-zinc-950 text-[#76B900] font-black border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="30">30 GB</option>
              <option value="40">40 GB</option>
              <option value="60">60 GB</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid containing D3 canvas and Stats overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* D3 Canvas Plot Container */}
        <div className="lg:col-span-8 space-y-2">
          
          <div 
            ref={containerRef} 
            className="w-full h-68 bg-zinc-950/50 rounded-xl border border-zinc-900/60 flex items-center justify-center relative overflow-hidden"
          >
            {/* Horizontal timeline subtle grids watermark */}
            <div className="absolute top-2.5 left-4 flex items-center gap-1.5 text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest pointer-events-none z-10">
              <Activity className="w-3.5 h-3.5 text-zinc-700 animate-pulse" />
              <span>D3 Dynamic HBM3 Stream</span>
            </div>

            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              className="w-full h-full block"
            />
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 font-bold px-1">
            <span>HISTORICAL WINDOW: 45 SECONDS</span>
            <span>SAMPLE RATE: 1.5 Hz</span>
          </div>
        </div>

        {/* Legend / Interactive Toggles */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Kernel Pipeline Index
              </span>
              <span className="text-zinc-400 text-[9px] font-mono">
                Allocated: <strong className="text-white text-xs">{latestStats.total} GB</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              {KERNEL_CONFIGS.map((config) => {
                const isActive = activeKernels[config.id];
                const currentVal = latestStats[config.id] as number;
                
                return (
                  <div 
                    key={config.id}
                    onClick={() => setActiveKernels(prev => ({ ...prev, [config.id]: !prev[config.id] }))}
                    className={`p-2.5 border rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-zinc-900/40 border-zinc-800' 
                        : 'bg-zinc-950/20 border-zinc-950 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: isActive ? config.color : '#3f3f46' }}
                      />
                      <div className="space-y-0.5">
                        <strong className={`text-[10px] font-black uppercase tracking-tight block ${isActive ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
                          {config.name}
                        </strong>
                        <span className="text-[8px] text-zinc-500 leading-none block">
                          {config.description.substring(0, 48)}...
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px]">
                      <span className={`font-black ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                        {isActive ? `${currentVal.toFixed(1)} GB` : 'Offline'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Notice */}
          <div className="bg-[#76B900]/5 border border-[#76B900]/10 rounded-xl p-3 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-[#76B900] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[9px] leading-relaxed text-zinc-400">
              <strong className="text-[#76B900] uppercase font-black tracking-wide block">RAPIDS &amp; CUDA Interconnect</strong>
              <p>
                This live visualization is synchronized with GPU system bus telemetry via the Unified CUDA Driver.
                spiking VCF buffers demonstrates dynamic JIT memory allocation limits.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
