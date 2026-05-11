import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: 'gene' | 'disease';
  val: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
  type: 'gene-disease' | 'gene-gene';
}

interface GenomicNetworkProps {
  detectedGenes: string[];
}

export default function GenomicNetwork({ detectedGenes }: GenomicNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;

    // Build dynamic nodes and links
    const uniqueGenes = Array.from(new Set(detectedGenes));
    const nodes: Node[] = uniqueGenes.map(g => ({ id: g, group: 'gene', val: 15 }));
    
    // Add common associated diseases based on genes
    const diseases = new Set<string>();
    if (uniqueGenes.includes('MT-TL1') || uniqueGenes.includes('MT-ND5')) diseases.add('MELAS');
    if (uniqueGenes.includes('MT-ND5') || uniqueGenes.includes('MT-TL1')) diseases.add('Leigh Syndrome');
    if (uniqueGenes.includes('POLG')) diseases.add('Alpers Syndrome');
    if (uniqueGenes.includes('DMD')) diseases.add('Duchenne MD');
    if (uniqueGenes.includes('GAA')) diseases.add('Pompe Disease');

    diseases.forEach(d => nodes.push({ id: d, group: 'disease', val: 25 }));

    const links: Link[] = [];
    
    // Gene-Disease Links
    uniqueGenes.forEach(g => {
       if (g.startsWith('MT-')) {
         if (diseases.has('MELAS')) links.push({ source: g, target: 'MELAS', value: 4, type: 'gene-disease' });
         if (diseases.has('Leigh Syndrome')) links.push({ source: g, target: 'Leigh Syndrome', value: 3, type: 'gene-disease' });
       }
       if (g === 'POLG' && diseases.has('Alpers Syndrome')) links.push({ source: g, target: 'Alpers Syndrome', value: 5, type: 'gene-disease' });
       if (g === 'GAA' && diseases.has('Pompe Disease')) links.push({ source: g, target: 'Pompe Disease', value: 5, type: 'gene-disease' });
    });

    // Gene-Gene Links (Regulatory/Interaction)
    if (uniqueGenes.length > 1) {
      for (let i = 0; i < uniqueGenes.length - 1; i++) {
        for (let j = i + 1; j < uniqueGenes.length; j++) {
           const g1 = uniqueGenes[i];
           const g2 = uniqueGenes[j];
           // Interaction heuristic
           if ((g1.startsWith('MT-') && g2.startsWith('MT-')) || (g1 === 'POLG' && g2.startsWith('MT-'))) {
             links.push({ source: g1, target: g2, value: 2, type: 'gene-gene' });
           }
        }
      }
    }

    const data: { nodes: Node[], links: Link[] } = { nodes, links };

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => d.type === 'gene-gene' ? '#94a3b8' : '#e2e8f0')
      .attr('stroke-opacity', d => d.type === 'gene-gene' ? 0.8 : 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
      .attr('stroke-dasharray', d => d.type === 'gene-gene' ? '4,4' : 'none');

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => d.group === 'disease' ? 12 : 8)
      .attr('fill', d => d.group === 'disease' ? '#ef4444' : '#3b82f6')
      .attr('filter', 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))');

    node.append('text')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .text(d => d.id)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#475569')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="w-full bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden relative">
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gene</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Disease</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-[1px] bg-slate-200" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gene-Disease Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-[1px] bg-slate-400 border-t border-dashed border-slate-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inter-Gene Regulatory</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
}
