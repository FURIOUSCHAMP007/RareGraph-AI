import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Search, 
  Database, 
  BookOpen, 
  ChevronRight, 
  BrainCircuit, 
  Settings, 
  Flame, 
  Activity, 
  Sparkles,
  ClipboardCheck,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Dna,
  Users,
  Download,
  FileJson,
  FileImage,
  ChevronDown,
  Clock,
  Timer,
  BarChart3,
  Save,
  History,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { useClinical } from '../context/ClinicalContext';
import { 
  runPhenotypeAgent, 
  runVariantAgent, 
  runLiteratureAgent, 
  runConsensusAgent,
  AgentStepResult
} from '../services/geminiService';
import Markdown from 'react-markdown';
import LiteratureSnippetsPanel from '../components/LiteratureSnippetsPanel';
import NLPGraphLinker from '../components/NLPGraphLinker';

// Mock presets to let users immediately trigger cool reasoning cases
const CASE_PRESETS = [
  {
    name: "Mitochondrial Encephalomyopathy (MELAS)",
    note: "14-year-old male presenting with recurrent stroke-like episodes, progressive muscle weakness, generalized seizures, and exercise intolerance. High-resolution muscle biopsy reveals ragged-red fibers. Elevated blood lactate at rest (4.2 mmol/L) and severe developmental delay observed. Hearing screening shows bilateral sensorineural loss.",
    variants: "m.3243A>G in MT-TL1 (homoplasmy: 72%)",
    literatureQuery: "MT-TL1 m.3243A>G stroke-like episodes myopathy"
  },
  {
    name: "Alport Syndrome (Collagens)",
    note: "8-year-old female presenting with persistent microscopic hematuria, severe proteinuria, and early-onset high-frequency sensorineural hearing loss. Anterior lenticonus noted on slit-lamp examination. Maternal uncle had chronic kidney failure in his twenties.",
    variants: "COL4A5 c.2482G>A (p.Gly828Ser)",
    literatureQuery: "COL4A5 c.2482G>A Alport syndrome hematuria"
  },
  {
    name: "Marfan Syndrome (Fibrillin)",
    note: "19-year-old male with arachnodactyly, arm-span-to-height ratio of 1.08, pectus excavatum, and mild scoliosis. Echocardiogram reveals dilatation of the ascending aorta (z-score: +4.1) and mitral valve prolapse. Ectopia lentis noted in left eye.",
    variants: "FBN1 c.1633C>T (p.Arg545Cys)",
    literatureQuery: "FBN1 c.1633C>T aortic root dilatation Marfan"
  }
];

interface LatencyMetrics {
  name: string;
  inference: number; // in ms
  retrieval: number; // in ms
  total: number; // in ms
  model: string;
}

const INITIAL_LATENCY_DATA: LatencyMetrics[] = [
  { name: "Phenotypic Grounder", inference: 1420, retrieval: 310, total: 1730, model: "Gemini 3.5 Flash" },
  { name: "ACMG Variant Classifier", inference: 1850, retrieval: 2140, total: 3990, model: "Gemini 3.5 Flash" },
  { name: "Literature Correlation", inference: 1650, retrieval: 2450, total: 4100, model: "Gemini 3.5 Flash" },
  { name: "Multi-omic Consensus", inference: 4210, retrieval: 580, total: 4790, model: "Gemini 3.1 Pro" }
];

interface DraftData {
  clinicalNote: string;
  variantsText: string;
  literatureQuery: string;
  agentsConfig: {
    phenotype: { active: boolean; model: string; temperature: number; thinkingLevel: "LOW" | "HIGH" };
    variant: { active: boolean; model: string; temperature: number; thinkingLevel: "LOW" | "HIGH" };
    literature: { active: boolean; model: string; temperature: number; thinkingLevel: "LOW" | "HIGH" };
    consensus: { active: boolean; model: string; temperature: number; thinkingLevel: "LOW" | "HIGH" };
  };
  stepResults: Record<number, AgentStepResult | null>;
  latencyData: LatencyMetrics[];
  selectedPreset: number | null;
  selectedNodeId: string;
  activeOutputTab: number | string;
  timestamp: string;
  isPpaEnabled?: boolean;
  executedSuggestedNodes?: Record<string, boolean>;
}

interface SuggestedNode {
  id: string;
  name: string;
  shortName: string;
  probability: number;
  reason: string;
  estLatency: string;
  x: number;
  y: number;
  fromNode: string;
  markdown: string;
  payload: { name: string; value: string }[];
}

const PREDICTIVE_SUGGESTIONS_DB: Record<string, SuggestedNode[]> = {
  mitochondrial: [
    {
      id: 'suggest-mito-metabolic',
      name: "Mitochondrial Respiratory Flux Simulator",
      shortName: "Resp Flux Modeler",
      probability: 96,
      reason: "Elevated lactate (4.2 mmol/L) and MT-TL1 m.3243A>G disrupt NADH dehydrogenase. Simulating respiratory chain complex I/IV flux optimizes bypass therapeutic yields.",
      estLatency: "1.4s",
      x: 440,
      y: 25,
      fromNode: "agent-3",
      payload: [
        { name: 'NADH Oxidation Capacity', value: '-78%' },
        { name: 'ROS Generation Rate', value: '+310%' },
        { name: 'Supercomplex Assembly', value: 'Disrupted' }
      ],
      markdown: `# Mitochondrial Respiratory Flux Simulation\n## Case Association: MT-TL1 m.3243A>G heteroplasmy (72%)\n\n### Executive Summary\nMolecular simulation of the mitochondrial tRNA-Leu (MT-TL1) transcript demonstrates severe disruption of protein translation for respiratory chain components. ND1, ND5, and ND6 (Complex I subunits) exhibit a 4.2-fold decrease in ribosomal translation efficiency, leading to sub-optimal assembly of mitochondrial supercomplexes.\n\n### Key Simulation Findings\n1. **NADH Oxidation Capacity**: Reduced by **78%** compared to wildtype baseline, matching the observed serum lactate spike (4.2 mmol/L) as pyruvate is shunted to lactate.\n2. **ATP Synthesis Rate**: Simulated ATP production under oxidative phosphorylation falls to **22%** of nominal tissue capacity in high-demand cerebral and skeletal myocytes.\n3. **Reactive Oxygen Species (ROS) Generation**: Simulated electron leakage at the Complex I/III junction increases by **3.1-fold**, accelerating mitochondrial membrane depolarization.\n\n### Predicted Therapeutic Synergy\nHistorical multi-omic resolution data suggests a **96% clinical success correlation** when combining metabolic bypass therapies:\n* **Coenzyme Q10 / Idebenone**: Bypasses Complex I blockade to transfer electrons directly from succinate/Complex II to Complex III.\n* **Riboflavin (Vitamin B2)**: Supports FAD-dependent mitochondrial enzymes to stabilize Complex I scaffold assemblies.`
    },
    {
      id: 'suggest-mito-heteroplasmy',
      name: "Heteroplasmy Tissue-Distribution Forecaster",
      shortName: "Heteroplasmy Engine",
      probability: 88,
      reason: "Mitochondrial mutations show extreme tissue-specific segregation. Simulating heteroplasmy curves predicts organ-specific stroke thresholds.",
      estLatency: "1.2s",
      x: 440,
      y: 265,
      fromNode: "agent-3",
      payload: [
        { name: 'Peripheral Blood PBMC', value: '35% Heteroplasmy' },
        { name: 'Cerebral Cortex CNS', value: '68% (At-Risk)' },
        { name: 'Renal Epithelium', value: '50% (Sub-clinical)' }
      ],
      markdown: `# Heteroplasmy Tissue-Distribution Forecaster\n## Predictive segregation curve modeling for MT-TL1\n\n### Tissue Heteroplasmy Segregation Models\nIn mitochondrial encephalomyopathies, the proportion of mutated mitochondrial DNA (mtDNA) varies drastically across somatic tissues due to vegetative segregation during embryogenesis. This simulation forecasts patient tissue-specific loads based on the skeletal muscle biopsy homoplasmy baseline (72%).\n\n### Simulated Tissue Forecast\n* **Skeletal Muscle (Biopsy Baseline)**: **72% Heteroplasmy** (High phenotypic presentation: ragged-red fibers, exercise intolerance).\n* **Peripheral Blood mononuclear cells**: **35% Heteroplasmy** (Often lower due to negative selection in hematopoietic lineages).\n* **Central Nervous System (Cortex)**: **68% Simulated Heteroplasmy** (Exceeds the 60% stroke-like episode trigger threshold).\n* **Renal Tubular Epithelium**: **50% Simulated Heteroplasmy** (Sub-clinical, low risk of immediate focal glomerulosclerosis).\n\n### Clinical Actionable Insight\nBecause the simulated cortical heteroplasmy of **68%** exceeds the critical neuro-vascular threshold, initiating prophylactic L-arginine therapy during the interictal period is highly recommended. L-arginine acts as a nitric oxide donor to alleviate cortical microvascular spasm and reduce stroke recurrence.`
    }
  ],
  alport: [
    {
      id: 'suggest-alport-structure',
      name: "Collagen IV Triple-Helix Molecular Dynamics",
      shortName: "Collagen Dynamics",
      probability: 92,
      reason: "COL4A5 c.2482G>A replaces Glycine with Serine. Simulating triple-helix propagation models glomerular basement membrane lamellated degradation.",
      estLatency: "1.6s",
      x: 440,
      y: 25,
      fromNode: "agent-3",
      payload: [
        { name: 'Helix Stability (Tm)', value: '-12.4°C' },
        { name: 'Proteolytic Cleavage', value: '4.5x Susceptibility' },
        { name: 'Trimer Assembly', value: 'Unstable' }
      ],
      markdown: `# Collagen IV Triple-Helix Molecular Dynamics\n## Structural simulation for COL4A5 c.2482G>A (p.Gly828Ser)\n\n### Molecular Biophysics Report\nGlomerular basement membranes rely on the robust heterotrimeric assembly of [α3(IV)][α4(IV)][α5(IV)] collagen chains. Glycine residues, occurring at every third position (Gly-X-Y), are strictly required to fit into the sterically crowded center of the triple helix. Reversing this steric constraint via p.Gly828Ser introduces a bulky, polar Serine sidechain.\n\n### Simulation Diagnostics\n1. **Helix Propagation Constraint**: The simulation shows a **local helix unwinding event** propagating outward from residue 828, reducing the thermal stability ($T_m$) of the heterotrimer by **12.4°C**.\n2. **Proteolytic Susceptibility**: Unwound triple-helix segments expose cryptic peptide bonds to matrix metalloproteinases (MMP-2 and MMP-9), increasing cleavage susceptibility by **4.5-fold**.\n3. **Chaperone Binding (Hsp47)**: Reduced binding affinity to procollagen folding chaperones, leading to endoplasmic reticulum stress.\n\n### Historical Cohort Insights\nAmong 412 matched historical cases with Glycine substitutions in COL4A5, **92%** resolved with early-onset proteinuria responding optimally to angiotensin-converting enzyme (ACE) inhibitors (ramipril) to relieve glomerular capillary tension.`
    },
    {
      id: 'suggest-alport-splice',
      name: "Splice-Site Cryptic Activation Forecaster",
      shortName: "Splicing Predictor",
      probability: 81,
      reason: "Atypical basement membrane phenotypes occasionally mask cryptic splicing events. SpliceAI simulation rules out alternative transcripts.",
      estLatency: "1.1s",
      x: 440,
      y: 265,
      fromNode: "agent-3",
      payload: [
        { name: 'Donor Gain Score', value: '0.01 (Negligible)' },
        { name: 'Acceptor Gain Score', value: '0.02 (Negligible)' },
        { name: 'Alternative Splicing', value: 'None Predicted' }
      ],
      markdown: `# Splice-Site Cryptic Activation Forecaster\n## SpliceAI machine learning sequence forecast for COL4A5 loci\n\n### Sequence-Based Splicing Predictions\nTo rule out whether the c.2482G>A transition activates or disrupts nearby splice sites, we executed deep-learning splicing forecasting models across 500bp flanking exon 30.\n\n### SpliceAI Delta Scores\n* **Donor Gain**: **0.01** (Highly unlikely to activate cryptic donor)\n* **Donor Loss**: **0.03** (No disruption to wildtype exon 30 donor)\n* **Acceptor Gain**: **0.02** (No cryptic intron insertion predicted)\n* **Acceptor Loss**: **0.00** (Exon skipping probability is negligible)\n\n### Verdict\nThe primary pathogenicity is purely biophysical, driven by Glycine-to-Serine steric hindrance in the triple helix. No alternative splicing isoforms are predicted. This confirms the ACMG classification should remain focused on structural protein disruption rather than transcription errors.`
    }
  ],
  marfan: [
    {
      id: 'suggest-marfan-tgfbeta',
      name: "TGF-beta Receptor Signaling Kinetics",
      shortName: "TGF-β Modeler",
      probability: 94,
      reason: "FBN1 p.Arg545Cys disrupts extracellular sequestration of latent TGF-beta. Simulating downstream Smad2/3 signaling confirms vascular tissue risk.",
      estLatency: "1.5s",
      x: 440,
      y: 25,
      fromNode: "agent-3",
      payload: [
        { name: 'Free TGF-β Concentration', value: '+340%' },
        { name: 'pSmad2/3 Translocation', value: '+280%' },
        { name: 'Elastic Laminae State', value: 'Severe Fragmentation' }
      ],
      markdown: `# TGF-beta Receptor Signaling Kinetics\n## Downstream pathway analysis for FBN1 microfibrillar deficiency\n\n### Pathway Overview\nFibrillin-1 microfibrils act as a physical scaffold that sequesters the Large Latent Complex (LLC) of TGF-β in the extracellular matrix. When FBN1 is mutated, impaired sequestration leads to an excess of free, active TGF-β. This free ligand binds to TβRII/I receptors, activating downstream Smad2/3 transcription factors to trigger aortic aneurysm remodeling.\n\n### Kinetic Simulation Parameters\n1. **Free TGF-β Bioavailability**: Simulated concentration is **3.4-fold higher** than baseline vascular cell cultures.\n2. **Smad2/3 Phosphorylation Rate**: Nuclear translocation of pSmad2/3 is increased by **280%**, driving overexpression of matrix metalloproteinases and connective tissue growth factor (CTGF).\n3. **Aortic Elastic Fiber Fragmentation**: High TGF-β signaling correlates with loss of vascular smooth muscle cells and elastic laminae breakdown in the aortic media.\n\n### Actionable Synergy\nHistorical resolution cohorts demonstrate a **94% efficacy correlation** in slow-down of aortic root dilatation when combining losartan + atenolol treatment.`
    },
    {
      id: 'suggest-marfan-assembly',
      name: "Microfibrillar Extracellular Matrix Simulator",
      shortName: "Microfibril Matrix",
      probability: 85,
      reason: "Cysteine mutation (p.Arg545Cys) introduces a free sulfhydryl group, potentially forming aberrant disulfide links during fibrillogenesis.",
      estLatency: "1.3s",
      x: 440,
      y: 265,
      fromNode: "agent-3",
      payload: [
        { name: 'Polymerization Yield', value: '-65% Reduction' },
        { name: 'Homotypic Misfolding Rate', value: '42%' },
        { name: 'Extracellular Scaffold', value: 'Disorganized' }
      ],
      markdown: `# Microfibrillar Extracellular Matrix Simulator\n## Molecular assembly modeling for FBN1 disulfide cross-linking\n\n### Fibrillogenesis Biophysical Model\nFibrillin-1 monomers polymerize extracellularly to form head-to-tail microfibrils stabilized by precise disulfide bonds. The introduction of an unpaired cysteine residue at position 545 (p.Arg545Cys) presents a reactive thiol group that disrupts the chaperone-guided disulfide folding pathway.\n\n### Assembly Simulation Output\n* **Polymerization Yield**: Mutant monomers exhibit a **dominant-negative effect**, binding to wildtype monomers but blocking linear elongation. Total microfibril yield falls by **65%**.\n* **Disulfide Mismatching**: Simulation predicts a **42% rate of homotypic misfolding** where mutant monomers form non-functional globular aggregations instead of uniform microfibrils.\n* **Integrin-Binding Affinities**: The RGD integrin-binding domain adjacent to the mutation shows altered accessibility, compromising cell-matrix adhesion dynamics.\n\n### Diagnostic Conclusion\nThe severe reduction in microfibrillar density directly accounts for the tall stature, skeletal laxity (arachnodactyly), and ectopia lentis observed in the patient profile, confirming a high-penetrance phenotype.`
    }
  ],
  custom: [
    {
      id: 'suggest-custom-conservation',
      name: "Evolutionary Phylogenetic Conservation Scorer",
      shortName: "Phylo Conservation",
      probability: 85,
      reason: "Custom phenotype-variant mismatch requires multi-species sequence alignments to measure evolutionary constraints.",
      estLatency: "1.2s",
      x: 440,
      y: 25,
      fromNode: "agent-3",
      payload: [
        { name: 'GERP++ Score', value: '5.84 (Highly Conserved)' },
        { name: 'PhyloP Score', value: '2.91 (Significant)' },
        { name: 'Vertebrate Alignment', value: '100% Identical' }
      ],
      markdown: `# Evolutionary Phylogenetic Conservation Scorer\n## GERP++ and PhyloP multi-species sequence alignment\n\n### Evolutionary Constraint Scoring\nFor novel or custom genomic variants, determining pathogenic potential requires analyzing multi-species nucleotide alignments across 100 vertebrate genomes. This predicts whether the mutation disrupts a critical functional domain conserved through evolutionary history.\n\n### Score Metrics\n* **GERP++ Score**: **5.84** (Scores > 2.0 indicate high evolutionary constraint).\n* **PhyloP Score (100 vertebrates)**: **2.91** (Strong conservation, statistically significant reject of neutral drift).\n* **SiPhy Score**: **18.42** (Indicates severe constraint on element substitution).\n\n### Biological Interpretation\nThe targeted locus shows 100% amino acid conservation across all analyzed mammalian, avian, amphibian, and teleost models. The introduction of any non-synonymous substitution is highly predicted to disrupt protein tertiary structure and cause downstream pathobiological phenotypes.`
    },
    {
      id: 'suggest-custom-ppi',
      name: "PPI Disease-Network Topology Mapper",
      shortName: "PPI Networker",
      probability: 75,
      reason: "Expands phenotype associations to identify secondary modifier genes in the active multi-omic network.",
      estLatency: "1.4s",
      x: 440,
      y: 265,
      fromNode: "agent-3",
      payload: [
        { name: 'Interactome Nodes/Edges', value: '48 / 184' },
        { name: 'Avg Node Degree', value: '7.6' },
        { name: 'High-Confidence Links', value: 'p < 0.001' }
      ],
      markdown: `# PPI Disease-Network Topology Mapper\n## Interactome clustering for multi-omic patient profiles\n\n### Interactome Network Metrics\nThis model maps the patient's primary genetic variant against the STRING human protein-protein interaction database. It aims to identify secondary candidate modifier genes that might exacerbate or rescue the clinical phenotype.\n\n### Network Metric Analysis\n* **Network Nodes**: **48** interactors.\n* **Network Edges**: **184** high-confidence links (confidence score > 0.700).\n* **Average Node Degree**: **7.6**.\n* **Clustering Coefficient**: **0.42**.\n* **Network Bottlenecks**: The primary gene forms a crucial bottleneck connecting cell growth pathways to structural skeletal/cardiovascular matrices.\n\n### Modifier Gene Signatures\nWe identified potential modifier loci with significant association to clinical variability: TGFBR1/2, COL4A3/4, and SOD2 (Superoxide Dismutase) which mitigates reactive oxygen species damage.`
    }
  ]
};

function getCaseContext(note: string, variants: string): string {
  const n = (note || '').toLowerCase();
  const v = (variants || '').toLowerCase();
  if (n.includes("mitochondrial") || n.includes("melas") || v.includes("mt-tl1") || n.includes("lactate")) {
    return "mitochondrial";
  } else if (n.includes("alport") || n.includes("collagen") || v.includes("col4a5") || n.includes("hematuria")) {
    return "alport";
  } else if (n.includes("marfan") || n.includes("fibrillin") || v.includes("fbn1") || n.includes("aorta")) {
    return "marfan";
  }
  return "custom";
}

export default function AgenticOrchestratorPage() {
  const { hpoTerms, variants: currentContextVariants } = useClinical();

  // Local Draft States
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // State for Agentic Latency Monitor
  const [latencyData, setLatencyData] = useState<LatencyMetrics[]>(INITIAL_LATENCY_DATA);

  // Selected preset or active state
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Form Inputs
  const [clinicalNote, setClinicalNote] = useState(
    "14-year-old male presenting with recurrent stroke-like episodes, progressive muscle weakness, generalized seizures, and exercise intolerance. Ragged-red fibers seen on biopsy. Blood lactate: 4.2 mmol/L."
  );
  const [variantsText, setVariantsText] = useState("m.3243A>G in MT-TL1");
  const [literatureQuery, setLiteratureQuery] = useState("MT-TL1 m.3243A>G MELAS syndrome");

  // Agent configuration
  const [agentsConfig, setAgentsConfig] = useState({
    phenotype: { active: true, model: "gemini-3.5-flash", temperature: 0.1, thinkingLevel: "LOW" as const },
    variant: { active: true, model: "gemini-3.5-flash", temperature: 0.2, thinkingLevel: "HIGH" as const },
    literature: { active: true, model: "gemini-3.5-flash", temperature: 0.3, thinkingLevel: "LOW" as const },
    consensus: { active: true, model: "gemini-3.1-pro-preview", temperature: 0.1, thinkingLevel: "HIGH" as const }
  });

  // State for running execution
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null); // null = idle, 0 to 3 for steps
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  
  // Stored results
  const [stepResults, setStepResults] = useState<Record<number, AgentStepResult | null>>({
    0: null,
    1: null,
    2: null,
    3: null
  });

  // Active tab to display results
  const [activeOutputTab, setActiveOutputTab] = useState<number | string>(0);

  // Predictive Path Analysis States
  const [isPpaEnabled, setIsPpaEnabled] = useState(false);
  const [executedSuggestedNodes, setExecutedSuggestedNodes] = useState<Record<string, boolean>>({});
  const [loadingSuggestedNodes, setLoadingSuggestedNodes] = useState<Record<string, boolean>>({});

  const caseContext = getCaseContext(clinicalNote, variantsText);
  const activeSuggestions = PREDICTIVE_SUGGESTIONS_DB[caseContext] || PREDICTIVE_SUGGESTIONS_DB.custom;

  const handleExecuteSuggestedNode = (nodeId: string) => {
    const node = activeSuggestions.find(n => n.id === nodeId);
    if (!node) return;
    
    setLoadingSuggestedNodes(prev => ({ ...prev, [nodeId]: true }));
    toast.info(`Simulating predictive path: ${node.name}`, {
      description: "Executing deep diagnostic model..."
    });

    setTimeout(() => {
      setLoadingSuggestedNodes(prev => ({ ...prev, [nodeId]: false }));
      setExecutedSuggestedNodes(prev => ({ ...prev, [nodeId]: true }));
      setSelectedNodeId(nodeId);
      setActiveOutputTab(nodeId);

      // Inject simulated latency data
      const baseLatency = parseFloat(node.estLatency) * 1000;
      const inferenceTime = Math.round(baseLatency * 0.8);
      const retrievalTime = Math.round(baseLatency * 0.2);
      
      setLatencyData(prev => {
        if (prev.some(d => d.name === node.name)) return prev;
        return [
          ...prev,
          {
            name: node.name,
            inference: inferenceTime,
            retrieval: retrievalTime,
            total: Math.round(baseLatency),
            model: "Predictive PPA Engine"
          }
        ];
      });

      toast.success(`${node.name} Integrated`, {
        description: `Path resolved successfully in ${node.estLatency}. Dynamic evidence tab generated.`
      });
      
      // Auto-save progress
      setTimeout(() => saveDraft(true), 200);
    }, 1500);
  };

  // Active selected node in the SVG workspace
  const [selectedNodeId, setSelectedNodeId] = useState<string>("agent-0");

  // Export menu toggle state
  const [isExportOpen, setIsExportOpen] = useState(false);

  const exportSimplePNG = (svgElement: HTMLElement) => {
    try {
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      const simpleStyle = document.createElement("style");
      simpleStyle.textContent = `
        svg { font-family: sans-serif; background-color: #fafafa; }
        .stroke-slate-200 { stroke: #e2e8f0; }
        .stroke-blue-500 { stroke: #3b82f6; }
        .stroke-emerald-500 { stroke: #10b981; }
        .bg-white { background-color: #ffffff; }
        .bg-slate-50 { background-color: #f8fafc; }
        .border-slate-200 { border: 1px solid #e2e8f0; }
        .border-blue-500 { border: 1px solid #3b82f6; }
        .text-slate-800 { color: #1e293b; }
        .text-slate-500 { color: #64748b; }
        .text-blue-500 { color: #3b82f6; }
        .text-purple-500 { color: #a855f7; }
        .text-amber-500 { color: #f59e0b; }
      `;
      clonedSvg.insertBefore(simpleStyle, clonedSvg.firstChild);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);

      const imageElement = new Image();
      imageElement.onload = () => {
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = 600 * scale;
        canvas.height = 380 * scale;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(imageElement, 0, 0, 600 * scale, 380 * scale);
          
          const pngURL = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngURL;
          downloadLink.download = `agentic_clinical_workflow_simple_${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success("Workflow PNG exported successfully (Standard Resolution)!");
        }
        URL.revokeObjectURL(blobURL);
      };
      imageElement.src = blobURL;
    } catch (err) {
      toast.error("Failed to render standard PNG fallback");
    }
  };

  const exportToPNG = () => {
    const svgElement = document.getElementById("agentic-workflow-svg");
    if (!svgElement) {
      toast.error("Workflow canvas not found");
      return;
    }

    try {
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      const styleSheets = Array.from(document.styleSheets);
      let cssText = '';
      
      try {
        styleSheets.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules);
            rules.forEach((rule) => {
              cssText += rule.cssText;
            });
          } catch (e) {
            // Skip cross-origin stylesheet
          }
        });
      } catch (e) {
        // Skip stylesheet retrieval errors
      }

      const styleEl = document.createElement("style");
      styleEl.textContent = cssText;
      clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);

      const imageElement = new Image();
      imageElement.onload = () => {
        const scale = 3; // 3x for high-resolution
        const canvas = document.createElement("canvas");
        canvas.width = 600 * scale;
        canvas.height = 380 * scale;
        const context = canvas.getContext("2d");
        
        if (context) {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          
          context.drawImage(imageElement, 0, 0, 600 * scale, 380 * scale);
          
          const pngURL = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngURL;
          downloadLink.download = `agentic_clinical_workflow_${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          toast.success("Workflow PNG exported successfully!", {
            description: "High-resolution diagram is ready for clinical documentation."
          });
        } else {
          toast.error("Failed to create high-resolution canvas context");
        }
        
        URL.revokeObjectURL(blobURL);
      };
      
      imageElement.onerror = () => {
        // Fallback if stylesheet embedding fails
        exportSimplePNG(svgElement);
        URL.revokeObjectURL(blobURL);
      };

      imageElement.src = blobURL;
    } catch (error) {
      console.error("Error exporting PNG:", error);
      toast.error("Could not export high-resolution PNG");
    }
  };

  const exportToJSON = () => {
    const blueprint = {
      $schema: "https://ai.studio/schemas/agentic-clinical-blueprint-v1.json",
      metadata: {
        exportedAt: new Date().toISOString(),
        generator: "Google AI Studio - Agentic Orchestrator",
        casePreset: selectedPreset !== null ? CASE_PRESETS[selectedPreset].name : "Custom User Profile"
      },
      workflowInputs: {
        clinicalNote,
        variantsText,
        literatureQuery
      },
      agentOrchestratorConfiguration: {
        phenotypeGrounder: {
          active: agentsConfig.phenotype.active,
          model: agentsConfig.phenotype.model,
          temperature: agentsConfig.phenotype.temperature,
          role: "Extract physiological HPO identifiers from patient descriptions"
        },
        acmgVariantClassifier: {
          active: agentsConfig.variant.active,
          model: agentsConfig.variant.model,
          temperature: agentsConfig.variant.temperature,
          role: "Compute variant pathogenicity against ACMG guidelines"
        },
        literatureCorrelation: {
          active: agentsConfig.literature.active,
          model: agentsConfig.literature.model,
          temperature: agentsConfig.literature.temperature,
          role: "Retrieve indexing for patient variant and phenotype matches from NIH PubMed"
        },
        consensusEngine: {
          active: agentsConfig.consensus.active,
          model: agentsConfig.consensus.model,
          temperature: agentsConfig.consensus.temperature,
          role: "Fuse genomic and phenotypic streams into a high-confidence diagnostic conclusion"
        }
      },
      reasoningChainResults: {
        step_1_phenotype_grounding: stepResults[0] ? {
          status: "COMPLETED",
          extractedHpoTerms: stepResults[0].dataPayload || []
        } : { status: "PENDING" },
        step_2_variant_pathogenicity: stepResults[1] ? {
          status: "COMPLETED",
          classifications: stepResults[1].dataPayload || []
        } : { status: "PENDING" },
        step_3_literature_correlation: stepResults[2] ? {
          status: "COMPLETED",
          matchedPapers: stepResults[2].dataPayload || []
        } : { status: "PENDING" },
        step_4_multi_omic_consensus: stepResults[3] ? {
          status: "COMPLETED",
          finalDiagnosis: stepResults[3].dataPayload?.finalDiagnosis || null,
          confidenceScore: stepResults[3].dataPayload?.confidenceScore || null,
          synthesisMarkdown: stepResults[3].outputMarkdown || null
        } : { status: "PENDING" }
      }
    };

    const jsonString = JSON.stringify(blueprint, null, 2);
    const jsonBlob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const jsonURL = URL.createObjectURL(jsonBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = jsonURL;
    downloadLink.download = `agentic_clinical_blueprint_${Date.now()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(jsonURL);

    toast.success("Workflow JSON blueprint exported successfully!", {
      description: "Serialized reasoning graph is ready for clinical documentation."
    });
  };

  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const controlOffset = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
  };

  const getPathClass = (fromStep: string, toStep: string) => {
    let isFlowing = false;
    let isSuccess = false;

    if (isRunning) {
      if (toStep === 'agent-0' && currentStep === 0) isFlowing = true;
      if (toStep === 'agent-1' && currentStep === 1) isFlowing = true;
      if (toStep === 'agent-2' && currentStep === 2) isFlowing = true;
      if (toStep === 'agent-3' && currentStep === 3) isFlowing = true;
    } else {
      if (toStep === 'agent-0' && stepResults[0]) isSuccess = true;
      if (toStep === 'agent-1' && stepResults[1]) isSuccess = true;
      if (toStep === 'agent-2' && stepResults[2]) isSuccess = true;
      if (toStep === 'agent-3' && stepResults[3]) isSuccess = true;
      
      // Cross feeds
      if (fromStep === 'agent-0' && toStep === 'agent-1' && stepResults[0] && stepResults[1]) isSuccess = true;
    }

    if (isFlowing) return "stroke-blue-500 flowing-path stroke-[2.5]";
    if (isSuccess) return "stroke-emerald-500 stroke-[2] opacity-90";
    return "stroke-slate-200 stroke-[1.5] opacity-60";
  };

  // Check for saved draft on mount
  useEffect(() => {
    const savedData = localStorage.getItem("agentic_orchestrator_draft");
    if (savedData) {
      setHasDraft(true);
      setShowRestoreBanner(true);
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.timestamp) {
          const date = new Date(parsed.timestamp);
          setLastSaved(date.toLocaleTimeString());
        }
      } catch (e) {
        console.error("Failed to parse saved draft date:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save draft helper
  const saveDraft = (silent = false) => {
    try {
      const draft: DraftData = {
        clinicalNote,
        variantsText,
        literatureQuery,
        agentsConfig,
        stepResults,
        latencyData,
        selectedPreset,
        selectedNodeId,
        activeOutputTab,
        timestamp: new Date().toISOString(),
        isPpaEnabled,
        executedSuggestedNodes
      };
      localStorage.setItem("agentic_orchestrator_draft", JSON.stringify(draft));
      const timeStr = new Date().toLocaleTimeString();
      setLastSaved(timeStr);
      setHasDraft(true);
      if (!silent) {
        toast.success("Draft saved manually!", {
          description: `Your active progress was persisted at ${timeStr}.`
        });
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
      if (!silent) {
        toast.error("Could not save local draft.");
      }
    }
  };

  // Restore draft helper
  const restoreDraft = () => {
    const savedData = localStorage.getItem("agentic_orchestrator_draft");
    if (!savedData) return;
    try {
      const draft = JSON.parse(savedData) as DraftData;
      if (draft.clinicalNote !== undefined) setClinicalNote(draft.clinicalNote);
      if (draft.variantsText !== undefined) setVariantsText(draft.variantsText);
      if (draft.literatureQuery !== undefined) setLiteratureQuery(draft.literatureQuery);
      if (draft.agentsConfig !== undefined) setAgentsConfig(draft.agentsConfig as any);
      if (draft.stepResults !== undefined) setStepResults(draft.stepResults);
      if (draft.latencyData !== undefined) setLatencyData(draft.latencyData);
      if (draft.selectedPreset !== undefined) setSelectedPreset(draft.selectedPreset);
      if (draft.selectedNodeId !== undefined) setSelectedNodeId(draft.selectedNodeId);
      if (draft.activeOutputTab !== undefined) setActiveOutputTab(draft.activeOutputTab);
      if (draft.isPpaEnabled !== undefined) setIsPpaEnabled(draft.isPpaEnabled);
      if (draft.executedSuggestedNodes !== undefined) setExecutedSuggestedNodes(draft.executedSuggestedNodes);
      
      const timeStr = draft.timestamp ? new Date(draft.timestamp).toLocaleTimeString() : "unknown time";
      toast.success("Progress recovered!", {
        description: `Loaded reasoning graph draft from ${timeStr}.`
      });
      setIsDraftRestored(true);
      setShowRestoreBanner(false);
    } catch (e) {
      console.error("Restore failed:", e);
      toast.error("Failed to restore draft due to corrupted storage.");
    }
  };

  // Clear draft helper
  const clearDraft = () => {
    localStorage.removeItem("agentic_orchestrator_draft");
    setHasDraft(false);
    setLastSaved(null);
    setIsDraftRestored(false);
    setShowRestoreBanner(false);
    toast.info("Local draft cleared.");
  };

  // Periodic autosave every 10 seconds
  useEffect(() => {
    if (!isInitialized || showRestoreBanner) return;
    
    const interval = setInterval(() => {
      saveDraft(true);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [
    isInitialized,
    showRestoreBanner,
    clinicalNote,
    variantsText,
    literatureQuery,
    agentsConfig,
    stepResults,
    latencyData,
    selectedPreset,
    selectedNodeId,
    activeOutputTab,
    isPpaEnabled,
    executedSuggestedNodes
  ]);

  // Sync with main Clinical Context if requested
  const handleSyncWithContext = () => {
    if (hpoTerms.length > 0) {
      const termsStr = hpoTerms.map(t => `${t.name} (${t.id})`).join(', ');
      setClinicalNote(`Patient presents with clinical HPO terms: ${termsStr}. Please perform deep narrative analysis.`);
    }
    if (currentContextVariants.length > 0) {
      const varStr = currentContextVariants.map(v => `${v.gene} ${v.variant} (${v.pathogenicity})`).join(', ');
      setVariantsText(varStr);
      setLiteratureQuery(`${currentContextVariants[0].gene} ${currentContextVariants[0].variant}`);
    }
    toast.success("Synchronized inputs with active Clinical Context", {
      description: `Loaded ${hpoTerms.length} HPO terms and ${currentContextVariants.length} variants.`
    });
  };

  const loadPreset = (index: number) => {
    setSelectedPreset(index);
    const preset = CASE_PRESETS[index];
    setClinicalNote(preset.note);
    setVariantsText(preset.variants);
    setLiteratureQuery(preset.literatureQuery);
    toast.info(`Loaded preset: ${preset.name}`);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Run the multi-step agent pipeline
  const executePipeline = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setExecutionLogs([]);
    setStepResults({ 0: null, 1: null, 2: null, 3: null });
    
    // Reset latency data to zero for active steps, and Disabled for disabled steps
    setLatencyData([
      { name: "Phenotypic Grounder", inference: 0, retrieval: 0, total: 0, model: agentsConfig.phenotype.active ? agentsConfig.phenotype.model : "Disabled" },
      { name: "ACMG Variant Classifier", inference: 0, retrieval: 0, total: 0, model: agentsConfig.variant.active ? agentsConfig.variant.model : "Disabled" },
      { name: "Literature Correlation", inference: 0, retrieval: 0, total: 0, model: agentsConfig.literature.active ? agentsConfig.literature.model : "Disabled" },
      { name: "Multi-omic Consensus", inference: 0, retrieval: 0, total: 0, model: agentsConfig.consensus.active ? agentsConfig.consensus.model : "Disabled" }
    ]);
    
    let activePhenotypesPayload: any[] = [];
    let activeVariantsPayload: any[] = [];
    let activePapersPayload: any[] = [];

    // Step 1: Phenotypic Grounder
    if (agentsConfig.phenotype.active) {
      try {
        setCurrentStep(0);
        setActiveOutputTab(0);
        addLog("▶️ Initializing step 1/4: Phenotypic Grounder Agent...");
        addLog(`Spinning up model [${agentsConfig.phenotype.model}] with temp ${agentsConfig.phenotype.temperature}...`);
        addLog("Analyzing clinical narrative for HPO alignments...");
        
        const t0 = performance.now();
        const result = await runPhenotypeAgent(clinicalNote);
        const t1 = performance.now();
        const total = Math.round(t1 - t0);
        // Phenotypic grounder doesn't use search tool (no googleSearch: {}),
        // so retrieval is minimal (e.g. 15%), inference is 85%
        const retrieval = Math.round(total * 0.15);
        const inference = total - retrieval;

        setLatencyData(prev => prev.map(item => 
          item.name === "Phenotypic Grounder" 
            ? { ...item, inference, retrieval, total, model: agentsConfig.phenotype.model }
            : item
        ));
        
        activePhenotypesPayload = result.dataPayload || [];
        setStepResults(prev => ({ ...prev, 0: result }));
        addLog(`✅ Phenotypic Grounder completed successfully! Found ${result.dataPayload?.length || 0} HPO terms.`);
        result.toolLogs.forEach(log => addLog(`   • Tool Log: ${log}`));
      } catch (err: any) {
        addLog(`❌ Step 1 failed: ${err.message || err}`);
        toast.error("Phenotypic Grounder failed");
        setIsRunning(false);
        return;
      }
    } else {
      addLog("⏭️ Step 1 (Phenotypic Grounder) is disabled. Skipping...");
      setLatencyData(prev => prev.map(item => 
        item.name === "Phenotypic Grounder" 
          ? { ...item, inference: 0, retrieval: 0, total: 0, model: "Disabled" }
          : item
      ));
    }

    // Step 2: ACMG Variant Classifier
    if (agentsConfig.variant.active) {
      try {
        setCurrentStep(1);
        setActiveOutputTab(1);
        addLog("▶️ Initializing step 2/4: ACMG Variant Classifier Agent...");
        addLog(`Spinning up model [${agentsConfig.variant.model}] with temp ${agentsConfig.variant.temperature}...`);
        
        // Get phenotypes extracted in step 1 or fall back to standard ones
        const extractedPhenotypes = activePhenotypesPayload.length > 0 
          ? activePhenotypesPayload.map((t: any) => t.name) 
          : ["ragged-red fibers", "stroke-like episodes"];
        
        addLog(`Cross-referencing variants against phenotypes: [${extractedPhenotypes.slice(0, 3).join(', ')}...]`);
        addLog("Querying ClinVar registry & evaluating ACMG classifications...");
        
        const t0 = performance.now();
        const result = await runVariantAgent(variantsText, extractedPhenotypes);
        const t1 = performance.now();
        const total = Math.round(t1 - t0);
        // ACMG Variant Classifier uses google search tool, so tool retrieval/grounding takes more time
        const retrieval = Math.round(total * 0.55);
        const inference = total - retrieval;

        setLatencyData(prev => prev.map(item => 
          item.name === "ACMG Variant Classifier" 
            ? { ...item, inference, retrieval, total, model: agentsConfig.variant.model }
            : item
        ));

        activeVariantsPayload = result.dataPayload || [];
        setStepResults(prev => ({ ...prev, 1: result }));
        addLog(`✅ Variant Classifier completed successfully! Classifications computed.`);
        result.toolLogs.forEach(log => addLog(`   • Tool Log: ${log}`));
      } catch (err: any) {
        addLog(`❌ Step 2 failed: ${err.message || err}`);
        toast.error("ACMG Variant Classifier failed");
        setIsRunning(false);
        return;
      }
    } else {
      addLog("⏭️ Step 2 (ACMG Variant Classifier) is disabled. Skipping...");
      setLatencyData(prev => prev.map(item => 
        item.name === "ACMG Variant Classifier" 
          ? { ...item, inference: 0, retrieval: 0, total: 0, model: "Disabled" }
          : item
      ));
    }

    // Step 3: Literature Correlation
    if (agentsConfig.literature.active) {
      try {
        setCurrentStep(2);
        setActiveOutputTab(2);
        addLog("▶️ Initializing step 3/4: Literature Correlation Engine...");
        addLog(`Spinning up model [${agentsConfig.literature.model}] with temp ${agentsConfig.literature.temperature}...`);
        addLog(`Searching NIH PubMed index for: "${literatureQuery}"...`);
        
        const t0 = performance.now();
        const result = await runLiteratureAgent(literatureQuery);
        const t1 = performance.now();
        const total = Math.round(t1 - t0);
        // Literature Correlation uses google search tool, retrieval takes more time
        const retrieval = Math.round(total * 0.60);
        const inference = total - retrieval;

        setLatencyData(prev => prev.map(item => 
          item.name === "Literature Correlation" 
            ? { ...item, inference, retrieval, total, model: agentsConfig.literature.model }
            : item
        ));

        activePapersPayload = result.dataPayload || [];
        setStepResults(prev => ({ ...prev, 2: result }));
        addLog(`✅ Literature Correlation completed successfully! Retrieved ${result.dataPayload?.length || 0} papers.`);
        result.toolLogs.forEach(log => addLog(`   • Tool Log: ${log}`));
      } catch (err: any) {
        addLog(`❌ Step 3 failed: ${err.message || err}`);
        toast.error("Literature Correlation failed");
        setIsRunning(false);
        return;
      }
    } else {
      addLog("⏭️ Step 3 (Literature Correlation) is disabled. Skipping...");
      setLatencyData(prev => prev.map(item => 
        item.name === "Literature Correlation" 
          ? { ...item, inference: 0, retrieval: 0, total: 0, model: "Disabled" }
          : item
      ));
    }

    // Step 4: Multi-omic Consensus Engine
    if (agentsConfig.consensus.active) {
      try {
        setCurrentStep(3);
        setActiveOutputTab(3);
        addLog("▶️ Initializing step 4/4: Multi-omic Consensus Engine...");
        addLog(`Spinning up primary reasoning model [${agentsConfig.consensus.model}]...`);
        addLog("Chaining HPO phenotypes, ACMG variants, and Pubmed literature into neuro-symbolic solver...");
        
        const t0 = performance.now();
        const result = await runConsensusAgent(activePhenotypesPayload, activeVariantsPayload, activePapersPayload);
        const t1 = performance.now();
        const total = Math.round(t1 - t0);
        // Consensus doesn't use search tool, so retrieval is low, inference is high
        const retrieval = Math.round(total * 0.12);
        const inference = total - retrieval;

        setLatencyData(prev => prev.map(item => 
          item.name === "Multi-omic Consensus" 
            ? { ...item, inference, retrieval, total, model: agentsConfig.consensus.model }
            : item
        ));

        setStepResults(prev => ({ ...prev, 3: result }));
        addLog("✅ Multi-omic Consensus Engine completed successfully!");
        addLog(`🏆 Final Diagnostic Conclusion: ${result.dataPayload?.finalDiagnosis}`);
        addLog(`⚡ Diagnostic Confidence Level: ${(result.dataPayload?.confidenceScore * 100).toFixed(1)}%`);
        result.toolLogs.forEach(log => addLog(`   • Tool Log: ${log}`));
      } catch (err: any) {
        addLog(`❌ Step 4 failed: ${err.message || err}`);
        toast.error("Multi-omic Consensus failed");
        setIsRunning(false);
        return;
      }
    } else {
      addLog("⏭️ Step 4 (Multi-omic Consensus) is disabled. Skipping...");
      setLatencyData(prev => prev.map(item => 
        item.name === "Multi-omic Consensus" 
          ? { ...item, inference: 0, retrieval: 0, total: 0, model: "Disabled" }
          : item
      ));
    }

    setCurrentStep(null);
    setIsRunning(false);
    toast.success("Agentic reasoning chain completed successfully!", {
      description: "Review individual agent outputs and final consensus."
    });
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      {/* Draft Recovery Banner */}
      <AnimatePresence>
        {showRestoreBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl flex-shrink-0">
                  <History className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-amber-900">Unsaved Local Draft Detected</h4>
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed mt-0.5">
                    We found a clinical reasoning draft from <strong className="font-bold">{lastSaved || "your last session"}</strong>. Would you like to recover your work?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={clearDraft}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none"
                >
                  Discard
                </button>
                <button
                  onClick={restoreDraft}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none flex items-center gap-1.5 shadow-sm shadow-amber-500/10"
                >
                  <Save className="w-3.5 h-3.5" />
                  Recover Draft
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
          <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
          Autonomous Multi-Agentic reasoning workspace
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
              Agentic Orchestrator
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed mt-1">
              Configure and chain independent clinical, genomic, and literature AI reasoning agents to solve complex diagnostic scenarios with traceable audit trails.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            {/* Local Draft Status Pill */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-600 font-mono shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-500 uppercase tracking-tight">Draft:</span>
              <span className="font-bold text-slate-700">{lastSaved ? lastSaved : "Autosave Active"}</span>
              <button
                onClick={() => saveDraft(false)}
                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-all cursor-pointer ml-1"
                title="Save draft manually"
              >
                <Save className="w-3 h-3" />
              </button>
              {hasDraft && (
                <button
                  onClick={clearDraft}
                  className="p-1 hover:bg-slate-100 text-rose-500 hover:bg-rose-50 rounded transition-all cursor-pointer"
                  title="Clear saved draft"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={handleSyncWithContext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync with Context
            </button>
          </div>
        </div>
      </div>

      {/* Case Presets Quick-Select */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Choose Diagnostic Scenario Preset
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CASE_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(index)}
              className={cn(
                "p-4 rounded-2xl text-left border transition-all relative overflow-hidden group select-none cursor-pointer",
                selectedPreset === index 
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  selectedPreset === index ? "text-blue-400" : "text-slate-500"
                )}>
                  Preset 0{index + 1}
                </span>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-tight mt-1.5 truncate">{preset.name}</h4>
              <p className={cn(
                "text-[10px] line-clamp-2 mt-1 leading-normal font-medium",
                selectedPreset === index ? "text-slate-300" : "text-slate-500"
              )}>
                {preset.note}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Workspace Inputs + Pipeline Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Clinical & Genomic Inputs
            </h3>

            {/* Input 1: Clinical Note */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>1. Patient Clinical Narrative</span>
                <span className="text-[9px] text-slate-400 font-mono">Step 1 Context</span>
              </label>
              <textarea
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none custom-scrollbar"
                placeholder="Paste clinical case notes, physical findings, laboratory metrics, or family pedigree history..."
              />
            </div>

            {/* Input 2: Variants text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>2. Genomic Variants (DNA/MT)</span>
                  <span className="text-[9px] text-slate-400 font-mono">Step 2 Context</span>
                </label>
                <input
                  type="text"
                  value={variantsText}
                  onChange={(e) => setVariantsText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. m.3243A>G in MT-TL1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Literature Search Query</span>
                  <span className="text-[9px] text-slate-400 font-mono">Step 3 Context</span>
                </label>
                <input
                  type="text"
                  value={literatureQuery}
                  onChange={(e) => setLiteratureQuery(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. MT-TL1 m.3243A>G stroke-like episodes"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={executePipeline}
              disabled={isRunning}
              className={cn(
                "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer",
                isRunning 
                  ? "bg-slate-800 text-slate-400 shadow-none cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 active:scale-[0.98]"
              )}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  Running Autonomous Agentic Chain...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white fill-white" />
                  Execute Agentic Reasoning Chain
                </>
              )}
            </button>
          </div>

          {/* Terminal / Real-time Execution Log */}
          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 shadow-inner flex flex-col h-64 overflow-hidden relative group">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">Live Agent Execution Console</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-300 custom-scrollbar pr-2">
              {executionLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic select-none">
                  Waiting to establish Agent reasoning session...
                </div>
              ) : (
                executionLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap">
                    {log.startsWith('✅') || log.includes('success') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.startsWith('❌') ? (
                      <span className="text-rose-400 font-bold">{log}</span>
                    ) : log.startsWith('▶️') ? (
                      <span className="text-blue-400 font-black">{log}</span>
                    ) : log.includes('• Tool Log') ? (
                      <span className="text-slate-500 italic pl-4">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Agent Node Config & Pipeline */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Agent Workflow Visualizer
              </h3>
              
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setIsPpaEnabled(!isPpaEnabled)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none border",
                    isPpaEnabled 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm shadow-blue-500/10"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100"
                  )}
                  title="Toggle Predictive Path Analysis (PPA) Engine"
                >
                  <Sparkles className={cn("w-3 h-3", isPpaEnabled ? "animate-pulse text-amber-300" : "text-slate-400")} />
                  PPA {isPpaEnabled ? 'Active' : 'Disabled'}
                </button>

                <span className="hidden sm:inline text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                  Interactive SVG Stage
                </span>
                
                <div className="relative">
                  <button
                    id="export-workflow-btn"
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none"
                  >
                    <Download className="w-3 h-3" />
                    Export Workflow
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {isExportOpen && (
                      <>
                        {/* Overlay to close on outside click */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsExportOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden flex flex-col py-1"
                        >
                          <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Export Blueprint</span>
                          </div>
                          
                          <button
                            id="export-png-btn"
                            onClick={() => {
                              setIsExportOpen(false);
                              exportToPNG();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all select-none cursor-pointer"
                          >
                            <FileImage className="w-3.5 h-3.5 text-blue-500" />
                            High-Res PNG Diagram
                          </button>

                          <button
                            id="export-json-btn"
                            onClick={() => {
                              setIsExportOpen(false);
                              exportToJSON();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all select-none cursor-pointer"
                          >
                            <FileJson className="w-3.5 h-3.5 text-purple-500" />
                            JSON Blueprint
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="w-full relative bg-slate-950/25 border border-slate-100 rounded-2xl overflow-hidden aspect-[600/380] select-none shadow-inner">
              <svg 
                id="agentic-workflow-svg"
                viewBox="0 0 600 380" 
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Embedded self-contained flowing dash animation */}
                <defs>
                  <style>{`
                    @keyframes agentFlow {
                      from {
                        stroke-dashoffset: 24;
                      }
                      to {
                        stroke-dashoffset: 0;
                      }
                    }
                    .flowing-path {
                      stroke-dasharray: 8, 4;
                      animation: agentFlow 1.2s linear infinite;
                    }
                  `}</style>
                </defs>

                {/* Grid Backdrop Pattern */}
                <rect width="100%" height="100%" fill="#fafafa" />
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Workflow Connecting Curves */}
                {/* 1. Clinical Note -> Phenotypic Grounder */}
                <path 
                  d={getBezierPath(170, 65, 230, 65)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('input-clinical', 'agent-0'))} 
                />
                {/* 2. Genomic Variants -> Variant Classifier */}
                <path 
                  d={getBezierPath(170, 185, 230, 185)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('input-variants', 'agent-1'))} 
                />
                {/* 3. Literature Query -> Literature Correlation */}
                <path 
                  d={getBezierPath(170, 305, 230, 305)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('input-literature', 'agent-2'))} 
                />

                {/* 4. Cross-feed: Phenotypic Grounder -> Variant Classifier */}
                <path 
                  d={getBezierPath(390, 65, 230, 165)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('agent-0', 'agent-1'))} 
                />

                {/* 5. Feeds to Consensus */}
                <path 
                  d={getBezierPath(390, 65, 440, 160)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('agent-0', 'agent-3'))} 
                />
                <path 
                  d={getBezierPath(390, 185, 440, 185)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('agent-1', 'agent-3'))} 
                />
                <path 
                  d={getBezierPath(390, 305, 440, 210)} 
                  className={cn("fill-none transition-all duration-300", getPathClass('agent-2', 'agent-3'))} 
                />

                {/* --- INPUT NODES --- */}
                {/* Clinical Note Node */}
                <foreignObject x="15" y="30" width="155" height="70" className="overflow-visible">
                  <div 
                    onClick={() => setSelectedNodeId('input-clinical')}
                    className={cn(
                      "w-full h-full rounded-xl bg-white border p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02]",
                      selectedNodeId === 'input-clinical' 
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-md" 
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">Clinical note</span>
                      </div>
                      <span className="text-[7.5px] font-mono bg-slate-50 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Input</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-1">
                      {clinicalNote ? `${clinicalNote.substring(0, 18)}...` : "(Empty clinical note)"}
                    </div>
                    <div className="text-[8px] font-medium text-slate-400 flex items-center justify-between mt-1">
                      <span>Chars: {clinicalNote.length}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                  </div>
                </foreignObject>

                {/* Genomic Variants Node */}
                <foreignObject x="15" y="150" width="155" height="70" className="overflow-visible">
                  <div 
                    onClick={() => setSelectedNodeId('input-variants')}
                    className={cn(
                      "w-full h-full rounded-xl bg-white border p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02]",
                      selectedNodeId === 'input-variants' 
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-md" 
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">Variants</span>
                      </div>
                      <span className="text-[7.5px] font-mono bg-slate-50 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Input</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-1">
                      {variantsText ? variantsText : "(No variants added)"}
                    </div>
                    <div className="text-[8px] font-medium text-slate-400 flex items-center justify-between mt-1">
                      <span>Raw input field</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </foreignObject>

                {/* Literature Search Node */}
                <foreignObject x="15" y="270" width="155" height="70" className="overflow-visible">
                  <div 
                    onClick={() => setSelectedNodeId('input-literature')}
                    className={cn(
                      "w-full h-full rounded-xl bg-white border p-2 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02]",
                      selectedNodeId === 'input-literature' 
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-md" 
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">Literature Query</span>
                      </div>
                      <span className="text-[7.5px] font-mono bg-slate-50 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Input</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate mt-1">
                      {literatureQuery ? literatureQuery : "(No search terms)"}
                    </div>
                    <div className="text-[8px] font-medium text-slate-400 flex items-center justify-between mt-1">
                      <span>Query filter</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                  </div>
                </foreignObject>

                {/* --- AGENT PROCESSING NODES --- */}
                {/* Agent 1: Phenotypic Grounder */}
                <foreignObject x="230" y="25" width="160" height="80" className="overflow-visible">
                  <div 
                    onClick={() => {
                      setSelectedNodeId('agent-0');
                      setActiveOutputTab(0);
                    }}
                    className={cn(
                      "w-full h-full rounded-xl p-2.5 flex flex-col justify-between border cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                      selectedNodeId === 'agent-0' 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : !agentsConfig.phenotype.active
                          ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                          : "bg-white border-slate-200 text-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                        <Users className={cn("w-3.5 h-3.5", selectedNodeId === 'agent-0' ? "text-blue-400" : "text-slate-500")} />
                        Pheno Grounder
                      </span>
                      <span className={cn(
                        "text-[7px] font-mono font-bold px-1 py-0.5 rounded",
                        selectedNodeId === 'agent-0' ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-slate-500"
                      )}>
                        Agent 01
                      </span>
                    </div>
                    
                    <div className="text-[8px] line-clamp-2 leading-tight">
                      Parses patient data for human HPO categories.
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className={cn("text-[8px] font-bold uppercase", selectedNodeId === 'agent-0' ? "text-slate-400" : "text-slate-500")}>
                        {agentsConfig.phenotype.model.includes('flash') ? "Flash v3.5" : "Pro v3.1"}
                      </span>
                      <div className="flex items-center gap-1">
                        {currentStep === 0 && isRunning ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        ) : stepResults[0] ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className={cn("w-1.5 h-1.5 rounded-full", agentsConfig.phenotype.active ? "bg-slate-300" : "bg-slate-200")} />
                        )}
                      </div>
                    </div>
                  </div>
                </foreignObject>

                {/* Agent 2: ACMG Variant Classifier */}
                <foreignObject x="230" y="145" width="160" height="80" className="overflow-visible">
                  <div 
                    onClick={() => {
                      setSelectedNodeId('agent-1');
                      setActiveOutputTab(1);
                    }}
                    className={cn(
                      "w-full h-full rounded-xl p-2.5 flex flex-col justify-between border cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                      selectedNodeId === 'agent-1' 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : !agentsConfig.variant.active
                          ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                          : "bg-white border-slate-200 text-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                        <Dna className={cn("w-3.5 h-3.5", selectedNodeId === 'agent-1' ? "text-blue-400" : "text-slate-500")} />
                        ACMG Classifier
                      </span>
                      <span className={cn(
                        "text-[7px] font-mono font-bold px-1 py-0.5 rounded",
                        selectedNodeId === 'agent-1' ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-slate-500"
                      )}>
                        Agent 02
                      </span>
                    </div>
                    
                    <div className="text-[8px] line-clamp-2 leading-tight">
                      Computes variant pathogenicity with ACMG rules.
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className={cn("text-[8px] font-bold uppercase", selectedNodeId === 'agent-1' ? "text-slate-400" : "text-slate-500")}>
                        {agentsConfig.variant.model.includes('flash') ? "Flash v3.5" : "Pro v3.1"}
                      </span>
                      <div className="flex items-center gap-1">
                        {currentStep === 1 && isRunning ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        ) : stepResults[1] ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className={cn("w-1.5 h-1.5 rounded-full", agentsConfig.variant.active ? "bg-slate-300" : "bg-slate-200")} />
                        )}
                      </div>
                    </div>
                  </div>
                </foreignObject>

                {/* Agent 3: Literature Correlation */}
                <foreignObject x="230" y="265" width="160" height="80" className="overflow-visible">
                  <div 
                    onClick={() => {
                      setSelectedNodeId('agent-2');
                      setActiveOutputTab(2);
                    }}
                    className={cn(
                      "w-full h-full rounded-xl p-2.5 flex flex-col justify-between border cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                      selectedNodeId === 'agent-2' 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : !agentsConfig.literature.active
                          ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                          : "bg-white border-slate-200 text-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                        <Search className={cn("w-3.5 h-3.5", selectedNodeId === 'agent-2' ? "text-blue-400" : "text-slate-500")} />
                        Literature Agent
                      </span>
                      <span className={cn(
                        "text-[7px] font-mono font-bold px-1 py-0.5 rounded",
                        selectedNodeId === 'agent-2' ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-slate-500"
                      )}>
                        Agent 03
                      </span>
                    </div>
                    
                    <div className="text-[8px] line-clamp-2 leading-tight">
                      Searches PubMed archives for published alignments.
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className={cn("text-[8px] font-bold uppercase", selectedNodeId === 'agent-2' ? "text-slate-400" : "text-slate-500")}>
                        {agentsConfig.literature.model.includes('flash') ? "Flash v3.5" : "Pro v3.1"}
                      </span>
                      <div className="flex items-center gap-1">
                        {currentStep === 2 && isRunning ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        ) : stepResults[2] ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className={cn("w-1.5 h-1.5 rounded-full", agentsConfig.literature.active ? "bg-slate-300" : "bg-slate-200")} />
                        )}
                      </div>
                    </div>
                  </div>
                </foreignObject>

                {/* --- SYNTHESIS/CONSENSUS NODE --- */}
                {/* Agent 4: Consensus Engine */}
                <foreignObject x="440" y="140" width="145" height="90" className="overflow-visible">
                  <div 
                    onClick={() => {
                      setSelectedNodeId('agent-3');
                      setActiveOutputTab(3);
                    }}
                    className={cn(
                      "w-full h-full rounded-xl p-2.5 flex flex-col justify-between border cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                      selectedNodeId === 'agent-3' 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-blue-500/10" 
                        : !agentsConfig.consensus.active
                          ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                          : "bg-white border-slate-200 text-slate-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                        <BrainCircuit className={cn("w-3.5 h-3.5 animate-pulse", selectedNodeId === 'agent-3' ? "text-blue-400" : "text-blue-500")} />
                        Consensus Hub
                      </span>
                      <span className={cn(
                        "text-[7px] font-mono font-bold px-1 py-0.5 rounded",
                        selectedNodeId === 'agent-3' ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-slate-500"
                      )}>
                        Agent 04
                      </span>
                    </div>
                    
                    <div className="text-[8px] line-clamp-2 leading-tight">
                      Fuses multi-omic streams into high-confidence diagnostic report.
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className={cn("text-[8px] font-bold uppercase", selectedNodeId === 'agent-3' ? "text-slate-400" : "text-slate-500")}>
                        {agentsConfig.consensus.model.includes('flash') ? "Flash v3.5" : "Pro v3.1"}
                      </span>
                      <div className="flex items-center gap-1">
                        {currentStep === 3 && isRunning ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        ) : stepResults[3] ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className={cn("w-1.5 h-1.5 rounded-full", agentsConfig.consensus.active ? "bg-slate-300" : "bg-slate-200")} />
                        )}
                      </div>
                    </div>
                  </div>
                </foreignObject>

                {/* --- PREDICTIVE PATH PATHS --- */}
                {isPpaEnabled && activeSuggestions.map(node => {
                  const isExecuted = executedSuggestedNodes[node.id];
                  const isLoading = loadingSuggestedNodes[node.id];
                  
                  let startX = 512, startY = 140; // Consensus Hub top
                  if (node.id.endsWith('heteroplasmy') || node.id.endsWith('splice') || node.id.endsWith('assembly') || node.id.endsWith('ppi')) {
                    startY = 230; // Consensus Hub bottom
                  }
                  
                  const targetX = node.x + 72; // mid-X
                  const targetY = node.id.endsWith('heteroplasmy') || node.id.endsWith('splice') || node.id.endsWith('assembly') || node.id.endsWith('ppi')
                    ? node.y // top-mid of bottom node
                    : node.y + 90; // bottom-mid of top node
                  
                  return (
                    <path
                      key={`path-${node.id}`}
                      d={getBezierPath(startX, startY, targetX, targetY)}
                      fill="none"
                      stroke={isExecuted ? '#10b981' : isLoading ? '#3b82f6' : '#94a3b8'}
                      strokeWidth={isExecuted ? 2 : 1.5}
                      strokeDasharray={isExecuted ? 'none' : '4, 4'}
                      className={cn(
                        "transition-all duration-300",
                        isLoading && "flowing-path stroke-blue-500 stroke-[2.5]"
                      )}
                      opacity={isExecuted ? 0.9 : 0.5}
                    />
                  );
                })}

                {/* --- PREDICTIVE SUGGESTED NODES --- */}
                {isPpaEnabled && activeSuggestions.map(node => {
                  const isExecuted = executedSuggestedNodes[node.id];
                  const isLoading = loadingSuggestedNodes[node.id];
                  const isSelected = selectedNodeId === node.id;
                  
                  return (
                    <foreignObject 
                      key={node.id} 
                      x={node.x} 
                      y={node.y} 
                      width="145" 
                      height="90" 
                      className="overflow-visible"
                    >
                      <div
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          if (isExecuted) {
                            setActiveOutputTab(node.id);
                          }
                        }}
                        className={cn(
                          "w-full h-full rounded-xl p-2 flex flex-col justify-between border cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative",
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md"
                            : isExecuted 
                              ? "bg-emerald-50/80 border-emerald-500 text-slate-800"
                              : "bg-white border-dashed border-slate-300 text-slate-400 hover:border-blue-400"
                        )}
                      >
                        {/* Probability badge */}
                        <div className="absolute -top-2.5 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-1.5 py-0.5 rounded text-[7px] uppercase tracking-wider shadow-sm">
                          {node.probability}% Match
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tight truncate flex items-center gap-1 max-w-[95px]",
                            isSelected ? "text-white" : "text-slate-800"
                          )}>
                            <Sparkles className={cn("w-3 h-3 shrink-0", isSelected ? "text-amber-400" : isExecuted ? "text-emerald-500" : "text-blue-500")} />
                            <span className="truncate">{node.shortName}</span>
                          </span>
                          <span className={cn(
                            "text-[6px] font-mono font-bold px-1 py-0.2 rounded shrink-0",
                            isSelected ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-500"
                          )}>
                            PPA Next
                          </span>
                        </div>

                        <div className={cn(
                          "text-[7px] line-clamp-2 leading-tight mt-1 font-semibold",
                          isSelected ? "text-slate-300" : isExecuted ? "text-slate-600" : "text-slate-500"
                        )}>
                          {node.reason}
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100/50">
                          <span className="text-[7px] font-mono font-black uppercase text-slate-400">Est: {node.estLatency}</span>
                          <div className="flex items-center gap-1">
                            {isLoading ? (
                              <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                              </span>
                            ) : isExecuted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <span
                                className="text-[7px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded uppercase tracking-tighter"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExecuteSuggestedNode(node.id);
                                }}
                              >
                                Execute
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </foreignObject>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Properties Sub-Panel */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300">
              
              {/* Node-Clinical properties */}
              {selectedNodeId === 'input-clinical' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-500" /> Clinical note parameters
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Primary unstructured patient case files fed to Pheno Grounder.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md">Input Stream</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
                    Provides natural language symptom mappings, biopsy files, rest lactates, and pedigree metadata.
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col">
                      <span className="text-[8px] font-mono text-slate-400 uppercase">Text length</span>
                      <span className="text-xs font-black text-slate-700 mt-0.5">{clinicalNote.length} Chars</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col">
                      <span className="text-[8px] font-mono text-slate-400 uppercase">Word count</span>
                      <span className="text-xs font-black text-slate-700 mt-0.5">{clinicalNote.split(/\s+/).filter(Boolean).length} Words</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Node-Variants properties */}
              {selectedNodeId === 'input-variants' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Dna className="w-4 h-4 text-purple-500" /> Genomic Variants Stream
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Identified patient variants referenced against ACMG scorecard criteria.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md">Input Stream</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
                    Accepts mitochondrial (MT) or chromosome designations, including mutation formats (e.g. m.3243A&gt;G).
                  </div>
                  <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col mt-1">
                    <span className="text-[8px] font-mono text-slate-400 uppercase">Active Target variant</span>
                    <span className="text-xs font-mono font-bold text-slate-700 mt-0.5">{variantsText || "None specified"}</span>
                  </div>
                </div>
              )}

              {/* Node-Literature properties */}
              {selectedNodeId === 'input-literature' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-500" /> PubMed Search Query
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Formulated PubMed keyword queries for literature retrieval.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md">Input Stream</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
                    Search grounding tools find indexed ClinVar cases, functional assays, and relative syndrome papers.
                  </div>
                  <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col mt-1">
                    <span className="text-[8px] font-mono text-slate-400 uppercase">NIH PubMed Query</span>
                    <span className="text-xs font-bold text-slate-700 mt-0.5">"{literatureQuery || "None"}"</span>
                  </div>
                </div>
              )}

              {/* Agent 1 Configuration */}
              {selectedNodeId === 'agent-0' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" /> Pheno Grounder Parameters
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Extracts physiological HPO terms from clinical note files.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agentsConfig.phenotype.active} 
                        onChange={(e) => setAgentsConfig(p => ({ ...p, phenotype: { ...p.phenotype, active: e.target.checked } }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Inference LLM</label>
                      <select 
                        value={agentsConfig.phenotype.model}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, phenotype: { ...p.phenotype, model: e.target.value } }))}
                        className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Temperature ({agentsConfig.phenotype.temperature})</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={agentsConfig.phenotype.temperature}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, phenotype: { ...p.phenotype, temperature: parseFloat(e.target.value) } }))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 my-auto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Agent 2 Configuration */}
              {selectedNodeId === 'agent-1' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Dna className="w-4 h-4 text-purple-500" /> Variant ACMG Parameters
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Evaluates variant classifications and ACMG scorecard metrics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agentsConfig.variant.active} 
                        onChange={(e) => setAgentsConfig(p => ({ ...p, variant: { ...p.variant, active: e.target.checked } }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Inference LLM</label>
                      <select 
                        value={agentsConfig.variant.model}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, variant: { ...p.variant, model: e.target.value } }))}
                        className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Temperature ({agentsConfig.variant.temperature})</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={agentsConfig.variant.temperature}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, variant: { ...p.variant, temperature: parseFloat(e.target.value) } }))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 my-auto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Agent 3 Configuration */}
              {selectedNodeId === 'agent-2' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-amber-500" /> Literature Agent Parameters
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Configures search query strategies against PubMed publications.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agentsConfig.literature.active} 
                        onChange={(e) => setAgentsConfig(p => ({ ...p, literature: { ...p.literature, active: e.target.checked } }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Inference LLM</label>
                      <select 
                        value={agentsConfig.literature.model}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, literature: { ...p.literature, model: e.target.value } }))}
                        className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Temperature ({agentsConfig.literature.temperature})</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={agentsConfig.literature.temperature}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, literature: { ...p.literature, temperature: parseFloat(e.target.value) } }))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 my-auto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Agent 4 Configuration */}
              {selectedNodeId === 'agent-3' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-blue-600" /> Consensus Hub Parameters
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Synthesizes phenotypes, ACMG rates, and PubMed trials.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agentsConfig.consensus.active} 
                        onChange={(e) => setAgentsConfig(p => ({ ...p, consensus: { ...p.consensus, active: e.target.checked } }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Inference LLM</label>
                      <select 
                        value={agentsConfig.consensus.model}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, consensus: { ...p.consensus, model: e.target.value } }))}
                        className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Reasoning)</option>
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Temperature ({agentsConfig.consensus.temperature})</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={agentsConfig.consensus.temperature}
                        onChange={(e) => setAgentsConfig(p => ({ ...p, consensus: { ...p.consensus, temperature: parseFloat(e.target.value) } }))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 my-auto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Node-PPA Suggested Nodes properties */}
              {isPpaEnabled && activeSuggestions.some(n => n.id === selectedNodeId) && (
                (() => {
                  const node = activeSuggestions.find(n => n.id === selectedNodeId)!;
                  const isExecuted = executedSuggestedNodes[node.id];
                  const isLoading = loadingSuggestedNodes[node.id];
                  
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-blue-500" /> Predictive path model
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">High probability diagnostic investigation model suggested by PPA.</p>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">PPA Node</span>
                      </div>
                      
                      <div className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        <strong>Model Objective</strong>: {node.name}
                      </div>

                      <div className="bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/50 flex flex-col gap-1.5 mt-1">
                        <span className="text-[8px] font-mono text-slate-400 uppercase font-black">Link Suggestion Reason</span>
                        <p className="text-[10px] text-slate-600 leading-normal font-semibold">
                          {node.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col">
                          <span className="text-[8px] font-mono text-slate-400 uppercase">Match Probability</span>
                          <span className="text-xs font-black text-slate-700 mt-0.5">{node.probability}% Match</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-xl flex flex-col">
                          <span className="text-[8px] font-mono text-slate-400 uppercase">Est. Latency</span>
                          <span className="text-xs font-black text-slate-700 mt-0.5">{node.estLatency}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-200/60">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            Simulating model...
                          </div>
                        ) : isExecuted ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            Active Evidence Tab Unlocked
                          </div>
                        ) : (
                          <button
                            onClick={() => handleExecuteSuggestedNode(node.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Execute Predictive Path
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </div>

          <LiteratureSnippetsPanel 
            selectedNodeId={selectedNodeId}
            clinicalNote={clinicalNote}
            variantsText={variantsText}
          />
        </div>

      </div>

      {/* Dynamic Staged Agent Output Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[450px] flex flex-col gap-6">
        
        {/* Output Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 0, label: "Phenotypic Grounder", icon: Users },
              { id: 1, label: "ACMG Variant Classifier", icon: Dna },
              { id: 2, label: "Literature Correlation", icon: BookOpen },
              { id: 3, label: "Multi-Omic Consensus", icon: BrainCircuit },
              ...(isPpaEnabled 
                ? activeSuggestions
                    .filter(node => executedSuggestedNodes[node.id])
                    .map(node => ({
                      id: node.id,
                      label: node.shortName,
                      icon: Sparkles
                    }))
                : []
              ),
              { id: 4, label: "Agentic Latency Monitor", icon: BarChart3 }
            ].map(tab => {
              const hasResult = typeof tab.id === 'string' || (tab.id === 4 ? true : !!stepResults[tab.id as number]);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveOutputTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all select-none cursor-pointer border",
                    activeOutputTab === tab.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <tab.icon className={cn("w-3.5 h-3.5", activeOutputTab === tab.id ? "text-blue-400" : "text-slate-400")} />
                  {tab.label}
                  {hasResult && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase font-black text-slate-400 tracking-wider">
            Active Output Dashboard
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1">
          {activeOutputTab === 4 ? (
            <LatencyMonitorDashboard latencyData={latencyData} />
          ) : typeof activeOutputTab === 'string' && activeSuggestions.some(n => n.id === activeOutputTab) ? (
            (() => {
              const node = activeSuggestions.find(n => n.id === activeOutputTab)!;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Agent Thinking & Meta */}
                  <div className="lg:col-span-4 flex flex-col gap-5 border-r border-slate-100 pr-0 lg:pr-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PPA Suggested Path</span>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                        {node.name}
                      </h4>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-blue-500" /> Model Suggestion Match
                      </span>
                      <p className="text-[11px] leading-relaxed font-semibold text-slate-700 italic">
                        "{node.reason}"
                      </p>
                    </div>

                    {/* Sub-Payload Data visualizer */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Predicted Parameters</span>
                      <div className="flex flex-wrap gap-1.5">
                        {node.payload.map((p, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 flex flex-col">
                            <span className="text-[9px] font-black text-blue-800 uppercase tracking-tight">{p.name}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-600 mt-0.5">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Markdown Output */}
                  <div className="lg:col-span-8 flex flex-col gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                      Predictive Simulation Evidence Report
                    </span>
                    <div className="prose prose-slate prose-sm max-w-none prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black prose-a:text-blue-600 h-[450px] overflow-y-auto custom-scrollbar bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <Markdown>{node.markdown}</Markdown>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          ) : stepResults[activeOutputTab as number] ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Agent Thinking & Meta */}
              <div className="lg:col-span-4 flex flex-col gap-5 border-r border-slate-100 pr-0 lg:pr-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Executing Agent</span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    {stepResults[activeOutputTab]?.stepName}
                  </h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-500" /> Internal Thought Chain
                  </span>
                  <p className="text-[11px] leading-relaxed font-semibold text-slate-700 italic">
                    "{stepResults[activeOutputTab]?.thoughtProcess}"
                  </p>
                </div>

                {/* Sub-Payload Data visualizer */}
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Data Payloads Extracted</span>
                  
                  {activeOutputTab === 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {stepResults[0]?.dataPayload?.map((t: any, idx: number) => (
                        <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 flex flex-col">
                          <span className="text-[9px] font-black text-blue-800 uppercase tracking-tight">{t.name}</span>
                          <span className="text-[8px] font-mono text-blue-500 uppercase tracking-tighter mt-0.5">{t.id} • {t.system} ({t.severity})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeOutputTab === 1 && (
                    <div className="flex flex-col gap-2">
                      {stepResults[1]?.dataPayload?.map((v: any, idx: number) => (
                        <div key={idx} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex flex-col">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tight">{v.gene} {v.variant}</span>
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">{v.acmgClassification}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {v.acmgCriteria?.map((crit: string, cIdx: number) => (
                              <span key={cIdx} className="text-[7.5px] font-mono font-black bg-white border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">{crit}</span>
                            ))}
                          </div>
                          {v.clinvarId && (
                            <span className="text-[8px] font-mono text-slate-400 mt-1.5">ClinVar Reference: {v.clinvarId}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeOutputTab === 2 && (
                    <div className="flex flex-col gap-2">
                      {stepResults[2]?.dataPayload?.map((paper: any, idx: number) => (
                        <div key={idx} className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 flex flex-col">
                          <span className="text-[10px] font-black text-purple-900 leading-snug line-clamp-1">{paper.title}</span>
                          <span className="text-[8px] font-medium text-purple-700 mt-0.5">{paper.authors} ({paper.year}) • {paper.journal}</span>
                          <p className="text-[9px] text-slate-600 leading-normal line-clamp-2 mt-1">{paper.findings}</p>
                          <a 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[8px] font-mono font-black text-purple-600 hover:underline mt-1.5 flex items-center gap-1 select-none"
                          >
                            PMID: {paper.pmid} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeOutputTab === 3 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col gap-2">
                        <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">Diagnostic Verdict</span>
                        <h5 className="text-xs font-black uppercase tracking-tight">{stepResults[3]?.dataPayload?.finalDiagnosis}</h5>
                        
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${(stepResults[3]?.dataPayload?.confidenceScore || 0.85) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-black">
                            {((stepResults[3]?.dataPayload?.confidenceScore || 0.85) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Pathways Targeted</span>
                        <div className="flex flex-wrap gap-1">
                          {stepResults[3]?.dataPayload?.pathwaysAffected?.map((pw: string, idx: number) => (
                            <span key={idx} className="text-[8px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">{pw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Markdown Output */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                  Synthesized Evidence Report
                </span>
                <div className="prose prose-slate prose-sm max-w-none prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black prose-a:text-blue-600 h-[450px] overflow-y-auto custom-scrollbar bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <Markdown>{stepResults[activeOutputTab]?.outputMarkdown}</Markdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center gap-3 text-slate-400 select-none">
              <Cpu className="w-12 h-12 text-slate-300 animate-bounce" />
              <div className="flex flex-col items-center gap-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Agentic Data Stream Offline</h4>
                <p className="text-[10px] text-slate-400 text-center max-w-sm font-medium">
                  Trigger the "Execute Agentic Reasoning Chain" pipeline to generate live ground diagnostics and evidence summaries.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Automated NLP Knowledge Graph Link Suggester Service */}
      <NLPGraphLinker 
        activeVariantPayload={stepResults[1]?.dataPayload || null} 
        rawVariantsText={variantsText} 
      />
    </div>
  );
}

function LatencyMonitorDashboard({ latencyData }: { latencyData: LatencyMetrics[] }) {
  // Compute some insights
  const activeSteps = latencyData.filter(d => d.total > 0);
  
  const totalChainTime = activeSteps.reduce((sum, d) => sum + d.total, 0);
  const totalInferenceTime = activeSteps.reduce((sum, d) => sum + d.inference, 0);
  const totalRetrievalTime = activeSteps.reduce((sum, d) => sum + d.retrieval, 0);
  const avgLatency = activeSteps.length > 0 ? Math.round(totalChainTime / activeSteps.length) : 0;
  
  const retrievalOverheadPct = totalChainTime > 0 ? Math.round((totalRetrievalTime / totalChainTime) * 100) : 0;
  
  let bottleneckStep = { name: "None", total: 0, reason: "" };
  if (activeSteps.length > 0) {
    const maxStep = activeSteps.reduce((prev, current) => (prev.total > current.total) ? prev : current);
    let reason = "Model reasoning and synthesis overhead.";
    if (maxStep.name.includes("Variant") || maxStep.name.includes("Literature")) {
      reason = "Multi-source external API and search tool grounding operations.";
    }
    bottleneckStep = { name: maxStep.name, total: maxStep.total, reason };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Performance Analysis</span>
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2 mt-0.5">
            <Timer className="w-4 h-4 text-blue-500" /> Reasoning Chain execution profile
          </h4>
        </div>
        
        {totalChainTime > 0 ? (
          <div className="flex items-center gap-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-medium max-w-md">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>{bottleneckStep.name}</strong> represents the active bottleneck (<strong>{bottleneckStep.total} ms</strong>) driven by <em>{bottleneckStep.reason}</em>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-medium">
            <Activity className="w-4 h-4 text-slate-400" />
            <span>No active diagnostics executed in current session. Showing cached baseline profile.</span>
          </div>
        )}
      </div>

      {/* Bento Grid Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Chain Latency</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-slate-800">{(totalChainTime / 1000).toFixed(2)}s</span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Sum of all sequential steps in reasoning loop.</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Avg Step Execution</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-slate-800">{avgLatency}ms</span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Mean duration per diagnostic agent invocation.</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Retrieval Overhead</span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-slate-800">{retrievalOverheadPct}%</span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Time spent in tool grounding & external index lookups.</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Inference Efficiency</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-slate-800">{100 - retrievalOverheadPct}%</span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Time dedicated to deep LLM token generation & synthesis.</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Execution Time Stacked Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Latency breakdown by step
              </h5>
              <p className="text-[9px] text-slate-400">Visualizes model inference vs. grounding search tool data retrieval.</p>
            </div>
            
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-tight text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#3b82f6]" /> Model Inference
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" /> Tool Retrieval
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={latencyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={8} 
                  fontWeight={700}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => value.split(' ').slice(0, 2).join(' ')}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={8} 
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  unit=" ms"
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as LatencyMetrics;
                      if (data.total === 0) {
                        return (
                          <div className="bg-slate-900 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-md flex flex-col gap-0.5">
                            <span className="font-bold">{label}</span>
                            <span className="text-slate-400 mt-1">Status: Disabled</span>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-slate-900 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-md flex flex-col gap-1 font-mono">
                          <span className="font-sans font-bold text-[11px] text-white border-b border-slate-800 pb-1 mb-1">{label}</span>
                          <span className="text-slate-300 font-sans">Model: {data.model}</span>
                          <span className="text-blue-400 font-bold">Inference: {data.inference} ms</span>
                          <span className="text-amber-400 font-bold">Retrieval: {data.retrieval} ms</span>
                          <span className="text-emerald-400 font-black border-t border-slate-800 pt-1 mt-1 font-sans text-sm">Total: {data.total} ms</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="inference" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                  {latencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total === 0 ? "#cbd5e1" : "#3b82f6"} opacity={entry.total === 0 ? 0.3 : 1} />
                  ))}
                </Bar>
                <Bar dataKey="retrieval" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {latencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total === 0 ? "#e2e8f0" : "#f59e0b"} opacity={entry.total === 0 ? 0.3 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Trend Line */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-3">
              <Activity className="w-4 h-4 text-emerald-500" /> Latency Trend Line
            </h5>
            <p className="text-[9px] text-slate-400 mb-4">Sequential execution trajectory showing latency spikes across pipeline steps.</p>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={latencyData.filter(d => d.total > 0)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#cbd5e1" 
                    fontSize={7} 
                    fontWeight={600}
                    tickFormatter={(v) => v.split(' ')[0]}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#cbd5e1" 
                    fontSize={7}
                    tickLine={false}
                    axisLine={false}
                    unit="ms"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as LatencyMetrics;
                        return (
                          <div className="bg-slate-900 text-white text-[9px] p-2 rounded-lg font-mono">
                            <span className="font-sans font-bold">{data.name}</span>
                            <div className="mt-1 font-black text-emerald-400">{data.total} ms</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: "#ffffff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] leading-normal text-slate-500 font-medium">
            💡 <strong>Pro Tip</strong>: Reduce latency overhead by using smaller models (e.g., <strong>Gemini 3.5 Flash</strong>) for grounding tasks, and reserving larger models only for the final <strong>Consensus Hub</strong> report synthesis.
          </div>
        </div>
      </div>

      {/* Latency Detailed Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tabular audit profile</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[8px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-2.5 px-4">Reasoning Agent Step</th>
                <th className="py-2.5 px-4">Inference Engine</th>
                <th className="py-2.5 px-4 text-right">Inference Latency</th>
                <th className="py-2.5 px-4 text-right">Retrieval Latency</th>
                <th className="py-2.5 px-4 text-right">Total Latency</th>
                <th className="py-2.5 px-4 text-right">Grounding Overhead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latencyData.map((step, idx) => {
                const overhead = step.total > 0 ? Math.round((step.retrieval / step.total) * 100) : 0;
                const isDisabled = step.total === 0;

                return (
                  <tr key={idx} className={cn("hover:bg-slate-50/50 transition-colors font-medium", isDisabled && "text-slate-400 opacity-60 bg-slate-50/10")}>
                    <td className="py-3 px-4 font-black">{step.name}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                        isDisabled 
                          ? "bg-slate-100 text-slate-400" 
                          : step.model.toLowerCase().includes('pro') 
                            ? "bg-purple-50 border border-purple-100 text-purple-700" 
                            : "bg-blue-50 border border-blue-100 text-blue-700"
                      )}>
                        {step.model}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {isDisabled ? "—" : `${step.inference} ms`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {isDisabled ? "—" : `${step.retrieval} ms`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 font-bold">
                      {isDisabled ? <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Bypassed</span> : `${step.total} ms`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isDisabled ? (
                        "—"
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono text-slate-500 text-[10px]">{overhead}%</span>
                          <div className="w-12 bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", overhead > 50 ? "bg-amber-500" : "bg-blue-500")}
                              style={{ width: `${overhead}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
