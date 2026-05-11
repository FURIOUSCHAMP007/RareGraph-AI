import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GOEnrichmentResult } from '../services/goService';

interface GOHierarchyProps {
  results: GOEnrichmentResult[];
}

interface HierarchyNode {
  name: string;
  category?: string;
  level: number;
  children?: HierarchyNode[];
}

export default function GOHierarchy({ results }: GOHierarchyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !results.length || !containerRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Transform flat results into a hierarchy
    const categories = Array.from(new Set(results.map(r => r.category)));
    const root: HierarchyNode = {
      name: "Gene Ontology",
      level: 0,
      children: categories.map(cat => ({
        name: cat,
        level: 1,
        children: results
          .filter(r => r.category === cat)
          .map(r => ({
            name: r.description,
            level: 2,
            children: r.enrichedGenes.map(gene => ({
              name: gene,
              level: 3
            }))
          }))
      }))
    };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height] as any)
      .style('background-color', 'transparent');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<HierarchyNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const hierarchy = d3.hierarchy<HierarchyNode>(root);
    const rootData = tree(hierarchy);

    // Links
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(rootData.links())
      .join('path')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x) as any
      );

    // Nodes
    const node = g.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(rootData.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('fill', d => {
        if (d.data.level === 0) return '#0f172a';
        if (d.data.level === 1) {
          if (d.data.name === 'Biological Process') return '#6366f1';
          if (d.data.name === 'Molecular Function') return '#3b82f6';
          return '#94a3b8';
        }
        if (d.data.level === 2) return '#e2e8f0';
        return '#f8fafc';
      })
      .attr('stroke', d => {
        if (d.data.level === 3) return '#3b82f6';
        return '#cbd5e1';
      })
      .attr('stroke-width', d => d.data.level === 3 ? 1.5 : 1)
      .attr('r', d => {
        if (d.data.level === 0) return 6;
        if (d.data.level === 1) return 5;
        if (d.data.level === 2) return 4;
        return 3;
      });

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -8 : 8)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.name)
      .attr('font-size', d => {
        if (d.data.level === 0) return '11px';
        if (d.data.level === 1) return '10px';
        return '9px';
      })
      .attr('font-weight', d => d.data.level < 2 ? '900' : '500')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', d => d.data.level < 2 ? '#0f172a' : '#64748b')
      .attr('class', 'uppercase tracking-tighter')
      .clone(true).lower()
      .attr('stroke', 'white');

    // Add interactivity
    node.style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).select('circle').transition().attr('r', 8).attr('fill', '#3b82f6');
        d3.select(this).select('text').transition().attr('fill', '#0f172a');
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this).select('circle').transition().attr('r', d.data.level === 0 ? 6 : d.data.level === 1 ? 5 : d.data.level === 2 ? 4 : 3)
          .attr('fill', (d: any) => {
            if (d.data.level === 0) return '#0f172a';
            if (d.data.level === 1) {
              if (d.data.name === 'Biological Process') return '#6366f1';
              if (d.data.name === 'Molecular Function') return '#3b82f6';
              return '#94a3b8';
            }
            if (d.data.level === 2) return '#e2e8f0';
            return '#f8fafc';
          });
        d3.select(this).select('text').transition()
          .attr('fill', d.data.level < 2 ? '#0f172a' : '#64748b');
      });

  }, [results]);

  return (
    <div ref={containerRef} className="w-full bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden min-h-[400px]">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase">Process</span>
         </div>
         <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase">Function</span>
         </div>
      </div>
      <svg ref={svgRef} className="w-full h-[600px]"></svg>
    </div>
  );
}
