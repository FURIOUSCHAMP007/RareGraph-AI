import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Share2, Info, Maximize2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Node, Link } from '../types';

const initialNodes: Node[] = [
  { 
    id: 'p1', 
    name: 'PATIENT_01', 
    type: 'patient',
    definition: 'Index case for clinical diagnostic pipeline. Presents with multisystem involvement.',
  },
  { 
    id: 'p2', 
    name: 'PATIENT_02', 
    type: 'patient',
    definition: 'Pediatric male presenting with progressive proximal muscle weakness and Gowers sign.',
  },
  { 
    id: 'p3', 
    name: 'PATIENT_03', 
    type: 'patient',
    definition: 'Infant presenting with failure to thrive and recurrent respiratory infections.',
  },
  { 
    id: 'p4', 
    name: 'PATIENT_04', 
    type: 'patient',
    definition: 'Adult female with involuntary movements and significant cognitive decline.',
  },
  { 
    id: 'p5', 
    name: 'PATIENT_05', 
    type: 'patient',
    definition: 'Male adult with chronic acroparesthesia and unexplained renal dysfunction.',
  },
  { 
    id: 'p6', 
    name: 'PATIENT_06', 
    type: 'patient',
    definition: 'Child presenting with dual sensory loss (hearing and vision).',
  },
  { 
    id: 's1', 
    name: 'HP:0003323 (Muscle Weakness)', 
    type: 'symptom',
    definition: 'Reduced strength of the muscles in the limbs or trunk.',
    associatedDiseases: ['Duchenne Muscular Dystrophy', 'MELAS Syndrome', 'Polymyositis']
  },
  { 
    id: 's2', 
    name: 'HP:0000365 (Hearing Loss)', 
    type: 'symptom',
    definition: 'A partial or total inability to hear.',
    associatedDiseases: ['Alport Syndrome', 'Usher Syndrome', 'MELAS Syndrome']
  },
  { 
    id: 's3', 
    name: 'HP:0001250 (Seizures)', 
    type: 'symptom',
    definition: 'A sudden, uncontrolled electrical disturbance in the brain.',
    associatedDiseases: ['Epilepsy', 'MELAS Syndrome', 'Dravet Syndrome']
  },
  { 
    id: 's4', 
    name: 'HP:0000716 (Depression)', 
    type: 'symptom',
    definition: 'A mental health disorder characterized by persistently depressed mood.',
    associatedDiseases: ['Huntington Disease', 'Wilson Disease']
  },
  { 
    id: 's5', 
    name: 'HP:0001332 (Dystonia)', 
    type: 'symptom',
    definition: 'A state of abnormal muscle tone resulting in muscular spasm and abnormal posture.',
    associatedDiseases: ['Huntington Disease', 'Parkinson Disease']
  },
  { 
    id: 's6', 
    name: 'HP:0000510 (Night Blindness)', 
    type: 'symptom',
    definition: 'Inability to see clearly in dim light or at night.',
    associatedDiseases: ['Usher Syndrome', 'Retinitis Pigmentosa']
  },
  { 
    id: 'g1', 
    name: 'MT-TL1', 
    type: 'gene',
    definition: 'Mitochondrially encoded tRNA leucine 1 (UUA/G). Mutations are linked to MELAS.',
    associatedDiseases: ['MELAS Syndrome', 'Maternally inherited diabetes and deafness']
  },
  { 
    id: 'g2', 
    name: 'MT-ND5', 
    type: 'gene',
    definition: 'Mitochondrially encoded NADH:ubiquinone oxidoreductase core subunit 5.',
    associatedDiseases: ['Leigh Syndrome', 'MELAS Syndrome']
  },
  { 
    id: 'g3', 
    name: 'DMD', 
    type: 'gene',
    definition: 'Dystrophin gene. Mutations cause Duchenne and Becker muscular dystrophies.',
    associatedDiseases: ['Duchenne Muscular Dystrophy', 'Becker Muscular Dystrophy']
  },
  { 
    id: 'g4', 
    name: 'CFTR', 
    type: 'gene',
    definition: 'Cystic fibrosis transmembrane conductance regulator.',
    associatedDiseases: ['Cystic Fibrosis']
  },
  { 
    id: 'g5', 
    name: 'HTT', 
    type: 'gene',
    definition: 'Huntingtin gene. CAG repeat expansions cause Huntington disease.',
    associatedDiseases: ['Huntington Disease']
  },
  { 
    id: 'g6', 
    name: 'GLA', 
    type: 'gene',
    definition: 'Galactosidase alpha. Mutations cause Fabry disease.',
    associatedDiseases: ['Fabry Disease']
  },
  { 
    id: 'd1', 
    name: 'MELAS Syndrome', 
    type: 'disease',
    definition: 'Mitochondrial Encephalomyopathy, Lactic Acidosis, and Stroke-like episodes.',
    associatedDiseases: ['Leigh Syndrome (Differential)', 'MERRF (Differential)']
  },
  { 
    id: 'd2', 
    name: 'MERRF Syndrome', 
    type: 'disease',
    definition: 'Myoclonic Epilepsy with Ragged Red Fibers.',
    associatedDiseases: ['MELAS Syndrome (Differential)', 'Kearns-Sayre Syndrome']
  },
  { 
    id: 'd3', 
    name: 'Duchenne Muscular Dystrophy', 
    type: 'disease',
    definition: 'A severe form of muscular dystrophy caused by genetic mutations in the DMD gene.',
    associatedDiseases: ['Becker Muscular Dystrophy (Differential)']
  },
  { 
    id: 'd4', 
    name: 'Huntington Disease', 
    type: 'disease',
    definition: 'A progressive brain disorder that causes uncontrolled movements and emotional problems.',
    associatedDiseases: ['Chorea-acanthocytosis (Differential)']
  },
  { 
    id: 'd5', 
    name: 'Usher Syndrome', 
    type: 'disease',
    definition: 'A condition characterized by hearing loss or deafness and a progressive vision loss.',
    associatedDiseases: ['Alstrom Syndrome (Differential)']
  },
];

const initialLinks: Link[] = [
  { source: 'p1', target: 's1' },
  { source: 'p1', target: 's2' },
  { source: 'p1', target: 's3' },
  { source: 'p2', target: 's1' },
  { source: 'p3', target: 's1' },
  { source: 'p4', target: 's4' },
  { source: 'p4', target: 's5' },
  { source: 'p6', target: 's2' },
  { source: 'p6', target: 's6' },
  { source: 's1', target: 'd1' },
  { source: 's2', target: 'd1' },
  { source: 's3', target: 'd1' },
  { source: 'g1', target: 'd1' },
  { source: 'g2', target: 'd1' },
  { source: 's1', target: 'd2' },
  { source: 's3', target: 'd2' },
  { source: 's1', target: 'd3' },
  { source: 'g3', target: 'd3' },
  { source: 'p2', target: 'd3' },
  { source: 's4', target: 'd4' },
  { source: 's5', target: 'd4' },
  { source: 'g5', target: 'd4' },
  { source: 'p4', target: 'd4' },
  { source: 's2', target: 'd5' },
  { source: 's6', target: 'd5' },
  { source: 'p6', target: 'd5' },
  { source: 'p5', target: 'g6' },
];

export default function GraphExplorer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['patient', 'symptom', 'gene', 'disease']);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
    toast.info(`Filtering view`, { description: `${type.toUpperCase()} layer ${activeFilters.includes(type) ? 'disabled' : 'enabled'}.` });
  };

  const handleRefresh = () => {
    toast.success('Simulation reset', { description: 'Re-calculating physics forces...' });
  };

  const handleMaximize = () => {
    toast.info('Entering focus mode', { description: 'Expanding viewport to fullscreen.' });
  };

  const handleFullProfile = () => {
    if (selectedNode) {
      toast.info(`Fetching ontology for ${selectedNode.name}`, { description: 'Opening full HPO/OMIM reference documentation.' });
    }
  };

  const [localNodes, setLocalNodes] = useState<Node[]>(initialNodes);
  const [localLinks, setLocalLinks] = useState<Link[]>(initialLinks);

  const handleExpandNeighborhood = () => {
    if (!selectedNode) return;
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Proximity analysis for ${selectedNode.name}...`,
        success: () => {
          const newId = `expand-${Math.random().toString(36).substr(2, 9)}`;
          const expandedNode: Node = {
            id: newId,
            name: `Related: ${selectedNode.name} Domain`,
            type: selectedNode.type,
            definition: "Automatically inferred related entity based on clinical proximity and literature weight.",
            associatedDiseases: selectedNode.associatedDiseases || []
          };
          
          setLocalNodes(prev => [...prev, expandedNode]);
          setLocalLinks(prev => [...prev, { source: selectedNode.id, target: newId }]);
          return "Graph expanded with predictive associations.";
        },
        error: "Failed to fetch biological proximity."
      }
    );
  };

  // Sample data for visualized reasoning
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define defs for filters and gradients
    const defs = svg.append('defs');

    // Background Gradient
    const bgGradient = defs.append('radialGradient')
      .attr('id', 'bg-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    bgGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f8fafc');
    
    bgGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f1f5f9');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#bg-gradient)');
    
    // Node Glow Effect
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Compute filtered data
    const filteredNodes = localNodes.filter(n => activeFilters.includes(n.type)).map(n => ({ ...n }));
    const filteredLinks = localLinks.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const sourceNode = localNodes.find(n => n.id === sourceId);
      const targetNode = localNodes.find(n => n.id === targetId);
      return sourceNode && targetNode && 
             activeFilters.includes(sourceNode.type) && 
             activeFilters.includes(targetNode.type);
    }).map(l => ({ ...l }));

    const simulation = d3.forceSimulation<Node>(filteredNodes)
      .force('link', d3.forceLink<Node, Link>(filteredLinks).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Add Zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const link = g.append('g')
      .attr('stroke', '#475569')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any)
      .on('click', (event, d) => setSelectedNode(d));

    // Dynamic node circles with 'GNN' style
    node.append('circle')
      .attr('r', d => d.type === 'patient' ? 14 : 10)
      .attr('fill', d => {
        if (d.type === 'patient') return '#06b6d4';
        if (d.type === 'symptom') return '#f59e0b';
        if (d.type === 'gene') return '#3b82f6';
        return '#ef4444';
      })
      .attr('filter', 'url(#glow)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-300 hover:r-16');

    node.append('circle')
      .attr('r', d => d.type === 'patient' ? 18 : 14)
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.type === 'patient') return '#06b6d4';
        if (d.type === 'symptom') return '#f59e0b';
        if (d.type === 'gene') return '#3b82f6';
        return '#ef4444';
      })
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3);

    node.append('text')
      .text(d => d.name.split(' (')[0])
      .attr('x', 24)
      .attr('y', 4)
      .style('font-size', '9px')
      .style('font-weight', '800')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('fill', '#475569')
      .style('pointer-events', 'none')
      .attr('class', 'uppercase tracking-widest');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    simulation.alpha(1).restart();

    return () => { simulation.stop(); };
  }, [activeFilters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">Knowledge Graph Explorer</h2>
          <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">Phenotype &#8594; Genotype &#8594; Disease Network</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMaximize}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm">
          <svg ref={svgRef} className="w-full h-full" />
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center gap-2 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Inference Mode</span>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 p-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl flex gap-1 text-[10px] shadow-2xl">
            <button 
              onClick={() => toggleFilter('patient')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest",
                activeFilters.includes('patient') 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" 
                  : "bg-transparent text-slate-400 hover:bg-slate-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", activeFilters.includes('patient') ? "bg-white" : "bg-cyan-500")} /> PATIENT
            </button>
            <button 
              onClick={() => toggleFilter('symptom')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest",
                activeFilters.includes('symptom') 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
                  : "bg-transparent text-slate-400 hover:bg-slate-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", activeFilters.includes('symptom') ? "bg-white" : "bg-amber-500")} /> PHENOTYPE
            </button>
            <button 
              onClick={() => toggleFilter('gene')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest",
                activeFilters.includes('gene') 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                  : "bg-transparent text-slate-400 hover:bg-slate-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", activeFilters.includes('gene') ? "bg-white" : "bg-blue-600")} /> GENE
            </button>
            <button 
              onClick={() => toggleFilter('disease')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest",
                activeFilters.includes('disease') 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" 
                  : "bg-transparent text-slate-400 hover:bg-slate-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", activeFilters.includes('disease') ? "bg-white" : "bg-rose-500")} /> DISEASE
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col overflow-y-auto shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Entity Analytics</h3>
          
          {selectedNode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-black block mb-1 tracking-widest">Entity Type</span>
                <span className="text-xs font-mono text-cyan-600 uppercase font-bold">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block mb-1 tracking-widest">Standard Identification</span>
                <span className="text-xl font-black text-slate-900 leading-tight block">{selectedNode.name}</span>
              </div>

              {selectedNode.definition && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block mb-1 tracking-widest">Medical Definition</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-bold">
                    {selectedNode.definition}
                  </p>
                </div>
              )}

              {selectedNode.associatedDiseases && selectedNode.associatedDiseases.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block mb-2 tracking-widest">Clinical Associations</span>
                  <div className="space-y-2">
                    {selectedNode.associatedDiseases.map((disease, i) => (
                      <div key={i} className="px-3 py-2 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center justify-between group hover:border-blue-300 transition-colors shadow-sm">
                        {disease}
                        <Share2 className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <button 
                  onClick={handleExpandNeighborhood}
                  className="w-full py-3 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Share2 className="w-3.5 h-3.5" /> Expand Neighborhood
                </button>
                <button 
                  onClick={handleFullProfile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  <Info className="w-3.5 h-3.5" /> Full Ontology Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-300">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select active node <br/> for inference data</p>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <span className="text-[9px] text-blue-600 font-bold uppercase block mb-1">Network Density</span>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ 
                  width: `${(localNodes.filter(n => activeFilters.includes(n.type)).length / localNodes.length) * 100}%` 
                }} />
              </div>
              <span className="text-[9px] text-slate-500 mt-2 block font-bold">
                {localNodes.filter(n => activeFilters.includes(n.type)).length} Nodes Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
