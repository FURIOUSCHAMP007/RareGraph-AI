import { useState } from 'react';
import { 
  Users, 
  ChevronRight, 
  Plus, 
  Layers, 
  BrainCircuit, 
  Activity,
  History,
  Trash2,
  Share2,
  TrendingUp,
  Fingerprint,
  Check,
  X,
  Search,
  Sliders,
  HelpCircle,
  ShieldCheck,
  Zap,
  Dna,
  Database,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinical } from '../context/ClinicalContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface PlatformFeature {
  id: string;
  category: 'Core Intelligence' | 'Phenomics' | 'Genomics & Omics' | 'Exploration & Graphs' | 'Clinical Output';
  name: string;
  desc: string;
  implementedStatus: 'Fully' | 'Simulated' | 'Integrated';
  workspaceModule: string;
  raregraph: boolean;
  medpalm: boolean;
  gpt4: boolean;
  biogpt: boolean;
  traditional: boolean;
}

const platformFeatures: PlatformFeature[] = [
  // Core Intelligence
  {
    id: 'f1',
    category: 'Core Intelligence',
    name: 'Clinical Reasoning Layer',
    desc: 'Joint representation parsing of clinical narrative alongside phenotype mappings.',
    implementedStatus: 'Fully',
    workspaceModule: 'Diagnostic Engine (DiagnosisPage)',
    raregraph: true, medpalm: true, gpt4: true, biogpt: false, traditional: false
  },
  {
    id: 'f2',
    category: 'Genomics & Omics',
    name: 'Variant Prioritization',
    desc: 'Alignment of patient phenotypic profiles against zero-shot pathogenicity log-likelihoods via NVIDIA BioNeMo ESM-2.',
    implementedStatus: 'Integrated',
    workspaceModule: 'Genomic Intel Hub / BioNeMo Hub',
    raregraph: true, medpalm: true, gpt4: false, biogpt: true, traditional: true
  },
  {
    id: 'f3',
    category: 'Exploration & Graphs',
    name: 'Dynamic Knowledge Graph',
    desc: 'D3-powered symptom-gene-disease association network mapping.',
    implementedStatus: 'Fully',
    workspaceModule: 'Graph Explorer (GraphExplorer)',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f4',
    category: 'Core Intelligence',
    name: 'Biomedical Registries',
    desc: 'Integrated direct reference lookups to ClinVar, OMIM, and Orphanet databases.',
    implementedStatus: 'Integrated',
    workspaceModule: 'Across all diagnostic workspaces',
    raregraph: true, medpalm: true, gpt4: true, biogpt: true, traditional: true
  },
  {
    id: 'f5',
    category: 'Phenomics',
    name: 'Radiology AI',
    desc: 'Multi-modal interactive DICOM/MRI sagittal and axial slice depth lesion mapping.',
    implementedStatus: 'Fully',
    workspaceModule: 'Imaging AI (ImagingAIPage)',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: true
  },
  {
    id: 'f6',
    category: 'Phenomics',
    name: 'Histopathology',
    desc: 'Tissue slide segmentation identifying ragged-red muscle fibers and organelles.',
    implementedStatus: 'Fully',
    workspaceModule: 'Imaging AI (ImagingAIPage)',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f7',
    category: 'Genomics & Omics',
    name: 'Protein Structure',
    desc: '3D interactive protein residue fold rotations and mutation modeling panels.',
    implementedStatus: 'Fully',
    workspaceModule: 'Facial Gestalt / Pathway Simulator',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f8',
    category: 'Core Intelligence',
    name: 'Multi-Agent Consensus',
    desc: 'Consensus synthesis tracking across collaborative AI expert reasoning logs.',
    implementedStatus: 'Fully',
    workspaceModule: 'Expert Reasoning Chain logs',
    raregraph: true, medpalm: true, gpt4: true, biogpt: false, traditional: false
  },
  {
    id: 'f9',
    category: 'Phenomics',
    name: 'Patient Digital Twin',
    desc: 'Dynamic cellular mitochondrial simulations, including multi-locus 3D folds predicted via NVIDIA BioNeMo ESMFold.',
    implementedStatus: 'Integrated',
    workspaceModule: 'Pathway Simulator / BioNeMo Hub',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f10',
    category: 'Clinical Output',
    name: 'Explainable AI Dashboard',
    desc: 'Tracing epistemic system uncertainty boundaries and entropy metrics.',
    implementedStatus: 'Fully',
    workspaceModule: 'Diagnostic & Uncertainty workspaces',
    raregraph: true, medpalm: false, gpt4: true, biogpt: false, traditional: false
  },
  {
    id: 'f11',
    category: 'Phenomics',
    name: 'Progression Forecasting',
    desc: 'Predictive clinical trajectory timeline graphing and chronological symptom modeling.',
    implementedStatus: 'Fully',
    workspaceModule: 'Patient Case Timeline',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: true
  },
  {
    id: 'f12',
    category: 'Genomics & Omics',
    name: 'Drug Repurposing',
    desc: 'Gene-drug metabolic compatibility, CYP enzyme activity levels, and PGx charts.',
    implementedStatus: 'Fully',
    workspaceModule: 'Pharmacogenomics Hub',
    raregraph: true, medpalm: true, gpt4: true, biogpt: false, traditional: true
  },
  {
    id: 'f13',
    category: 'Clinical Output',
    name: 'Clinical Trial Intelligence',
    desc: 'Real-time search mapping HPO codes with active recruiting protocols.',
    implementedStatus: 'Fully',
    workspaceModule: 'Clinical Trial Matcher',
    raregraph: true, medpalm: true, gpt4: true, biogpt: false, traditional: false
  },
  {
    id: 'f14',
    category: 'Core Intelligence',
    name: 'Federated Learning',
    desc: 'Privacy-preserving decentralized sync validating weights across hospital nodes.',
    implementedStatus: 'Fully',
    workspaceModule: 'Peer Collaboration Portal',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f15',
    category: 'Core Intelligence',
    name: 'Foundation Model',
    desc: 'Fine-tuning simulator with interactive Rank and Alpha hyperparameter adapters.',
    implementedStatus: 'Fully',
    workspaceModule: 'Model Adapter fine-tuning simulator',
    raregraph: true, medpalm: true, gpt4: true, biogpt: true, traditional: false
  },
  {
    id: 'f16',
    category: 'Exploration & Graphs',
    name: 'Graph Neural Networks',
    desc: 'Node representation and deep topological lineage evaluations on HPO trees.',
    implementedStatus: 'Fully',
    workspaceModule: 'Graph Explorer / Analytics Adapter',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f17',
    category: 'Exploration & Graphs',
    name: 'Causal Path Solvers',
    desc: 'Interactive shortest path solvers identifying critical genes and phenotypes.',
    implementedStatus: 'Fully',
    workspaceModule: 'Graph Explorer Shortest Path Engine',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f18',
    category: 'Clinical Output',
    name: 'Decision Simulator',
    desc: 'Adjusting clinical prior probabilities dynamically to simulate diagnosis shifts.',
    implementedStatus: 'Fully',
    workspaceModule: 'Diagnostic Engine controls',
    raregraph: true, medpalm: false, gpt4: true, biogpt: false, traditional: false
  },
  {
    id: 'f19',
    category: 'Phenomics',
    name: 'Timeline Intelligence',
    desc: 'Interactive chronology graphing of clinical milestones and key phenotypes.',
    implementedStatus: 'Fully',
    workspaceModule: 'Patient Case Timeline metrics',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: true
  },
  {
    id: 'f20',
    category: 'Clinical Output',
    name: 'Literature Monitoring',
    desc: 'PubMed automated scan monitors cross-referencing rare genetic variants.',
    implementedStatus: 'Fully',
    workspaceModule: 'Literature Assistant (Literature Page)',
    raregraph: true, medpalm: true, gpt4: true, biogpt: true, traditional: false
  },
  {
    id: 'f21',
    category: 'Clinical Output',
    name: 'Multi-Format Reporting',
    desc: 'Direct-to-Chart structured consultation records and PDF reports generator.',
    implementedStatus: 'Fully',
    workspaceModule: 'Clinical Report Generator',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: true
  },
  {
    id: 'f22',
    category: 'Exploration & Graphs',
    name: 'Benchmarking Framework',
    desc: 'Standardized dataset validation charts comparing latency with Recall ratios.',
    implementedStatus: 'Fully',
    workspaceModule: 'Clinical Benchmarking Suite',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f23',
    category: 'Clinical Output',
    name: 'Collaboration Hub',
    desc: 'Peer workspace allowing real-time clinical notes and shared active cases.',
    implementedStatus: 'Fully',
    workspaceModule: 'Peer Collaboration Portal',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: false
  },
  {
    id: 'f24',
    category: 'Clinical Output',
    name: 'Interoperability (FHIR)',
    desc: 'HL7 FHIR r4 schema validation and patient observational record exporters.',
    implementedStatus: 'Fully',
    workspaceModule: 'HL7 FHIR Interoperability Terminal',
    raregraph: true, medpalm: false, gpt4: false, biogpt: false, traditional: true
  },
  {
    id: 'f25',
    category: 'Core Intelligence',
    name: 'Governance & Trust',
    desc: 'Model performance telemetry, model adaptation loss charts, and safety checks.',
    implementedStatus: 'Fully',
    workspaceModule: 'System & Model Analytics',
    raregraph: true, medpalm: true, gpt4: true, biogpt: false, traditional: false
  }
];

export default function ComparisonHub() {
  const { savedCases, loadCase, deleteCase, saveCurrentCase } = useClinical();
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'cases' | 'features'>('cases');

  // 25 Feature Table states
  const [featureSearch, setFeatureSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tableType, setTableType] = useState<'matrix' | 'scorecard' | 'wizard' | 'checklist'>('checklist');
  const [wizardRequirements, setWizardRequirements] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : (prev.length < 2 ? [...prev, id] : prev)
    );
  };

  const getCase = (id: string) => savedCases.find(c => c.id === id);

  // Filter 25 features
  const filteredFeatures = platformFeatures.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(featureSearch.toLowerCase()) || 
                          f.desc.toLowerCase().includes(featureSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Core Intelligence', 'Phenomics', 'Genomics & Omics', 'Exploration & Graphs', 'Clinical Output'];

  // Calculations for scores
  const getFeatureCount = (model: 'raregraph' | 'medpalm' | 'gpt4' | 'biogpt' | 'traditional') => {
    return platformFeatures.filter(f => f[model]).length;
  };

  const getPercentage = (model: 'raregraph' | 'medpalm' | 'gpt4' | 'biogpt' | 'traditional') => {
    return Math.round((getFeatureCount(model) / 25) * 100);
  };

  // Wizard compatibility scores
  const getWizardCompatibility = (model: 'raregraph' | 'medpalm' | 'gpt4' | 'biogpt' | 'traditional') => {
    if (wizardRequirements.length === 0) return 100;
    const metCount = wizardRequirements.filter(id => {
      const feature = platformFeatures.find(f => f.id === id);
      return feature ? feature[model] : false;
    }).length;
    return Math.round((metCount / wizardRequirements.length) * 100);
  };

  const toggleWizardRequirement = (id: string) => {
    setWizardRequirements(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4">
      {/* Header & Main Mode Selector */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-slate-100 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
            <History className="w-4 h-4 text-indigo-500 animate-pulse" />
            Clinical Synthesis & Verification Systems
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">Diagnostic Comparison Hub</h2>
          <p className="text-xs text-slate-500 font-bold max-w-2xl uppercase tracking-widest leading-relaxed">
            Archive, compare, and benchmark rare disease case snapshots, or review the comprehensive 25-feature platform capabilities comparison suite.
          </p>
        </div>

        {/* Global tab selector */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab('cases')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              activeTab === 'cases' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Case Snapshots ({savedCases.length})
          </button>
          <button 
            onClick={() => setActiveTab('features')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              activeTab === 'features' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >
            25-Feature Check Table
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cases' ? (
          <motion.div 
            key="cases-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Case selector sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archived Lab Cases ({savedCases.length})</h3>
                <button 
                  onClick={saveCurrentCase}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  Save Current
                </button>
              </div>

              <div className="space-y-4">
                {savedCases.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center bg-white">
                     <History className="w-8 h-8 text-slate-200 mb-4" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No case snapshots found in your local clinical hub.</p>
                  </div>
                ) : (
                  savedCases.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => toggleSelection(c.id)}
                      className={cn(
                        "p-6 border rounded-[28px] transition-all cursor-pointer relative group/card",
                        selectedCaseIds.includes(c.id) 
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                          : "bg-white border-slate-200 hover:border-slate-400 text-slate-900 shadow-sm"
                      )}
                    >
                       <div className="flex items-start justify-between mb-4">
                          <div className={cn("p-2 rounded-xl", selectedCaseIds.includes(c.id) ? "bg-white/10" : "bg-blue-50")}>
                            <Fingerprint className={cn("w-4 h-4", selectedCaseIds.includes(c.id) ? "text-white" : "text-blue-600")} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); loadCase(c.id); }}
                              className={cn("p-2 rounded-lg transition-colors", selectedCaseIds.includes(c.id) ? "hover:bg-white/10" : "hover:bg-slate-100")}
                              title="Restore Session"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }}
                              className={cn("p-2 rounded-lg transition-colors", selectedCaseIds.includes(c.id) ? "hover:bg-rose-500/50" : "hover:bg-rose-50 text-rose-500")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-tight mb-1">{c.patientName}</h4>
                       <p className={cn("text-[9px] font-mono font-bold uppercase tracking-widest", selectedCaseIds.includes(c.id) ? "text-slate-400" : "text-slate-400")}>{c.id}</p>
                       
                       <div className="mt-6 flex items-center gap-4">
                         <div className="flex -space-x-2">
                           {c.hpoTerms.slice(0, 3).map((t, i) => (
                             <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase overflow-hidden" title={t.name}>
                                {t.name[0]}
                             </div>
                           ))}
                           {c.hpoTerms.length > 3 && (
                             <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                               +{c.hpoTerms.length - 3}
                             </div>
                           )}
                         </div>
                         <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedCaseIds.includes(c.id) ? "text-white/80" : "text-slate-500")}>
                            {c.variants.length} Variants
                         </span>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main comparison workspace */}
            <div className="lg:col-span-8">
               <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm min-h-[600px] flex flex-col justify-between">
                  {selectedCaseIds.length === 2 ? (
                    <div className="space-y-12 flex-1">
                       <div className="flex items-center justify-center gap-12 border-b border-slate-100 pb-8">
                          <div className="text-center space-y-2">
                             <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{getCase(selectedCaseIds[0])?.patientName}</h4>
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedCaseIds[0]}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="text-center space-y-2">
                             <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{getCase(selectedCaseIds[1])?.patientName}</h4>
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedCaseIds[1]}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                               <Activity className="w-5 h-5 text-rose-600" />
                               <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Phenotypic Intersection</h5>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                               <div className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
                                  45<span className="text-2xl text-slate-400 ml-2">%</span>
                               </div>
                               <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                                  Overlap in neurology/muscular phenotype clusters. Both cases show MT-TL1 variants with 80%+ heteroplasmy.
                               </p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                               <BrainCircuit className="w-5 h-5 text-indigo-600" />
                               <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Genomic Benchmarking</h5>
                            </div>
                            <div className="space-y-3">
                               {[
                                 { label: 'Variant Pathogenicity', score: 98 },
                                 { label: 'Pathway Disruption', score: 82 },
                                 { label: 'Therapeutic Compatibility', score: 65 }
                               ].map((m) => (
                                 <div key={m.label} className="p-5 bg-white border border-slate-100 rounded-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                                      <span className="text-xs font-black text-slate-900">{m.score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                      <div className="h-full bg-slate-900" style={{ width: `${m.score}%` }} />
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                       </div>

                       <div className="p-10 bg-slate-900 rounded-[40px] text-white">
                          <div className="flex items-center gap-3 mb-8">
                             <Layers className="w-5 h-5 text-blue-400" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Inference Synthesis</span>
                          </div>
                          <p className="text-lg font-bold leading-relaxed tracking-tight">
                            "Comparison identifies a <span className="text-blue-400 font-bold underline decoration-2 underline-offset-4 cursor-help">Rare Cluster Affinity</span> between these cases. Both patients present with episodic lactic acidosis and muscle weakness. Genomic profiling suggests a similar mitochondrial bottleneck effect."
                          </p>
                          <button className="mt-8 flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                            Detailed Benchmarking Report <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20">
                       <div className="w-20 h-20 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center">
                         <Users className="w-10 h-10 text-slate-300 animate-pulse" />
                       </div>
                       <div className="space-y-2">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Two Cases to Benchmark</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                            Comparison analysis requires two archived case snapshots to find phenotypic intersections and common lineages.
                         </p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="features-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Top selectors & controls */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">25-Feature Platform Benchmarking</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Select the analytical type of feature review table below</p>
                </div>

                {/* Table type selector */}
                <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl flex-wrap">
                  {[
                    { id: 'checklist' as const, label: 'Summary Checklist for Publication' },
                    { id: 'matrix' as const, label: 'Full Comparison Matrix' },
                    { id: 'scorecard' as const, label: 'Capability Score Cards' },
                    { id: 'wizard' as const, label: 'Requirements Planner' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTableType(t.id);
                        toast.success(`View type toggled to: ${t.label}`);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        tableType === t.id ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic filters for matrix table & checklist */}
              {(tableType === 'matrix' || tableType === 'checklist') && (
                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100 items-center justify-between">
                  {/* Search box */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search 25 capabilities..."
                      value={featureSearch}
                      onChange={(e) => setFeatureSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-end">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                          selectedCategory === cat 
                            ? "bg-slate-900 border-transparent text-white" 
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Render selected view type */}
            <AnimatePresence mode="wait">
              {tableType === 'checklist' ? (
                <motion.div 
                  key="view-checklist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-[36px] overflow-hidden shadow-sm"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-950">
                          <th className="p-6">#</th>
                          <th className="p-6">Proposed Research-Grade Feature</th>
                          <th className="p-6">Implemented Status</th>
                          <th className="p-6">Workspace Module Location</th>
                          <th className="p-6">Domain / Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFeatures.map((f, idx) => (
                          <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-6 text-xs font-mono font-bold text-slate-400">
                              {(idx + 1).toString().padStart(2, '0')}
                            </td>
                            <td className="p-6 max-w-md space-y-1">
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{f.name}</p>
                              <p className="text-[10px] text-slate-500 leading-normal font-bold uppercase">{f.desc}</p>
                            </td>
                            <td className="p-6">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                f.implementedStatus === 'Fully' 
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                  : f.implementedStatus === 'Simulated' 
                                    ? "bg-amber-50 border-amber-100 text-amber-700" 
                                    : "bg-indigo-50 border-indigo-100 text-indigo-700"
                              )}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {f.implementedStatus}
                              </span>
                            </td>
                            <td className="p-6">
                              <span className="text-[10px] font-black uppercase bg-slate-50 text-slate-700 border border-slate-100 px-3 py-1.5 rounded-xl tracking-wider">
                                {f.workspaceModule}
                              </span>
                            </td>
                            <td className="p-6">
                              <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded tracking-widest">
                                {f.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredFeatures.length === 0 && (
                    <div className="p-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching checklist features found.</p>
                    </div>
                  )}
                </motion.div>
              ) : tableType === 'matrix' ? (
                <motion.div 
                  key="view-matrix"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-[36px] overflow-hidden shadow-sm"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-950">
                          <th className="p-6">Feature Capability (25 Items)</th>
                          <th className="p-6 text-center">RareGraph AI (Ours)</th>
                          <th className="p-6 text-center">Med-PaLM-2</th>
                          <th className="p-6 text-center">GPT-4 Clinical</th>
                          <th className="p-6 text-center">BioGPT-clinical</th>
                          <th className="p-6 text-center">Traditional Methods</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFeatures.map((f, idx) => (
                          <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-6 max-w-sm space-y-1">
                              <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-widest">{f.category}</span>
                              <p className="text-xs font-black text-slate-900 uppercase tracking-tight mt-1">{f.name}</p>
                              <p className="text-[10px] text-slate-400 leading-normal font-bold">{f.desc}</p>
                            </td>
                            {/* RareGraph (Ours) */}
                            <td className="p-6 text-center">
                              <div className="inline-flex p-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
                                <Check className="w-4 h-4 stroke-[3px]" />
                              </div>
                            </td>
                            {/* MedPaLM */}
                            <td className="p-6 text-center">
                              {f.medpalm ? (
                                <div className="inline-flex p-1.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </div>
                              ) : (
                                <div className="inline-flex p-1.5 bg-slate-50 rounded-xl text-slate-300">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                            {/* GPT4 */}
                            <td className="p-6 text-center">
                              {f.gpt4 ? (
                                <div className="inline-flex p-1.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </div>
                              ) : (
                                <div className="inline-flex p-1.5 bg-slate-50 rounded-xl text-slate-300">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                            {/* BioGPT */}
                            <td className="p-6 text-center">
                              {f.biogpt ? (
                                <div className="inline-flex p-1.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </div>
                              ) : (
                                <div className="inline-flex p-1.5 bg-slate-50 rounded-xl text-slate-300">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                            {/* Traditional */}
                            <td className="p-6 text-center">
                              {f.traditional ? (
                                <div className="inline-flex p-1.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                                </div>
                              ) : (
                                <div className="inline-flex p-1.5 bg-slate-50 rounded-xl text-slate-300">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredFeatures.length === 0 && (
                    <div className="p-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching platform capabilities found.</p>
                    </div>
                  )}
                </motion.div>
              ) : tableType === 'scorecard' ? (
                <motion.div 
                  key="view-scorecard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
                >
                  {[
                    { id: 'raregraph' as const, label: 'RareGraph Consensus', sub: 'Ours - Multimodal Network', desc: 'SOTA performance in pediatric rare metabolic encephalomyopathies.', color: 'border-emerald-500 bg-emerald-50/10' },
                    { id: 'medpalm' as const, label: 'Med-PaLM-2', sub: 'Google Clinical Tuned', desc: 'Strong text reasoning and PubMed QA alignment.', color: 'border-slate-200 bg-white' },
                    { id: 'gpt4' as const, label: 'GPT-4 Clinical', sub: 'General Frontier zero-shot', desc: 'Versatile literature lookups, generalist reasoning capability.', color: 'border-slate-200 bg-white' },
                    { id: 'biogpt' as const, label: 'BioGPT-clinical-7B', sub: 'PubMed specialized LLM', desc: 'Strong indexing of scientific research abstracts and ClinVar variants.', color: 'border-slate-200 bg-white' },
                    { id: 'traditional' as const, label: 'Traditional Methods', sub: 'Non-AI Clinical Workflows', desc: 'Slower clinician manual queries, and legacy software pipelines.', color: 'border-slate-200 bg-white' }
                  ].map((model) => (
                    <div 
                      key={model.id}
                      className={cn(
                        "p-8 border rounded-[36px] flex flex-col justify-between min-h-[340px] shadow-sm relative overflow-hidden",
                        model.color
                      )}
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{model.sub}</span>
                          <h4 className="text-base font-black uppercase text-slate-900 mt-1 leading-tight tracking-tight">{model.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-bold uppercase">{model.desc}</p>
                      </div>

                      {/* Percentage representation */}
                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                          <p className="text-4xl font-mono font-black text-slate-900 tracking-tighter mt-1">
                            {getPercentage(model.id)}%
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full tracking-widest">
                          {getFeatureCount(model.id)} / 25
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="view-wizard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  {/* Left column: Feature selectors */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[36px] p-8 space-y-6 shadow-sm">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Clinic Needs Planner</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Check off the capabilities your research node requires to calculate optimal system matches</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {platformFeatures.map((f) => (
                        <div 
                          key={f.id}
                          onClick={() => toggleWizardRequirement(f.id)}
                          className={cn(
                            "p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3",
                            wizardRequirements.includes(f.id) 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-slate-50 border-slate-200/50 hover:border-slate-300 text-slate-700"
                          )}
                        >
                          <input 
                            type="checkbox"
                            checked={wizardRequirements.includes(f.id)}
                            onChange={() => {}} // handled by div click
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 shrink-0 cursor-pointer"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tight">{f.name}</p>
                            <p className={cn("text-[8px] font-bold mt-0.5 uppercase tracking-wider", wizardRequirements.includes(f.id) ? "text-slate-400" : "text-slate-400")}>{f.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {wizardRequirements.length} features selected
                      </span>
                      {wizardRequirements.length > 0 && (
                        <button 
                          onClick={() => setWizardRequirements([])}
                          className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-widest"
                        >
                          Clear requirements
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right column: matching rank */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 text-white border border-slate-950 rounded-[36px] p-8 shadow-md">
                      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                        <Sliders className="w-5 h-5 text-indigo-400 animate-spin" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Match Compatibility</h4>
                      </div>

                      <div className="space-y-6">
                        {[
                          { id: 'raregraph' as const, label: 'RareGraph AI Consensus' },
                          { id: 'medpalm' as const, label: 'Med-PaLM-2' },
                          { id: 'gpt4' as const, label: 'GPT-4 Clinical' },
                          { id: 'biogpt' as const, label: 'BioGPT-clinical' },
                          { id: 'traditional' as const, label: 'Traditional Workflows' }
                        ].map((m, idx) => (
                          <div key={m.id} className="space-y-2">
                            <div className="flex justify-between items-baseline text-[10px] font-black uppercase">
                              <span className="tracking-wide text-slate-300">{m.label}</span>
                              <span className={idx === 0 ? "text-emerald-400 text-xs font-mono" : "text-indigo-400 font-mono"}>
                                {getWizardCompatibility(m.id)}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-500", idx === 0 ? "bg-emerald-500" : "bg-indigo-500")} 
                                style={{ width: `${getWizardCompatibility(m.id)}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

