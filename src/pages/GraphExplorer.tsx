import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Share2, Info, Maximize2, RefreshCw, Route, Target, Zap, Plus, Trash2, Search, 
  Activity, GitBranch, Dna, Database, Users, ZoomIn, ZoomOut, Compass, ArrowRight, ShieldCheck, 
  Link2, HelpCircle, BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Node, Link } from '../types';

// Custom interface for rich links
interface GraphLink extends Link {
  label?: string;
}

const initialNodes: Node[] = [
  // Patients (Clinical Entities)
  { id: 'p1', name: 'PATIENT_01 (Intake Notes)', type: 'patient', definition: '3-year-old male presenting with global developmental delay, intractable generalized seizures, and hypotonia.' },
  { id: 'p2', name: 'PATIENT_02 (Intake Notes)', type: 'patient', definition: 'Infant female presenting with severe hypertrophic cardiomyopathy, lactic acidosis, and proximal muscle weakness.' },
  { id: 'p3', name: 'PATIENT_03 (Intake Notes)', type: 'patient', definition: '7-year-old male with progressive bilateral lower limb muscle weakness, elevated creatine kinase, and positive Gowers sign.' },
  { id: 'p4', name: 'PATIENT_04 (Intake Notes)', type: 'patient', definition: '34-year-old female presenting with adult-onset chorea, progressive cognitive decline, and depression.' },
  
  // HPO Terms (Symptoms)
  { id: 'hpo_seizures', name: 'HP:0001250 (Seizures)', type: 'symptom', definition: 'Sudden, involuntary, and highly synchronized electrical disturbances in the cerebral cortex.' },
  { id: 'hpo_weakness', name: 'HP:0003323 (Muscle Weakness)', type: 'symptom', definition: 'Reduced muscle strength affecting proximal or distal groups.' },
  { id: 'hpo_hearing', name: 'HP:0000365 (Hearing Loss)', type: 'symptom', definition: 'Partial or complete loss of auditory sensory capability.' },
  { id: 'hpo_dystonia', name: 'HP:0001332 (Dystonia)', type: 'symptom', definition: 'Involuntary, sustained muscle contractions causing repetitive twisting movements and abnormal postures.' },
  { id: 'hpo_cardiomyopathy', name: 'HP:0001639 (Hypertrophic Cardiomyopathy)', type: 'symptom', definition: 'Asymmetric or symmetric thickening of ventricular walls without an obvious hypertensive cause.' },
  { id: 'hpo_delay', name: 'HP:0001263 (Developmental Delay)', type: 'symptom', definition: 'Significant delay in achieving cognitive, motor, or speech milestones.' },
  { id: 'hpo_hypotonia', name: 'HP:0001252 (Hypotonia)', type: 'symptom', definition: 'Markedly decreased resting muscle tone, clinically described as floppiness.' },
  { id: 'hpo_chorea', name: 'HP:0002072 (Chorea)', type: 'symptom', definition: 'Involuntary, irregular, spasmodic, and non-repetitive movements of the limbs and face.' },

  // Genomic Variants
  { id: 'var_kcnq2', name: 'KCNQ2 c.740G>A (p.Arg247His)', type: 'gene', definition: 'A missense variant in the KCNQ2 voltage-gated potassium channel gene, highly correlated with early onset seizures.' },
  { id: 'var_mttl1', name: 'MT-TL1 m.3243A>G (tRNA Leu)', type: 'gene', definition: 'A mitochondrial point variant causing impaired translation of respiratory chain subunits.' },
  { id: 'var_dmd', name: 'DMD Exon 44 Deletion', type: 'gene', definition: 'Out-of-frame deletion of exon 44 in the dystrophin gene, preventing translation of functional protein.' },
  { id: 'var_htt', name: 'HTT CAG Trinucleotide Expansion (>40)', type: 'gene', definition: 'Expansion of CAG repeats within exon 1 of the HTT gene, leading to polyglutamine accumulation and neurotoxicity.' },

  // Diseases / Syndromes
  { id: 'dis_melas', name: 'MELAS Syndrome', type: 'disease', definition: 'Mitochondrial Encephalomyopathy, Lactic Acidosis, and Stroke-like episodes.' },
  { id: 'dis_dmd', name: 'Duchenne Muscular Dystrophy', type: 'disease', definition: 'A severe, progressive X-linked recessive muscle-wasting disease.' },
  { id: 'dis_huntington', name: 'Huntington Disease', type: 'disease', definition: 'An autosomal dominant neurodegenerative disorder characterized by motor, cognitive, and psychiatric symptoms.' },
  { id: 'dis_kcnq2', name: 'KCNQ2-Related Encephalopathy', type: 'disease', definition: 'Early infantile epileptic encephalopathy characterized by onset of intractable seizures in the first week of life.' }
];

const initialLinks: GraphLink[] = [
  // Patient 1 (Clinical Notes)
  { source: 'p1', target: 'hpo_seizures', label: 'presents_with' },
  { source: 'p1', target: 'hpo_delay', label: 'presents_with' },
  { source: 'p1', target: 'hpo_hypotonia', label: 'presents_with' },
  { source: 'p1', target: 'var_kcnq2', label: 'carries_variant' },

  // Patient 2 (Clinical Notes)
  { source: 'p2', target: 'hpo_cardiomyopathy', label: 'presents_with' },
  { source: 'p2', target: 'hpo_hypotonia', label: 'presents_with' },
  { source: 'p2', target: 'var_mttl1', label: 'carries_variant' },

  // Patient 3 (Clinical Notes)
  { source: 'p3', target: 'hpo_weakness', label: 'presents_with' },
  { source: 'p3', target: 'var_dmd', label: 'carries_variant' },

  // Patient 4 (Clinical Notes)
  { source: 'p4', target: 'hpo_chorea', label: 'presents_with' },
  { source: 'p4', target: 'var_htt', label: 'carries_variant' },

  // Phenotype to Disease linkages
  { source: 'hpo_seizures', target: 'dis_kcnq2', label: 'characterizes' },
  { source: 'hpo_delay', target: 'dis_kcnq2', label: 'characterizes' },
  { source: 'hpo_hypotonia', target: 'dis_kcnq2', label: 'characterizes' },
  { source: 'hpo_cardiomyopathy', target: 'dis_melas', label: 'characterizes' },
  { source: 'hpo_hypotonia', target: 'dis_melas', label: 'characterizes' },
  { source: 'hpo_weakness', target: 'dis_dmd', label: 'characterizes' },
  { source: 'hpo_chorea', target: 'dis_huntington', label: 'characterizes' },

  // Genomic Variant to Disease linkages
  { source: 'var_kcnq2', target: 'dis_kcnq2', label: 'pathogenic_for' },
  { source: 'var_mttl1', target: 'dis_melas', label: 'pathogenic_for' },
  { source: 'var_dmd', target: 'dis_dmd', label: 'pathogenic_for' },
  { source: 'var_htt', target: 'dis_huntington', label: 'pathogenic_for' }
];

const GraphExplorer = React.memo(function GraphExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);

  // Responsive SVG Dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeTab, setActiveTab] = useState<'path' | 'curator' | 'inspector' | 'gnn'>('path');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['patient', 'symptom', 'gene', 'disease']);
  
  // GNN States
  const [isGnnRunning, setIsGnnRunning] = useState(false);
  const [gnnPredictions, setGnnPredictions] = useState<any[]>([]);
  const [gnnLayerCount, setGnnLayerCount] = useState<number>(3);
  const [gnnEpochs, setGnnEpochs] = useState<number>(200);
  
  // Pathway Finder States
  const [pathSource, setPathSource] = useState<string | null>(null);
  const [pathTarget, setPathTarget] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [pathSteps, setPathSteps] = useState<Node[]>([]);

  // Graph Curation States
  const [localNodes, setLocalNodes] = useState<Node[]>(initialNodes);
  const [localLinks, setLocalLinks] = useState<GraphLink[]>(initialLinks);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<'patient' | 'symptom' | 'gene' | 'disease'>('symptom');
  const [newNodeDef, setNewNodeDef] = useState('');
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeLabel, setNewEdgeLabel] = useState('associated_with');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGraphActive, setFilterGraphActive] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // 1. ResizeObserver for responsive canvas scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 400),
        height: Math.max(height, 500)
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  // Find Path via BFS
  const findShortestPath = useCallback(() => {
    if (!pathSource || !pathTarget) return;

    const queue: [string, string[]][] = [[pathSource, [pathSource]]];
    const visited = new Set<string>();
    visited.add(pathSource);

    while (queue.length > 0) {
      const [current, path] = queue.shift()!;
      if (current === pathTarget) {
        setHighlightedPath(path);
        const resolvedNodes = path.map(id => localNodes.find(n => n.id === id)).filter(Boolean) as Node[];
        setPathSteps(resolvedNodes);
        toast.success("Biological Path Resolved", { 
          description: `Identified a ${path.length - 1}-step causal route between selected nodes.` 
        });
        return;
      }

      const neighbors = localLinks
        .filter(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
          return s === current || t === current;
        })
        .map(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
          return s === current ? t : s;
        });

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, [...path, neighbor]]);
        }
      }
    }
    toast.error("No causal path found between selected entities.");
  }, [pathSource, pathTarget, localNodes, localLinks]);

  // Handle curation: add custom node
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) {
      toast.error("Node label cannot be empty.");
      return;
    }
    const id = `node_${Date.now()}`;
    const formattedName = newNodeType === 'symptom' && !newNodeName.startsWith('HP:') 
      ? `HP:${Math.floor(1000000 + Math.random() * 9000000)} (${newNodeName})`
      : newNodeName;

    const created: Node = {
      id,
      name: formattedName,
      type: newNodeType,
      definition: newNodeDef.trim() || 'Clinically added custom entity.'
    };

    setLocalNodes(prev => [...prev, created]);
    setNewNodeName('');
    setNewNodeDef('');
    toast.success("Clinical Entity Synthesized", { description: `${newNodeType.toUpperCase()} added to the logic network.` });
  };

  // Handle curation: add custom edge
  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget) {
      toast.error("Please select both source and target entities.");
      return;
    }
    if (newEdgeSource === newEdgeTarget) {
      toast.error("Cannot create loopback relationship on the same entity.");
      return;
    }

    const exists = localLinks.some(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return (s === newEdgeSource && t === newEdgeTarget) || (s === newEdgeTarget && t === newEdgeSource);
    });

    if (exists) {
      toast.error("A relationship already exists between these entities.");
      return;
    }

    const created: GraphLink = {
      source: newEdgeSource,
      target: newEdgeTarget,
      label: newEdgeLabel
    };

    setLocalLinks(prev => [...prev, created]);
    toast.success("Logic Link Forged", { description: `Relation established: [${newEdgeLabel.toUpperCase()}]` });
  };

  // Delete clinical node or link
  const handleDeleteNode = (id: string) => {
    setLocalNodes(prev => prev.filter(n => n.id !== id));
    setLocalLinks(prev => prev.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return s !== id && t !== id;
    }));
    if (selectedNode?.id === id) setSelectedNode(null);
    if (pathSource === id) setPathSource(null);
    if (pathTarget === id) setPathTarget(null);
    setHighlightedPath([]);
    setPathSteps([]);
    toast.success("Entity Purged", { description: "Pruned node and associated structural edges from active session." });
  };

  // Node details helper for the connection inspector
  const incomingConnections = useMemo(() => {
    if (!selectedNode) return [];
    return localLinks.filter(l => {
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return targetId === selectedNode.id;
    }).map(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      return {
        node: localNodes.find(n => n.id === sourceId),
        label: l.label || 'linked_with'
      };
    }).filter(item => item.node);
  }, [selectedNode, localLinks, localNodes]);

  const outgoingConnections = useMemo(() => {
    if (!selectedNode) return [];
    return localLinks.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      return sourceId === selectedNode.id;
    }).map(l => {
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return {
        node: localNodes.find(n => n.id === targetId),
        label: l.label || 'linked_with'
      };
    }).filter(item => item.node);
  }, [selectedNode, localLinks, localNodes]);

  // Programmatic Graph Zooming & Panning
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Translate camera view directly to center coordinates of a node
  const centerOnNode = useCallback((nodeId: string) => {
    const targetNode = localNodes.find(n => n.id === nodeId);
    if (targetNode && svgRef.current && zoomBehaviorRef.current) {
      // Find coordinates in active simulation
      const simulationNodes = simulationRef.current?.nodes() || [];
      const simNode = simulationNodes.find(n => n.id === nodeId);
      const x = simNode?.x ?? targetNode.x ?? (dimensions.width / 2);
      const y = simNode?.y ?? targetNode.y ?? (dimensions.height / 2);

      const svgElement = d3.select(svgRef.current);
      const transform = d3.zoomIdentity
        .translate(dimensions.width / 2 - x * 1.5, dimensions.height / 2 - y * 1.5)
        .scale(1.5);

      svgElement.transition().duration(750).call(zoomBehaviorRef.current.transform, transform);
      setSelectedNode(targetNode);
      setActiveTab('inspector');
      toast.success(`Centered view on ${targetNode.name}`);
    }
  }, [localNodes, dimensions]);

  // Node Search Autocomplete Filter
  const filteredSearchNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return localNodes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, localNodes]);

  // Memoized Filtered Nodes and Links for UI and Simulation
  const { filteredNodes, filteredLinks } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. First, find links that match category filters
    const categoryLinks = localLinks.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const sourceNode = localNodes.find(n => n.id === sourceId);
      const targetNode = localNodes.find(n => n.id === targetId);
      return sourceNode && targetNode && activeFilters.includes(sourceNode.type) && activeFilters.includes(targetNode.type);
    });

    // 2. Filter links based on search query if active
    const filteredL = categoryLinks.filter(l => {
      if (!filterGraphActive || !query) return true;

      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const sourceNode = localNodes.find(n => n.id === sourceId);
      const targetNode = localNodes.find(n => n.id === targetId);

      if (!sourceNode || !targetNode) return false;

      const labelMatches = l.label && l.label.toLowerCase().includes(query);
      const sourceMatches = sourceNode.name.toLowerCase().includes(query);
      const targetMatches = targetNode.name.toLowerCase().includes(query);
      const sourceDefMatches = sourceNode.definition && sourceNode.definition.toLowerCase().includes(query);
      const targetDefMatches = targetNode.definition && targetNode.definition.toLowerCase().includes(query);

      return labelMatches || sourceMatches || targetMatches || sourceDefMatches || targetDefMatches;
    }).map(l => ({ ...l }));

    // 3. Filter nodes based on category and query
    const filteredN = localNodes.filter(n => {
      // Category filter check
      if (!activeFilters.includes(n.type)) return false;

      // Search query filter check
      if (filterGraphActive && query) {
        const matchesDirectly = n.name.toLowerCase().includes(query) || 
                                n.type.toLowerCase().includes(query) || 
                                (n.definition && n.definition.toLowerCase().includes(query));
        
        if (matchesDirectly) return true;

        // Or connected by a matching link
        const connectedByMatchingLink = filteredL.some(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
          return s === n.id || t === n.id;
        });

        return connectedByMatchingLink;
      }

      return true;
    }).map(n => ({ ...n }));

    return { filteredNodes: filteredN, filteredLinks: filteredL };
  }, [localNodes, localLinks, activeFilters, searchQuery, filterGraphActive]);

  // Main D3 Simulation Logic
  useEffect(() => {
    if (!svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Technical grid pattern background
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'technical-grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#technical-grid)');

    // Node style linear gradients
    const patientGrad = defs.append('linearGradient').attr('id', 'patient-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    patientGrad.append('stop').attr('offset', '0%').attr('stop-color', '#22d3ee');
    patientGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0891b2');

    const symptomGrad = defs.append('linearGradient').attr('id', 'symptom-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    symptomGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24');
    symptomGrad.append('stop').attr('offset', '100%').attr('stop-color', '#d97706');

    const geneGrad = defs.append('linearGradient').attr('id', 'gene-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    geneGrad.append('stop').attr('offset', '0%').attr('stop-color', '#818cf8');
    geneGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4f46e5');

    const diseaseGrad = defs.append('linearGradient').attr('id', 'disease-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    diseaseGrad.append('stop').attr('offset', '0%').attr('stop-color', '#34d399');
    diseaseGrad.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Arrow markers for directed relationships
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28) // Offset from target center
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#cbd5e1');

    defs.append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#3b82f6');

    // Create local copies of filteredNodes and filteredLinks for simulation state
    const simulationNodes = filteredNodes.map(n => ({ ...n }));
    const simulationLinks = filteredLinks.map(l => ({ ...l }));

    // Force Simulation configuration
    const simulation = d3.forceSimulation<Node>(simulationNodes)
      .force('link', d3.forceLink<Node, Link>(simulationLinks).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70));

    simulationRef.current = simulation;

    // Outer group supporting zooming
    const g = svg.append('g');

    // Instantiate and bind zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Draw link edges
    const link = g.append('g')
      .selectAll('line')
      .data(simulationLinks)
      .join('line')
      .attr('stroke', d => {
        const s = typeof d.source === 'string' ? d.source : (d.source as any).id;
        const t = typeof d.target === 'string' ? d.target : (d.target as any).id;
        const idxS = highlightedPath.indexOf(s);
        const idxT = highlightedPath.indexOf(t);
        const onPath = idxS !== -1 && idxT !== -1 && Math.abs(idxS - idxT) === 1;
        return onPath ? '#3b82f6' : '#e2e8f0';
      })
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', d => {
        const s = typeof d.source === 'string' ? d.source : (d.source as any).id;
        const t = typeof d.target === 'string' ? d.target : (d.target as any).id;
        const idxS = highlightedPath.indexOf(s);
        const idxT = highlightedPath.indexOf(t);
        const onPath = idxS !== -1 && idxT !== -1 && Math.abs(idxS - idxT) === 1;
        return onPath ? 4 : 2;
      })
      .attr('stroke-dasharray', d => {
        const s = typeof d.source === 'string' ? d.source : (d.source as any).id;
        const t = typeof d.target === 'string' ? d.target : (d.target as any).id;
        const idxS = highlightedPath.indexOf(s);
        const idxT = highlightedPath.indexOf(t);
        const onPath = idxS !== -1 && idxT !== -1 && Math.abs(idxS - idxT) === 1;
        return onPath ? '6,3' : 'none';
      })
      .attr('marker-end', d => {
        const s = typeof d.source === 'string' ? d.source : (d.source as any).id;
        const t = typeof d.target === 'string' ? d.target : (d.target as any).id;
        const idxS = highlightedPath.indexOf(s);
        const idxT = highlightedPath.indexOf(t);
        const onPath = idxS !== -1 && idxT !== -1 && Math.abs(idxS - idxT) === 1;
        return onPath ? 'url(#arrow-highlight)' : 'url(#arrow)';
      });

    // Draw semantic link labels at midpoint
    const linkLabel = g.append('g')
      .selectAll('g')
      .data(simulationLinks)
      .join('g')
      .attr('pointer-events', 'none');

    // Clean label background capsule
    linkLabel.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', '#ffffff')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .style('opacity', 0.9);

    linkLabel.append('text')
      .text((d: any) => d.label || 'related_to')
      .style('font-size', '8px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .style('font-weight', '700')
      .style('fill', '#64748b')
      .style('text-anchor', 'middle')
      .attr('dy', '2.5');

    // Create node container groups
    const node = g.append('g')
      .selectAll('g')
      .data(simulationNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => { 
          if (!event.active) simulation.alphaTarget(0.2).restart(); 
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
      .on('click', (event, d) => {
        setSelectedNode(d);
        setActiveTab('inspector');
      });

    const query = searchQuery.trim().toLowerCase();

    // 1. Dynamic pulsing outer halos for matched, selected, or pathway nodes
    node.append('circle')
      .attr('r', d => {
        if (selectedNode?.id === d.id) return 22;
        if (highlightedPath.includes(d.id)) return 20;
        const isSearchMatch = query && (
          d.name.toLowerCase().includes(query) || 
          d.type.toLowerCase().includes(query) || 
          (d.definition && d.definition.toLowerCase().includes(query))
        );
        if (isSearchMatch) return 18;
        return 16;
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (selectedNode?.id === d.id) return '#10b981'; // Emerald glow
        if (highlightedPath.includes(d.id)) return '#3b82f6'; // Blue glow
        const isSearchMatch = query && (
          d.name.toLowerCase().includes(query) || 
          d.type.toLowerCase().includes(query) || 
          (d.definition && d.definition.toLowerCase().includes(query))
        );
        if (isSearchMatch) return '#f59e0b'; // Amber glow for search match
        return 'transparent';
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => {
        if (highlightedPath.includes(d.id)) return '4, 2';
        const isSearchMatch = query && (
          d.name.toLowerCase().includes(query) || 
          d.type.toLowerCase().includes(query) || 
          (d.definition && d.definition.toLowerCase().includes(query))
        );
        if (isSearchMatch) return '2, 2';
        return 'none';
      })
      .style('opacity', 0.85)
      .attr('class', d => {
        if (highlightedPath.includes(d.id)) return 'pulse-ring';
        const isSearchMatch = query && (
          d.name.toLowerCase().includes(query) || 
          d.type.toLowerCase().includes(query) || 
          (d.definition && d.definition.toLowerCase().includes(query))
        );
        if (isSearchMatch) return 'pulse-ring';
        return '';
      });

    // 2. Main central node circle with beautiful gradient coloring
    node.append('circle')
      .attr('r', 14)
      .attr('fill', d => {
        if (d.type === 'patient') return 'url(#patient-grad)';
        if (d.type === 'symptom') return 'url(#symptom-grad)';
        if (d.type === 'gene') return 'url(#gene-grad)';
        return 'url(#disease-grad)';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0px 2px 4px rgba(15, 23, 42, 0.15))');

    // 3. Shorthand typography emblem centered directly in each node circle
    node.append('text')
      .text(d => {
        if (d.type === 'patient') return 'P';
        if (d.type === 'symptom') return 'H'; // HPO representation
        if (d.type === 'gene') return 'V';    // Variant / Mutation
        return 'D';                          // Disease node
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '3.5')
      .style('font-size', '9px')
      .style('font-weight', '900')
      .style('fill', '#ffffff')
      .style('pointer-events', 'none');

    // 4. Double-layered text labels with high contrast halo backing
    node.append('text')
      .text(d => d.name.split(' (')[0])
      .attr('x', 20)
      .attr('y', 4)
      .style('font-size', '10px')
      .style('font-weight', '800')
      .style('fill', '#ffffff')
      .style('stroke', '#ffffff')
      .style('stroke-width', '4px')
      .style('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .style('opacity', 0.9);

    node.append('text')
      .text(d => d.name.split(' (')[0])
      .attr('x', 20)
      .attr('y', 4)
      .style('font-size', '10px')
      .style('font-weight', '800')
      .style('fill', '#334155')
      .style('pointer-events', 'none');

    // Standard D3 tick update calculations
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      linkLabel.each(function(this: any, d: any) {
        const x1 = (d.source as any).x;
        const y1 = (d.source as any).y;
        const x2 = (d.target as any).x;
        const y2 = (d.target as any).y;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        const gEl = d3.select(this);
        const textEl = gEl.select('text');
        const textNode = textEl.node() as SVGTextContentElement;
        
        if (textNode) {
          const bbox = textNode.getBBox();
          gEl.select('rect')
            .attr('x', -bbox.width / 2 - 4)
            .attr('y', -bbox.height / 2 - 2)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 4);
        }

        gEl.attr('transform', `translate(${mx}, ${my})`);
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [filteredNodes, filteredLinks, highlightedPath, dimensions, selectedNode, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">Neuro-Symbolic Graph Explorer</h2>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Map and curate clinical notes, HPO lineages, and genomic variants</p>
        </div>
        
        {/* Quick Search & Filter Toggle Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Active Filter Toggle Button */}
          <button
            onClick={() => setFilterGraphActive(prev => !prev)}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all shadow-sm shrink-0",
              filterGraphActive 
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-600/10" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
            title={filterGraphActive ? "Currently hiding non-matching elements" : "Currently showing all elements and highlighting matches"}
          >
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>{filterGraphActive ? "Filtering On" : "Filter Off"}</span>
          </button>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Filter nodes & relations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 transition-colors"
              >
                Clear
              </button>
            )}
            
            {filteredSearchNodes.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Quick suggestions:
                </div>
                {filteredSearchNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSearchQuery(node.name.split(' (')[0]);
                      centerOnNode(node.id);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="truncate flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        node.type === 'patient' ? "bg-cyan-500" :
                        node.type === 'symptom' ? "bg-amber-500" :
                        node.type === 'gene' ? "bg-indigo-500" : "bg-emerald-500"
                      )} />
                      <span className="text-xs font-bold text-slate-700 truncate">{node.name}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">{node.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[720px]" ref={containerRef}>
        
        {/* D3 Canvas container */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 relative overflow-hidden shadow-sm flex flex-col">
          <svg ref={svgRef} className="w-full flex-1" />
          
          {/* Overlay Grid Pattern Spinning Halos CSS */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes dashspin {
              from { stroke-dashoffset: 20; }
              to { stroke-dashoffset: 0; }
            }
            .pulse-ring {
              animation: dashspin 1.5s linear infinite;
              stroke-dasharray: 6, 3;
            }
          `}} />

          {/* Canvas Floating Tools Overlay */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xl">
               <Route className="w-4 h-4 text-blue-600" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Knowledge Network</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {(searchQuery || activeFilters.length < 4) && (
              <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl flex items-center gap-2 shadow-lg w-fit animate-in slide-in-from-left-2 duration-300">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Showing {filteredNodes.length} of {localNodes.length} Nodes
                </span>
                {searchQuery && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" title="Filtered by search query" />
                )}
              </div>
            )}
          </div>

          {/* Persistent Graph Legend & Interaction Key */}
          <div className="absolute top-28 left-6 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-xl z-10 overflow-hidden flex flex-col transition-all duration-300">
            {/* Legend Header */}
            <div 
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between cursor-pointer hover:bg-slate-100/85 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Network Map Key</span>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                {isLegendOpen ? "Collapse" : "Expand"}
              </button>
            </div>

            {/* Legend Content */}
            {isLegendOpen && (
              <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[380px] overflow-y-auto custom-scrollbar">
                {/* Node Types Section */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Biological Entities</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'patient', color: 'bg-cyan-500 border-cyan-200', text: 'Clinical Note (Intake)', desc: 'Unstructured notes & phenotype extractions' },
                      { type: 'symptom', color: 'bg-amber-500 border-amber-200', text: 'HPO Term (Symptom)', desc: 'Standardized Human Phenotype Ontology keys' },
                      { type: 'gene', color: 'bg-indigo-500 border-indigo-200', text: 'Genomic Variant', desc: 'Identified nucleotide variants and indels' },
                      { type: 'disease', color: 'bg-emerald-500 border-emerald-200', text: 'Disease / Syndrome', desc: 'Prioritized candidate diagnoses (OMIM)' }
                    ].map((n) => (
                      <div key={n.type} className="flex items-start gap-2.5">
                        <span className={cn("w-3 h-3 rounded-full shrink-0 border mt-0.5", n.color)} />
                        <div>
                          <div className="text-[10px] font-bold text-slate-700 leading-tight">{n.text}</div>
                          <div className="text-[9px] text-slate-400 leading-normal">{n.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationship Types Section */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Relationships (Directed)</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'presents_with', from: 'Clinical Note', to: 'HPO Term' },
                      { label: 'carries_variant', from: 'Clinical Note', to: 'Variant' },
                      { label: 'characterizes', from: 'HPO Term', to: 'Syndrome' },
                      { label: 'pathogenic_for', from: 'Variant', to: 'Syndrome' }
                    ].map((l) => (
                      <div key={l.label} className="flex flex-col gap-0.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-slate-600 bg-white border border-slate-150 px-1 py-0.5 rounded">
                            {l.label}
                          </span>
                        </div>
                        <div className="text-[8px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <span>{l.from}</span>
                          <ArrowRight className="w-2 h-2 text-slate-300" />
                          <span>{l.to}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Path Causal Highlight Section */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Path Highlight</h4>
                  <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-2 rounded-xl">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-500" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider leading-none">
                      Active Causal Path
                    </span>
                  </div>
                </div>

                {/* Interaction Tips Section */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[8px] text-slate-400 leading-relaxed font-mono">
                    💡 <strong className="text-slate-600">Double-click</strong> any node to set as Path Source/Target. <strong className="text-slate-600">Drag</strong> nodes to explore or pin.
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredNodes.length === 0 && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-sm">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">No Matching Logic Entities</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  No nodes or relationships match your search query <strong className="text-slate-700">"{searchQuery}"</strong> with the active category filters.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilters(['patient', 'symptom', 'gene', 'disease']);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Graph Controls overlay */}
          <div className="absolute top-6 right-6 flex flex-col gap-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-xl">
            <button 
              onClick={handleZoomIn} 
              className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={handleResetZoom} 
              className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all"
              title="Reset Zoom & Centering"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Legend + Category Filter bar */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-3xl shadow-xl">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Filter Modules:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'patient', color: 'bg-cyan-500 border-cyan-100', label: 'Clinical Note' },
                  { type: 'symptom', color: 'bg-amber-500 border-amber-100', label: 'HPO (HP:)' },
                  { type: 'gene', color: 'bg-indigo-500 border-indigo-100', label: 'Variant (DNA)' },
                  { type: 'disease', color: 'bg-emerald-500 border-emerald-100', label: 'Syndrome' }
                ].map((item) => (
                  <button 
                    key={item.type} 
                    onClick={() => toggleFilter(item.type)} 
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all", 
                      activeFilters.includes(item.type) 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10" 
                        : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 border", item.color)} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel for interaction and editing */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm overflow-hidden">
          
          {/* Section Selector Tab Headers */}
          <div className="grid grid-cols-4 bg-slate-200/50 p-1 rounded-2xl gap-1 shrink-0">
            {[
              { id: 'path' as const, label: 'Path', icon: Route },
              { id: 'curator' as const, label: 'Curator', icon: Compass },
              { id: 'inspector' as const, label: 'Inspect', icon: Info },
              { id: 'gnn' as const, label: 'GNN AI', icon: BrainCircuit }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-400 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 animate-in fade-in" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
            
            {/* TAB 1: PATH DISCOVERY */}
            {activeTab === 'path' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Path-Finder</h3>
                    {(pathSource || pathTarget) && (
                      <button 
                        onClick={() => { setPathSource(null); setPathTarget(null); setHighlightedPath([]); setPathSteps([]); }} 
                        className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline flex items-center gap-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Source selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-cyan-500" /> Start Node (Source)
                      </label>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                        <span className="truncate">{pathSource ? localNodes.find(n => n.id === pathSource)?.name : 'None selected'}</span>
                        {selectedNode && selectedNode.id !== pathSource && (
                          <button 
                            onClick={() => setPathSource(selectedNode.id)} 
                            className="text-[8px] font-black uppercase text-blue-600 hover:underline shrink-0 pl-2"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Target selection */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-rose-500" /> End Node (Target)
                      </label>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                        <span className="truncate">{pathTarget ? localNodes.find(n => n.id === pathTarget)?.name : 'None selected'}</span>
                        {selectedNode && selectedNode.id !== pathTarget && (
                          <button 
                            onClick={() => setPathTarget(selectedNode.id)} 
                            className="text-[8px] font-black uppercase text-blue-600 hover:underline shrink-0 pl-2"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={!pathSource || !pathTarget} 
                    onClick={findShortestPath} 
                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-600/10 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Solve Causal Path
                  </button>
                </div>

                {/* Path breakdown timeline */}
                {pathSteps.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-blue-500" /> Path Timeline ({pathSteps.length} stages)
                    </h4>
                    <div className="relative pl-6 space-y-4">
                      {/* Connection trace vertical line */}
                      <div className="absolute top-2.5 bottom-2.5 left-2.5 w-0.5 bg-blue-100" />
                      
                      {pathSteps.map((step, idx) => (
                        <div key={step.id} className="relative group">
                          {/* Colored dot marker */}
                          <div className={cn(
                            "absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-4 ring-slate-50 transition-transform group-hover:scale-125",
                            idx === 0 ? "bg-cyan-500" : idx === pathSteps.length - 1 ? "bg-emerald-500" : "bg-blue-500"
                          )} />
                          
                          <button 
                            onClick={() => centerOnNode(step.id)} 
                            className="text-left hover:underline block"
                          >
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Stage {String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">{step.name}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GRAPH CURATOR */}
            {activeTab === 'curator' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Form to add a Node */}
                <form onSubmit={handleAddNode} className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Synthesize Entity</h3>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Entity Name / Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. HP:0001263 or Muscle Atrophy"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Ontology Type</label>
                    <select 
                      value={newNodeType}
                      onChange={(e) => setNewNodeType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      <option value="patient">Patient Notes (Clinical)</option>
                      <option value="symptom">HPO Term (Symptom)</option>
                      <option value="gene">Genomic Variant (Gene)</option>
                      <option value="disease">Syndrome (Disease)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Definition / Intake Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="Enter optional description or notes..."
                      value={newNodeDef}
                      onChange={(e) => setNewNodeDef(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Inject Node
                  </button>
                </form>

                {/* 2. Form to add a Link */}
                <form onSubmit={handleAddEdge} className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">Forge Relationship</h3>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Source Entity (Origin)</label>
                    <select 
                      value={newEdgeSource}
                      onChange={(e) => setNewEdgeSource(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">-- Select Source --</option>
                      {localNodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Target Entity (Destination)</label>
                    <select 
                      value={newEdgeTarget}
                      onChange={(e) => setNewEdgeTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">-- Select Target --</option>
                      {localNodes.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400">Semantic Link Label</label>
                    <select 
                      value={newEdgeLabel}
                      onChange={(e) => setNewEdgeLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="presents_with">presents_with (Patient-&gt;HPO)</option>
                      <option value="carries_variant">carries_variant (Patient-&gt;Variant)</option>
                      <option value="characterizes">characterizes (HPO-&gt;Disease)</option>
                      <option value="pathogenic_for">pathogenic_for (Variant-&gt;Disease)</option>
                      <option value="associated_with">associated_with</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Link Entities
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: CONNECTION INSPECTOR */}
            {activeTab === 'inspector' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {selectedNode ? (
                  <div className="space-y-5">
                    {/* Selected Node Summary */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={cn(
                            "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full shrink-0",
                            selectedNode.type === 'patient' ? "bg-cyan-100 text-cyan-800" :
                            selectedNode.type === 'symptom' ? "bg-amber-100 text-amber-800" :
                            selectedNode.type === 'gene' ? "bg-indigo-100 text-indigo-800" :
                            "bg-emerald-100 text-emerald-800"
                          )}>
                            {selectedNode.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => centerOnNode(selectedNode.id)} 
                            className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-lg shadow-sm transition-all"
                            title="Center View"
                          >
                            <Target className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNode(selectedNode.id)} 
                            className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm transition-all"
                            title="Delete Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-black text-slate-900 leading-snug uppercase">{selectedNode.name}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-bold bg-white border border-slate-100 p-3 rounded-2xl">
                        {selectedNode.definition || 'No additional details logged.'}
                      </p>
                    </div>

                    {/* Fast Route Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setPathSource(selectedNode.id); toast.info(`Source set to ${selectedNode.name.split(' (')[0]}`); }} 
                        className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[9px] font-black uppercase tracking-widest text-slate-600 rounded-xl"
                      >
                        Set Source
                      </button>
                      <button 
                        onClick={() => { setPathTarget(selectedNode.id); toast.info(`Target set to ${selectedNode.name.split(' (')[0]}`); }} 
                        className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[9px] font-black uppercase tracking-widest text-slate-600 rounded-xl"
                      >
                        Set Target
                      </button>
                    </div>

                    {/* Logic relationships lists */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      
                      {/* Incoming Connections */}
                      <div className="space-y-2.5">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incoming Relations</h4>
                        {incomingConnections.length > 0 ? (
                          <div className="space-y-1.5">
                            {incomingConnections.map(({ node: n, label }) => n && (
                              <div key={n.id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between text-[11px] gap-2">
                                <button onClick={() => centerOnNode(n.id)} className="font-bold text-slate-800 hover:underline truncate hover:text-blue-600 text-left">
                                  {n.name.split(' (')[0]}
                                </button>
                                <span className="font-mono text-[7px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-bold italic">No incoming links detected.</p>
                        )}
                      </div>

                      {/* Outgoing Connections */}
                      <div className="space-y-2.5 pt-2">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outgoing Relations</h4>
                        {outgoingConnections.length > 0 ? (
                          <div className="space-y-1.5">
                            {outgoingConnections.map(({ node: n, label }) => n && (
                              <div key={n.id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between text-[11px] gap-2">
                                <button onClick={() => centerOnNode(n.id)} className="font-bold text-slate-800 hover:underline truncate hover:text-blue-600 text-left">
                                  {n.name.split(' (')[0]}
                                </button>
                                <span className="font-mono text-[7px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-bold italic">No outgoing links detected.</p>
                        )}
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400">
                    <HelpCircle className="w-12 h-12 text-slate-200 mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest mb-1">Inspector Idle</span>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-xs">Select any biological entity on the canvas grid to inspect its definitions and network associations.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: GNN INFERENCE */}
            {activeTab === 'gnn' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Graph Neural Network AI</h3>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                    Run message-passing GNN node classification and link prediction over the active biological topology.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">GNN Architecture Model</label>
                      <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                        <option>Graph Attention Network (GAT-v2)</option>
                        <option>GraphSAGE (Spatio-Temporal)</option>
                        <option>Relational-GCN (R-GCN)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">GNN Layers</label>
                        <input 
                          type="number" 
                          min={2} 
                          max={5} 
                          value={gnnLayerCount}
                          onChange={(e) => setGnnLayerCount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Epochs</label>
                        <input 
                          type="number" 
                          min={50} 
                          max={1000} 
                          step={50}
                          value={gnnEpochs}
                          onChange={(e) => setGnnEpochs(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isGnnRunning} 
                    onClick={() => {
                      setIsGnnRunning(true);
                      setGnnPredictions([]);
                      setTimeout(() => {
                        setIsGnnRunning(false);
                        setGnnPredictions([
                          { source: 'p1', target: 'dis_melas', confidence: 0.915, reason: 'High structural overlap with Patient 02 and MT-TL1 cluster' },
                          { source: 'var_mttl1', target: 'p1', confidence: 0.884, reason: 'Strong phenotypic similarity to maternal inheritance patterns' },
                          { source: 'hpo_seizures', target: 'dis_melas', confidence: 0.826, reason: 'Linked via neuropathological cascade propagation' }
                        ]);
                        toast.success("GNN Representation Space Synced", {
                          description: "Discovered 3 high-confidence predicted interactions in latent space."
                        });
                      }, 2000);
                    }} 
                    className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGnnRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                        Running Link Prediction...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4 text-blue-400" />
                        Execute Latent Inference
                      </>
                    )}
                  </button>
                </div>

                {gnnPredictions.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-blue-500" /> Latent Link Predictions
                    </h4>
                    <div className="space-y-2.5">
                      {gnnPredictions.map((pred, idx) => {
                        const sNode = localNodes.find(n => n.id === pred.source);
                        const tNode = localNodes.find(n => n.id === pred.target);
                        if (!sNode || !tNode) return null;
                        return (
                          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 group hover:border-blue-400 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">GNN Match</span>
                              <span className="text-[10px] font-mono font-black text-emerald-600">{(pred.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              <button onClick={() => centerOnNode(sNode.id)} className="hover:underline text-blue-600 font-black">{sNode.name.split(' (')[0]}</button>
                              <span className="text-slate-400 font-mono text-[9px] px-1.5 font-bold">--[predicts]--&gt;</span>
                              <button onClick={() => centerOnNode(tNode.id)} className="hover:underline text-blue-600 font-black">{tNode.name.split(' (')[0]}</button>
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold leading-normal uppercase">{pred.reason}</p>
                            <div className="pt-2 flex justify-end">
                              <button 
                                onClick={() => {
                                  // Add the predicted edge if it doesn't exist
                                  const alreadyExists = localLinks.some(l => {
                                    const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
                                    const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
                                    return s === pred.source && t === pred.target;
                                  });
                                  if (alreadyExists) {
                                    toast.error("Relationship already exists on canvas.");
                                    return;
                                  }
                                  setLocalLinks(prev => [...prev, { source: pred.source, target: pred.target, label: 'predicted_by_gnn' }]);
                                  toast.success("Predicted Link Added", { description: "Link added to active biological knowledge graph." });
                                }}
                                className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all"
                              >
                                Accept & Add Edge
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
});

export default GraphExplorer;
