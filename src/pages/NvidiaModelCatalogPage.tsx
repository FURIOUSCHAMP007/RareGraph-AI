import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Dna, 
  Atom, 
  Layers, 
  Activity, 
  Terminal, 
  Settings, 
  Search, 
  Sparkles, 
  Play, 
  ArrowUpRight, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Sliders, 
  X, 
  ExternalLink, 
  FileText, 
  Database, 
  AlertCircle, 
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export interface ModelSpec {
  id: string;
  name: string;
  task: string;
  modality: 'PROTEINS' | 'CHEMISTRY' | 'GENOMICS' | 'CELLULAR';
  parameters: string;
  license: string;
  description: string;
  latency: string;
  gpuRequirement: string;
  accuracyMetric: string;
  curatedBy: string;
  codeSnippet: string;
  workspaceId: 'bionemo-folding' | 'bionemo-discovery' | 'bionemo-hub' | 'bionemo-viewer' | 'bionemo-bioreactor';
  defaultInput: string;
  inputLabel: string;
}

const BIONEMO_MODELS: ModelSpec[] = [
  {
    id: 'esmfold',
    name: 'ESMFold-2 (3B)',
    task: 'De Novo Protein 3D Structure Prediction',
    modality: 'PROTEINS',
    parameters: '3 Billion',
    license: 'Non-Commercial / CC-BY-NC-4.0',
    description: 'Generates high-accuracy 3D atomic coordinates directly from single-chain primary amino acid sequences. Orders of magnitude faster than AlphaFold2, completely bypassing Multiple Sequence Alignment (MSA) lookups.',
    latency: '3.8s',
    gpuRequirement: '1x H100 SXM5 (80GB)',
    accuracyMetric: '94.2% average pLDDT confidence',
    curatedBy: 'Meta AI / NVIDIA NGC Optimized',
    workspaceId: 'bionemo-folding',
    inputLabel: 'Amino Acid Sequence (FASTA format)',
    defaultInput: 'MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLTYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/esmfold"\nheaders = {\n    "Authorization": "Bearer $NGC_API_KEY",\n    "Content-Type": "application/json"\n}\ndata = {\n    "sequence": "MSKGEELFTGVVPILVELDGDVN..."\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json())`,
  },
  {
    id: 'diffdock',
    name: 'DiffDock (180M)',
    task: 'Protein-Ligand Binding & Molecular Docking',
    modality: 'CHEMISTRY',
    parameters: '180 Million',
    license: 'Apache 2.0 (Open Source)',
    description: 'Diffusion-based generative model predicting the 3D binding conformation and rigid/flexible orientation of a ligand relative to a target protein structure. Models structural plasticity in cell signaling.',
    latency: '11.2s',
    gpuRequirement: '1x A100 SXM4 (80GB)',
    accuracyMetric: '88.5% success rate under 2.0 Å RMSD',
    curatedBy: 'MIT / NVIDIA AI Labs',
    workspaceId: 'bionemo-discovery',
    inputLabel: 'SMILES Chemical Ligand Structure',
    defaultInput: 'CC1=C(C(C(=C(C)N1)C(=O)OC)C2=CC=CC=C2[N+](=O)[O-])C(=O)OC',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/diffdock"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "pdb_structure": "HEADER PROTEIN BINDING...",\n    "ligand_smiles": "CC1=C(C(C(=C(C)N1)..."\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["docked_poses"])`,
  },
  {
    id: 'esm2',
    name: 'ESM-2 (3B)',
    task: 'Mutation Fitness & Codon Pathogenicity Scanning',
    modality: 'PROTEINS',
    parameters: '3 Billion',
    license: 'MIT License (Commercial Friendly)',
    description: 'Deep biological transformer designed to model evolutionary variations in genetic structures. Scores point mutations, isolates pathogenic loci, and tracks protein fitness landscapes in a zero-shot manner.',
    latency: '1.4s',
    gpuRequirement: '1x H100 / A100 SXM5',
    accuracyMetric: '0.84 Spearman correlation with experimental assays',
    curatedBy: 'NVIDIA BioNeMo / Evolutionary Scale',
    workspaceId: 'bionemo-hub',
    inputLabel: 'Sequence Mutation Locus String',
    defaultInput: 'M1V, K3E, L12M, F18S',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/esm2"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "sequence": "MSKGEELFTGV...",\n    "mutations": ["M1V", "K3E"]\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["scores"])`,
  },
  {
    id: 'megamolbart',
    name: 'MegaMolBART (450M)',
    task: 'Generative Chemistry & Drug Analog Generation',
    modality: 'CHEMISTRY',
    parameters: '450 Million',
    license: 'Apache 2.0 (Open Source)',
    description: 'Bidirectional chemical transformer trained on billions of drug-like molecules. Excels at SMILES token embedding, chemical property classification, latent space interpolation, and drug optimization pipelines.',
    latency: '2.1s',
    gpuRequirement: '1x A100 Tensor Core',
    accuracyMetric: '99.8% valid SMILES reconstruction score',
    curatedBy: 'AstraZeneca / NVIDIA AI',
    workspaceId: 'bionemo-discovery',
    inputLabel: 'Seed Molecule SMILES Structure',
    defaultInput: 'CC1=C(C2=C(N1)C=C(C=C2)F)C(=O)O',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/megamolbart"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "smiles": "CC1=C(C2=C(N1)...",\n    "num_samples": 10,\n    "noise_level": 0.1\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["analogs"])`,
  },
  {
    id: 'molmim',
    name: 'MolMIM Controlled Gen',
    task: 'SMILES Generation with Targeted Properties',
    modality: 'CHEMISTRY',
    parameters: '380 Million',
    license: 'NVIDIA Enterprise SLA',
    description: 'Generates small molecules with optimized physical properties (such as solubility and synthesis accessibility) inside a cohesive molecular latent space, constraining compound structural mutation vectors.',
    latency: '3.2s',
    gpuRequirement: '1x H100 SXM5',
    accuracyMetric: '94.6% satisfaction rate across multi-objective targets',
    curatedBy: 'NVIDIA Research',
    workspaceId: 'bionemo-discovery',
    inputLabel: 'Target Properties Constraints (SMILES Input)',
    defaultInput: 'CNC(=O)C1=CC=CC=C1OC1=CC=C(NC(=O)NC2=CC(=C(C=C2)Cl)C(F)(F)F)C=C1',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/molmim"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "seed_smiles": "CNC(=O)C1=CC=CC=C1OC1=C...",\n    "target_solubility": "high",\n    "target_logp": 2.5\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["optimized_candidates"])`,
  },
  {
    id: 'geneformer',
    name: 'Geneformer (30M)',
    task: 'Cellular Transcriptomics Perturbation Modeling',
    modality: 'CELLULAR',
    parameters: '30 Million',
    license: 'Non-Commercial / CC-BY-NC-4.0',
    description: 'Attention-based biological language model trained on single-cell transcriptomes. Predicts gene network perturbation cascades, therapeutic resistance mechanisms, and cell-fate transitions in diseased lineages.',
    latency: '5.2s',
    gpuRequirement: '1x A10G (24GB)',
    accuracyMetric: '0.89 F1-score for cell-type classification',
    curatedBy: 'Broad Institute / NVIDIA Cloud',
    workspaceId: 'bionemo-hub',
    inputLabel: 'Target Expression Vector / Gene Loci (Ensembl ID)',
    defaultInput: 'ENSG00000141510 (TP53), ENSG00000139618 (BRCA2)',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/geneformer"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "expression_matrix": [[0.4, 0.0, 1.2, 0.5]],\n    "perturb_genes": ["ENSG00000141510"]\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["network_shift"])`,
  },
  {
    id: 'dnabert',
    name: 'DNABERT-2 (110M)',
    task: 'Genomic Motif Discovery & Promoters Scanning',
    modality: 'GENOMICS',
    parameters: '110 Million',
    license: 'MIT License (Commercial Friendly)',
    description: 'Analyzes dynamic nucleotide sequences to isolate genomic promoters, transcript factors binding sites, and DNA methylation statuses. Perfect for mapping rare disease regulatory variants.',
    latency: '1.2s',
    gpuRequirement: '1x A10G / L4 Optimized',
    accuracyMetric: '91.8% accuracy on genomic promoter datasets',
    curatedBy: 'NVIDIA BioNeMo Genomics',
    workspaceId: 'bionemo-hub',
    inputLabel: 'DNA Nucleotide String (A, C, G, T)',
    defaultInput: 'GCTAGCTAGCTAGCTACGATCGATCGATCGATCGATCGATCGATCGATCGACTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC',
    codeSnippet: `import requests\n\nurl = "https://api.ngc.nvidia.com/v1/health/bionemo/dnabert"\nheaders = {"Authorization": "Bearer $NGC_API_KEY"}\ndata = {\n    "dna_sequence": "GCTAGCTAGCTAGCTACGATCGATCG..."\n}\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()["promoter_scores"])`,
  }
];

export default function NvidiaModelCatalogPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<'ALL' | 'PROTEINS' | 'CHEMISTRY' | 'GENOMICS' | 'CELLULAR'>('ALL');
  const [activeTab, setActiveTab] = useState<'CARDS' | 'TABLE' | 'COMPARE'>('CARDS');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  
  // Interactive Inference Playground State
  const [selectedPlaygroundModel, setSelectedPlaygroundModel] = useState<ModelSpec | null>(null);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [inferenceRunning, setInferenceRunning] = useState(false);
  const [inferenceProgress, setInferenceProgress] = useState(0);
  const [inferenceLogs, setInferenceLogs] = useState<string[]>([]);
  const [inferenceResult, setInferenceResult] = useState<any | null>(null);

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    toast.success('Snippet Copied', {
      description: 'API Request Python code written to clipboard.'
    });
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const filteredModels = BIONEMO_MODELS.filter(model => {
    const matchesSearch = 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = selectedModality === 'ALL' || model.modality === selectedModality;
    return matchesSearch && matchesModality;
  });

  const openPlayground = (model: ModelSpec) => {
    setSelectedPlaygroundModel(model);
    setPlaygroundInput(model.defaultInput);
    setInferenceRunning(false);
    setInferenceProgress(0);
    setInferenceLogs([]);
    setInferenceResult(null);
  };

  const executeInferencePlayground = () => {
    if (!selectedPlaygroundModel) return;
    if (!playgroundInput.trim()) {
      toast.error('Invalid Input', {
        description: 'Provide an active sequence or structure input to scan.'
      });
      return;
    }

    setInferenceRunning(true);
    setInferenceProgress(5);
    setInferenceResult(null);
    setInferenceLogs([]);

    const modelId = selectedPlaygroundModel.id;
    const addLog = (msg: string) => {
      setInferenceLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Resolving Triton Inference Server endpoint for bionemo/${modelId}...`);
    addLog(`Securing H100 Hopper Tensor Core cluster resource allocation.`);
    addLog(`Input token payload verified: ${playgroundInput.slice(0, 35)}...`);

    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Generate model-specific simulated results
        let finalResult: any = {};
        if (modelId === 'esmfold') {
          finalResult = {
            pdbCoordinates: 'REMARK 220 Predicted Protein Backbone coordinates generated by ESMFold-2...',
            plddt: 95.4,
            tmScore: 0.91,
            rmsd: '1.05 Å',
            structuresFound: '3 Alpha-helices, 2 Beta-sheets resolved.'
          };
        } else if (modelId === 'diffdock') {
          finalResult = {
            dockedPoseScore: '-8.4 kcal/mol (Strong Ligand Affinity)',
            confidence: 'High Confidence (0.82)',
            residuesInContact: 'Glu-242, His-110, Asp-99',
            torsiAnglesAllowed: '8 of 12 flexible torsions adjusted.'
          };
        } else if (modelId === 'esm2') {
          finalResult = {
            mutationFitnessScore: '-4.65 (Significant Deleterious Threshold)',
            pathogenicityRank: '92nd percentile (LIKELY PATHOGENIC)',
            clinvarMatchChance: '87.5% consensus on congenital mutation',
            biophysicalShift: 'Hydrophobic to Charged basic residue swap.'
          };
        } else if (modelId === 'megamolbart') {
          finalResult = {
            analogSMILES: 'CC1=C(C2=C(N1)C=C(C=C2)F)C(=O)O -> CC1=C(C2=C(N1)C=C(C=C2)F)CC1CCNCC1',
            propertyShift: 'LogP: 2.15 -> 1.84 (Improved target water solubility)',
            synthesizabilityScore: '3.4 (Highly Synthesizable)'
          };
        } else if (modelId === 'molmim') {
          finalResult = {
            bestCandidateSMILES: 'CNC(=O)C1=CC=CC=C1OC1=CC=C(NC(=O)NC2=CC(=C(C=C2)Cl)C(F)(F)F)C=C1',
            optimizedLogP: '2.45',
            solubilityMetric: '92% solubility index achieved'
          };
        } else if (modelId === 'geneformer') {
          finalResult = {
            perturbedNetworkShift: 'TP53 Downregulation suppresses downstream apoptosis pathway markers by 42%',
            chromatinCorrelation: '0.84 alignment coefficient',
            therapeuticIndex: 'Degraded expression matches tumor suppression state.'
          };
        } else {
          finalResult = {
            motifScore: '0.94 probability index of transcription binding',
            sequencesIdentified: 'TATA-box promoter scanned successfully at offset 24.'
          };
        }

        setInferenceResult(finalResult);
        setInferenceRunning(false);
        addLog(`Forward pass completed. Weights cleared from VRAM.`);
        addLog(`Inference execution resolved successfully.`);
        toast.success(`Inference Complete: ${selectedPlaygroundModel.name}`);
      } else {
        setInferenceProgress(currentProgress);
        if (currentProgress > 20 && currentProgress < 45) {
          addLog(`Parsing biological parameters through self-attention layers...`);
        } else if (currentProgress >= 45 && currentProgress < 75) {
          addLog(`Executing GPU tensor math operations inside accelerated CUDA kernel cores.`);
        } else if (currentProgress >= 75 && currentProgress < 95) {
          addLog(`Applying clinical alignment checks & policy guidelines.`);
        }
      }
    }, 400);
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Enterprise Nvidia Banner */}
      <div className="relative bg-[#05070a] border border-zinc-900 rounded-[24px] p-8 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#76B900_1px,transparent_1px),linear-gradient(to_bottom,#76B900_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.015] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#76B900]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 max-w-5xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-[#76B900]/30">
              NVIDIA BioNeMo Platform
            </span>
            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border border-zinc-700">
              Computational Biology Repository
            </span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              NVIDIA BioNeMo™ <span className="text-[#76B900]">Model Catalog</span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-4xl">
              A comprehensive registry of state-of-the-art biological foundation models optimized for GPU acceleration.
              Directly review architectural dimensions, parameter density, license scopes, and launch low-latency inference
              pipelines across specialized structural folding, zero-shot scanning, and chemical binding workspaces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button 
              onClick={() => onNavigate('bionemo-hub')}
              className="px-5 py-2.5 bg-[#76B900] hover:bg-[#66a000] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
            >
              Enter BioNeMo Hub
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button 
              onClick={() => onNavigate('bionemo-monitor')}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Verify Active NIM Gateway Probes
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search models, biological tasks, or licensing terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-[#76B900] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter Modality:
          </span>
          {(['ALL', 'PROTEINS', 'CHEMISTRY', 'GENOMICS', 'CELLULAR'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                selectedModality === mod
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
          {(['CARDS', 'TABLE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog View */}
      {filteredModels.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <h3 className="text-xs font-black text-slate-700 uppercase">No Models Match Criteria</h3>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
            Try adjusting your search queries or clearing the modality filters to find active biological foundations.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedModality('ALL'); }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : activeTab === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <motion.div 
              key={model.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200/80 hover:border-[#76B900]/40 rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    model.modality === 'PROTEINS' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                    model.modality === 'CHEMISTRY' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    model.modality === 'GENOMICS' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-cyan-50 border-cyan-200 text-cyan-700'
                  }`}>
                    {model.modality}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-400 font-bold">
                    <Activity className="w-3 h-3 text-slate-300" />
                    <span>Latency: {model.latency}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight group-hover:text-[#76B900] transition-colors">
                    {model.name}
                  </h3>
                  <span className="text-[9px] font-black text-[#76B900] uppercase tracking-wide block font-mono">
                    {model.task}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Specs & Actions */}
              <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                
                {/* Micro Specs List */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-bold text-slate-600">
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-100">
                    <Database className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">Params: {model.parameters}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-100">
                    <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate" title={model.license}>License: {model.license.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-100 col-span-2">
                    <Sliders className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">Resource: {model.gpuRequirement}</span>
                  </div>
                </div>

                {/* API Snip or Quick Launch buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openPlayground(model)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn"
                  >
                    <Play className="w-3 h-3 text-[#76B900] fill-[#76B900] group-hover/btn:scale-110 transition-transform" />
                    Launch Inference
                  </button>
                  <button
                    onClick={() => {
                      onNavigate(model.workspaceId);
                      toast.info(`Navigating to dedicated workspace for ${model.name}`);
                    }}
                    className="p-2 border border-slate-200 hover:border-[#76B900]/40 text-slate-500 hover:text-[#76B900] hover:bg-[#76B900]/5 rounded-lg transition-colors cursor-pointer"
                    title="Open specialized Clinical Workspace"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW FOR SYSTEM DATA SPECIFICATIONS */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Model Name</th>
                  <th className="py-3.5 px-4">Specialized Biological Task</th>
                  <th className="py-3.5 px-4">Modality</th>
                  <th className="py-3.5 px-4">Parameters</th>
                  <th className="py-3.5 px-4">Required GPU Node</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4 text-center">Inference Shortcuts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold">
                {filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50/85 transition-colors">
                    <td className="py-3 px-4 text-slate-950 font-black uppercase tracking-tight">
                      {model.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans font-medium">
                      {model.task}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        model.modality === 'PROTEINS' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                        model.modality === 'CHEMISTRY' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        model.modality === 'GENOMICS' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        'bg-cyan-50 border-cyan-200 text-cyan-700'
                      }`}>
                        {model.modality}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {model.parameters}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[9px]">
                      {model.gpuRequirement}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {model.latency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openPlayground(model)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#76B900]/10 border border-slate-200 hover:border-[#76B900]/30 text-slate-800 hover:text-slate-950 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 text-[#76B900] fill-[#76B900]" />
                          Quick Run
                        </button>
                        <button
                          onClick={() => onNavigate(model.workspaceId)}
                          className="p-1.5 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-300 cursor-pointer"
                          title="Open workspace"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK INFERENCE PLAYGROUND INTERACTIVE MODAL */}
      <AnimatePresence>
        {selectedPlaygroundModel && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              
              {/* Modal Header */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-zinc-800 text-[#76B900]">
                    {selectedPlaygroundModel.modality === 'PROTEINS' ? <Dna className="w-5 h-5" /> :
                     selectedPlaygroundModel.modality === 'CHEMISTRY' ? <Atom className="w-5 h-5" /> :
                     <Cpu className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">NIM INFERENCE SHUTTLE GATEWAY</span>
                    <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                      {selectedPlaygroundModel.name} Live Playground
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlaygroundModel(null)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* General Info and Requirements Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[10px] font-mono">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Biological Task</span>
                    <strong className="text-slate-900 block font-sans font-black uppercase text-[10.5px] mt-0.5">{selectedPlaygroundModel.task}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Accuracy Standard</span>
                    <strong className="text-slate-900 block font-sans font-bold text-[10.5px] mt-0.5 text-blue-600">{selectedPlaygroundModel.accuracyMetric}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Triton Cluster Node</span>
                    <strong className="text-emerald-600 block font-bold text-[10.5px] mt-0.5 uppercase">● {selectedPlaygroundModel.gpuRequirement}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Interactive Inputs & Play Trigger */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                        {selectedPlaygroundModel.inputLabel}
                      </label>
                      <textarea
                        rows={5}
                        value={playgroundInput}
                        onChange={(e) => setPlaygroundInput(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-900 font-bold focus:outline-none focus:border-[#76B900] leading-relaxed resize-none"
                        placeholder="Provide input chain/coordinates..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={executeInferencePlayground}
                        disabled={inferenceRunning}
                        className="flex-1 py-3 px-4 bg-[#76B900] hover:bg-[#66a000] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-black border border-[#76B900]/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#76B900]/10"
                      >
                        {inferenceRunning ? (
                          <>
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            Calculating on Triton... {inferenceProgress}%
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Launch Live Inference
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          onNavigate(selectedPlaygroundModel.workspaceId);
                          setSelectedPlaygroundModel(null);
                        }}
                        className="py-3 px-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        Open Workspace
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Developer Code Snip tab */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-[#05070a]">
                      <div className="bg-[#020305] px-3.5 py-2 flex items-center justify-between border-b border-zinc-900">
                        <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">NGC API Integration Code</span>
                        <button
                          onClick={() => handleCopySnippet(selectedPlaygroundModel.id, selectedPlaygroundModel.codeSnippet)}
                          className="text-[8px] font-mono font-black text-[#76B900] hover:text-[#88d600] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          {copiedSnippetId === selectedPlaygroundModel.id ? 'Copied!' : 'Copy Snippet'}
                        </button>
                      </div>
                      <pre className="p-3.5 font-mono text-[8px] text-zinc-300 overflow-x-auto leading-relaxed max-h-36">
                        <code>{selectedPlaygroundModel.codeSnippet}</code>
                      </pre>
                    </div>

                  </div>

                  {/* Right Column: Simulated Terminal Logs and Results */}
                  <div className="space-y-4">
                    
                    {/* Real-time Logger Terminal */}
                    <div className="bg-[#020305] border border-zinc-900 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">NIM Cluster Audit Trails</span>
                        <span className="text-[#76B900] text-[7.5px] font-mono font-black uppercase flex items-center gap-1">
                          <Terminal className="w-3 h-3" /> Live Telemetry
                        </span>
                      </div>
                      <div className="h-32 overflow-y-auto font-mono text-[8px] text-zinc-300 space-y-1 pr-1 select-none">
                        {inferenceLogs.length === 0 ? (
                          <span className="text-zinc-600 block italic">Trigger 'Launch Live Inference' to bind pipeline streams...</span>
                        ) : (
                          inferenceLogs.map((log, idx) => (
                            <div key={idx} className="leading-relaxed border-l border-zinc-800 pl-1.5">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Inference Results Output Container */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[160px] flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">Inference Output Payload</span>
                          {inferenceResult && (
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                              SUCCESS (SLA)
                            </span>
                          )}
                        </div>

                        {inferenceRunning ? (
                          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#76B900] animate-spin" />
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Computing tensor matrix arrays...</span>
                          </div>
                        ) : inferenceResult ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3 font-sans"
                          >
                            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                              {Object.entries(inferenceResult).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                                  <span className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <strong className="text-slate-900 block text-[9.5px] truncate mt-0.5">
                                    {value}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="py-8 text-center flex flex-col items-center justify-center">
                            <Database className="w-8 h-8 text-slate-350 stroke-[1.5] mb-2" />
                            <span className="text-[9.5px] font-semibold text-slate-400">Waiting for inference execution trigger...</span>
                          </div>
                        )}
                      </div>

                      {inferenceResult && (
                        <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[8px] font-mono font-bold text-slate-400">
                          <span>SLA Execution Latency: {selectedPlaygroundModel.latency}</span>
                          <button
                            onClick={() => {
                              toast.success('Output payload exported successfully', {
                                description: 'Wrote computed records to diagnostic logs.'
                              });
                            }}
                            className="text-[#76B900] hover:underline uppercase font-bold"
                          >
                            Export Output
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>NGC API Authorization: ACTIVE</span>
                <span className="flex items-center gap-1 text-[#76B900] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Accuracy Clinical Guardrails Online
                </span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
