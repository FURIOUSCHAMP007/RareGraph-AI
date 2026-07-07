import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  BarChart4, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  Sparkles,
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import { VcfRecord } from './CudfVcfAnalyzer';

interface ChromosomalHeatmapProps {
  records: VcfRecord[];
}

type HeatmapMetric = 'count' | 'avg_dp' | 'avg_qual';

// AF Bins definition
const AF_BINS = [
  { id: 'ultra_rare', name: 'Ultra-Rare (<1e-4)', range: [0, 0.0001] as [number, number] },
  { id: 'rare', name: 'Rare (1e-4 - 1e-3)', range: [0.0001, 0.001] as [number, number] },
  { id: 'low_freq', name: 'Low Freq (1e-3 - 1e-2)', range: [0.001, 0.01] as [number, number] },
  { id: 'common', name: 'Common (1e-2 - 0.05)', range: [0.01, 0.05] as [number, number] },
  { id: 'high_freq', name: 'High Freq (>0.05)', range: [0.05, 1.0] as [number, number] }
];

// Chromosomes we want to display as rows
const DISPLAY_CHROMOSOMES = [
  'chr1', 'chr2', 'chr3', 'chr7', 'chr9', 'chr11', 'chr15', 'chr16', 'chr17', 'chr22', 'chrX', 'chrM'
];

interface HeatmapDataPoint {
  chrom: string;
  binId: string;
  binName: string;
  count: number;
  total_dp: number;
  total_qual: number;
  avg_dp: number;
  avg_qual: number;
}

export default function ChromosomalHeatmap({ records }: ChromosomalHeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [metric, setMetric] = useState<HeatmapMetric>('count');
  const [dimensions, setDimensions] = useState({ width: 700, height: 320 });
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(400, width),
          height: 320
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Process data for the heatmap
  const getHeatmapData = (): HeatmapDataPoint[] => {
    const data: HeatmapDataPoint[] = [];

    DISPLAY_CHROMOSOMES.forEach(chrom => {
      AF_BINS.forEach(bin => {
        // Filter records for this chrom and this AF bin
        const matches = records.filter(r => {
          const matchChrom = r.chrom.toLowerCase() === chrom.toLowerCase();
          const matchAf = r.af >= bin.range[0] && r.af < bin.range[1];
          return matchChrom && matchAf;
        });

        const count = matches.length;
        const total_dp = matches.reduce((sum, r) => sum + r.dp, 0);
        const total_qual = matches.reduce((sum, r) => sum + r.qual, 0);
        
        data.push({
          chrom,
          binId: bin.id,
          binName: bin.name,
          count,
          total_dp,
          total_qual,
          avg_dp: count > 0 ? parseFloat((total_dp / count).toFixed(1)) : 0,
          avg_qual: count > 0 ? parseFloat((total_qual / count).toFixed(0)) : 0
        });
      });
    });

    return data;
  };

  const heatmapData = getHeatmapData();

  // Draw Heatmap with D3
  useEffect(() => {
    if (!svgRef.current || heatmapData.length === 0) return;

    const margin = { top: 25, right: 30, bottom: 45, left: 55 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Setup Scales
    const xScale = d3.scaleBand()
      .domain(AF_BINS.map(b => b.id))
      .range([0, chartWidth])
      .padding(0.08);

    const yScale = d3.scaleBand()
      .domain(DISPLAY_CHROMOSOMES)
      .range([0, chartHeight])
      .padding(0.08);

    // Get max value for colors
    const values = heatmapData.map(d => d[metric]);
    const maxVal = d3.max(values) || 1;

    // Define colors according to metric
    let colorScale: d3.ScaleLinear<string, string>;
    if (metric === 'count') {
      // NVIDIA green theme
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#121b16', '#76B900']) as d3.ScaleLinear<string, string>;
    } else if (metric === 'avg_dp') {
      // Blue theme for depth
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#0f172a', '#38bdf8']) as d3.ScaleLinear<string, string>;
    } else {
      // Purple theme for quality
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#180e29', '#c084fc']) as d3.ScaleLinear<string, string>;
    }

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .attr('class', 'x-axis')
      .call(
        d3.axisBottom(xScale)
          .tickFormat(id => {
            const found = AF_BINS.find(b => b.id === id);
            return found ? found.name : id;
          })
      )
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8px')
      .style('color', '#64748b')
      .selectAll('.tick text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-25)');

    // Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '8.5px')
      .style('color', '#64748b');

    // Remove domains
    g.selectAll('.domain').remove();
    g.selectAll('.tick line').remove();

    // Render cells
    const cells = g.selectAll('.heatmap-cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.binId) || 0)
      .attr('y', d => yScale(d.chrom) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', d => d[metric] === 0 ? '#0b0f19' : colorScale(d[metric]))
      .attr('stroke', '#020305')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer');

    // Add interactivity
    cells.on('mouseenter', function (event, d) {
      d3.select(this)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .raise(); // Pull hovered cell to top so border doesn't get clip-masked

      setHoveredCell(d);
      
      // Calculate tooltip position relative to container
      if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - bounds.left + 15,
          y: event.clientY - bounds.top + 15
        });
      }
    })
    .on('mousemove', function (event) {
      if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - bounds.left + 15,
          y: event.clientY - bounds.top + 15
        });
      }
    })
    .on('mouseleave', function () {
      d3.select(this)
        .attr('stroke', '#020305')
        .attr('stroke-width', 0.5);
      
      setHoveredCell(null);
    });

  }, [heatmapData, metric, dimensions]);

  return (
    <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-5 shadow-xl text-zinc-100 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#76B900]/10 border border-[#76B900]/25 rounded-xl text-[#76B900]">
            <BarChart4 className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">
              RAPIDS JIT Spatial Matrix
            </span>
            <h3 className="text-xs font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
              Chromosomal Variant Heatmap
            </h3>
          </div>
        </div>

        {/* Metric Selector Toggles */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 rounded-lg p-1">
          {[
            { id: 'count', label: 'Density/Count' },
            { id: 'avg_dp', label: 'Avg Depth' },
            { id: 'avg_qual', label: 'Avg Quality' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMetric(item.id as HeatmapMetric)}
              className={`px-2 py-1 text-[8.5px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer ${
                metric === item.id 
                  ? 'bg-zinc-900 text-white shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={containerRef} className="w-full relative bg-zinc-950/40 rounded-xl border border-zinc-900/50 p-2 overflow-hidden">
        
        {records.length === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <Layers className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-400">Heatmap Matrix Empty</p>
            <p className="text-[10px] text-zinc-600 max-w-sm mt-1 leading-relaxed">
              No active cuDF filter buffers detected. Adjust the sliders on the left to stream variants.
            </p>
          </div>
        ) : (
          <div className="relative">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              className="w-full h-full block"
            />

            {/* Custom Interactive Tooltip */}
            {hoveredCell && (
              <div 
                className="absolute bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl pointer-events-none z-50 text-[10px] font-mono w-48 space-y-1.5"
                style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
              >
                <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-400">
                  <span className="font-black text-white">{hoveredCell.chrom.toUpperCase()}</span>
                  <span>{hoveredCell.binName.split(' ')[0]}</span>
                </div>
                <div className="space-y-1 pt-1 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Variant Density:</span>
                    <span className="text-[#76B900] font-bold">{hoveredCell.count} variants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg Read Depth:</span>
                    <span className="text-sky-400 font-bold">{hoveredCell.avg_dp}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg Quality:</span>
                    <span className="text-purple-400 font-bold">{hoveredCell.avg_qual}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer statistics indicator */}
      {records.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between text-[8px] font-mono text-zinc-500 font-bold gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-zinc-600" />
            <span>MAPPED: {records.length} TOTAL DETECTED VARIANT SITES</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-zinc-900 border border-zinc-850 rounded-sm" />
              <span>0 (None)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ 
                backgroundColor: metric === 'count' ? '#76B900' : metric === 'avg_dp' ? '#38bdf8' : '#c084fc' 
              }} />
              <span>Maximum Density</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
