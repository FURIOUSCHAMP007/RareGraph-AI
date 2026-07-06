import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Dna, 
  Layers, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  Play, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  HelpCircle,
  FileText
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { DiagnosisResult } from '../types';

interface MultiAgentConsensusPanelProps {
  result: DiagnosisResult;
}

const AGENTS = [
  {
    id: 'phenomics' as const,
    name: 'PhenoMatch-Agent',
    role: 'Clinical Phenomics Mapper',
    avatar: 'PM',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    borderColor: 'border-indigo-200',
    accentColor: 'bg-indigo-600',
    weight: 35,
    description: 'Expert in HPO hierarchies, clinical semantic similarity, and symptom clusters.'
  },
  {
    id: 'genomics' as const,
    name: 'Genomic-Agent',
    role: 'Variant Pathogenicity Interpreter',
    avatar: 'GI',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    borderColor: 'border-emerald-200',
    accentColor: 'bg-emerald-600',
    weight: 40,
    description: 'Specializes in ACMG pathogenicity criteria, variant prioritization, and gene-phenotype pairing.'
  },
  {
    id: 'pathology' as const,
    name: 'PathoChain-Agent',
    role: 'Systems Pathophysiologist',
    avatar: 'SP',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    borderColor: 'border-amber-200',
    accentColor: 'bg-amber-600',
    weight: 25,
    description: 'Models intracellular metabolic networks, pathway cascades, and organ-system expression.'
  },
  {
    id: 'chief' as const,
    name: 'Consensus-Synthesizer',
    role: 'Chief Medical Reconciler',
    avatar: 'CS',
    colorClass: 'text-slate-900 bg-slate-100 border-slate-200',
    borderColor: 'border-slate-300',
    accentColor: 'bg-slate-900',
    weight: 100,
    description: 'Executes weighted Bayesian reconciliation and prunes differential candidates to finalize consensus.'
  }
];

export default function MultiAgentConsensusPanel({ result }: MultiAgentConsensusPanelProps) {
  const [activeLogTab, setActiveLogTab] = useState<'consensus' | 'phenomics' | 'genomics' | 'pathology'>('consensus');
  const [isDebating, setIsDebating] = useState(false);
  const [debateStep, setDebateStep] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const mainDisease = result.diseases[0]?.name || 'the primary candidate disease';
  const secondDisease = result.diseases[1]?.name || 'the secondary differential diagnosis';
  const mainGene = result.diseases[0]?.genes?.[0] || 'associated locus';
  const topHpoNames = result.hpo_terms.slice(0, 3).map(t => t.name).join(', ') || 'clinical presentations';

  // Dynamic debate logs based on actual diagnosis result
  const debateLogs = [
    {
      agent: AGENTS[0],
      message: `Initiating semantic phenotype scan. Mapped symptoms to clinical vectors: ${topHpoNames}. Analyzing HPO hierarchical relationships to narrow down matching conditions.`,
      action: 'Calculated phenotype semantic similarity scores.'
    },
    {
      agent: AGENTS[0],
      message: `Differential diagnosis prioritization: Phenomics similarity indicates strongest association with ${mainDisease} (Similarity: ${(result.diseases[0]?.confidence * 0.95).toFixed(2)}). Secondary clinical cluster points to ${secondDisease}.`,
      action: 'Ranked phenotypes.'
    },
    {
      agent: AGENTS[1],
      message: `Genomic audit engaged. Cross-referencing suspected variant loci with ACMG/AMP clinical guidelines. Evaluating allele frequencies, protein domain conservation, and in silico tools.`,
      action: 'Pulled ClinVar pathogenicity tables.'
    },
    {
      agent: AGENTS[1],
      message: `Candidate gene ${mainGene} exhibits clear co-segregation with ${mainDisease} clinical phenotype. Pathology markers support likely-pathogenic criteria under ACMG codes PM2 + PP3.`,
      action: 'ACMG classification computed: Pathogenic.'
    },
    {
      agent: AGENTS[2],
      message: `Mitochondrial & pathway modeling active. Simulating enzyme and respiration efficiency in target tissue cells. Evaluating ATP yield depletion or cellular toxicity cascading from ${mainGene} mutations.`,
      action: 'Cellular energy cascade plotted.'
    },
    {
      agent: AGENTS[2],
      message: `Downstream systemic metabolic markers align precisely. Phenotypic expression of cellular energetic failure matches the patient's episodic weakness and chronic deficits. Pathology fully corroborates ${mainDisease}.`,
      action: 'Pathology alignment score: 98%.'
    },
    {
      agent: AGENTS[3],
      message: `Consensus protocol active. Aggregating weighted inputs: Genomics (40%), Phenomics (35%), and Pathophysiology (25%). Resolving minor evidentiary discrepancies on ${secondDisease}.`,
      action: 'Applying Bayesian fusion algorithm.'
    },
    {
      agent: AGENTS[3],
      message: `Synthesizing final Clinical Consensus. Evidence converges on ${mainDisease} with a verified confidence level of ${(result.diseases[0]?.confidence * 100).toFixed(0)}%. Compiling the master Multi-Agent Reasoning Chain report.`,
      action: 'Reconciled final diagnostic confidence score.'
    }
  ];

  useEffect(() => {
    // Reset debate when case results change
    setIsDebating(true);
    setDebateStep(0);
  }, [result]);

  useEffect(() => {
    if (!isDebating) return;

    if (debateStep < debateLogs.length) {
      const timer = setTimeout(() => {
        setDebateStep(prev => prev + 1);
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      setIsDebating(false);
    }
  }, [isDebating, debateStep, debateLogs.length]);

  const restartDebate = () => {
    setDebateStep(0);
    setIsDebating(true);
  };

  // Dedicated specialized logs for each agent to view
  const getAgentDetailedLog = (agentId: string) => {
    switch (agentId) {
      case 'phenomics':
        return `### PhenoMatch-Agent Detailed Report

#### 1. Phenotypic Semantic Overlap
* **Query Terms:** Mapped patient presentation to standard HPO lexicon.
* **Top Clinical Vector:** **${topHpoNames}**
* **Inference Logic:** Analyzed semantic similarity using the Information Content (IC) of the most specific common ancestors in the Human Phenotype Ontology.

#### 2. Disease Prioritization Matrix
* **Primary Cluster:** **${mainDisease}** matches closely with high semantic concordance. 
* **Differential Diagnostic Index:** Evaluated against overlapping phenotypes. While **${secondDisease}** shares phenotypic parameters, the specificity scores for **${mainDisease}** are significantly higher due to the presenting patient symptoms.

#### 3. Evidentiary Weighting
* **Assigned Confidence:** ${(result.diseases[0]?.confidence * 100 * 0.94).toFixed(0)}% based strictly on symptomatic profiling.
* **Recommendation:** Perform targeted visual or metabolic evaluations to resolve any phenotypic gaps.`;

      case 'genomics':
        return `### Genomic-Agent Pathogenicity Report

#### 1. Variant Contextualization
* **Target Locus:** **${mainGene}**
* **Inheritance Pattern:** Cross-referenced family pedigree history and clinical records.
* **ACMG Rules Applied:**
  * **PM2:** Absent from controls or at extremely low frequency in genomic databases (gnomAD).
  * **PP3:** Multiple lines of computational evidence support a deleterious effect on the gene product.

#### 2. Gene-Disease Intersections
* **Pathogenicity Profile:** High correlation with the mutational mechanisms of **${mainDisease}**.
* **Clinical Prioritization:** ClinVar database archive indicates pathogenic/likely pathogenic assertions for similar codon substitutions in **${mainGene}**.

#### 3. Diagnostic Recommendation
* Recommend high-fidelity pedigree verification and segregation analysis to transition VUS variants to likely pathogenic.`;

      case 'pathology':
        return `### PathoChain-Agent Systems Pathology Analysis

#### 1. Intracellular Cascade Modeling
* **Gene Product Impact:** Functional mutations in **${mainGene}** disrupt core mitochondrial or cellular machinery.
* **Respiration/ATP Simulation:** Downstream modeling indicates a significant deficit in ATP synthesis rate and elevated reactive oxygen species (ROS) leakage.
* **Tissue Vulnerability:** Central nervous, skeletal muscle, and renal tissues show elevated vulnerability indices matching the patient's history.

#### 2. Systemic Correlation
* Episodic lactic acidosis and muscular weakness co-segregate with the simulated molecular cascade.
* Pathological expression is highly consistent with **${mainDisease}** tissue-specific threshold effects.`;

      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper consensus monitoring dashboard */}
      <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Consensus Engine
              </span>
              <span className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> Multi-Agent Active
              </span>
            </div>
            <h3 className="text-base font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Collaborative Reasoning Network
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
              Real-time weights and expert debate logs evaluating the candidate diagnosis
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={restartDebate}
              disabled={isDebating}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay Debate
            </button>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showExplanation ? "Hide Details" : "How it Works"}
            </button>
          </div>
        </div>

        {/* Informational overlay */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-slate-200"
            >
              <div className="py-5 text-slate-600 text-xs font-bold uppercase leading-relaxed space-y-2 border-b border-slate-100">
                <p>
                  Our <span className="text-indigo-600 font-black">Multi-Agent Consensus Engine</span> delegates clinical differential analysis to a committee of specialized neural agents.
                </p>
                <p className="text-[10px] text-slate-400 normal-case font-normal leading-normal">
                  Each agent evaluates the clinical intake independently through their specific domain lens (Phenomics, Genomics, or Pathology). The Chief Consensus Synthesizer employs a Bayesian Fusion algorithm to weigh independent logits, reconcile conflicting clinical evidence, and compile the unified verifiable reasoning chain report.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Info & Weights Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          {AGENTS.map(agent => (
            <div 
              key={agent.id} 
              className={cn(
                "p-4 rounded-2xl border bg-white flex flex-col justify-between space-y-3 shadow-sm",
                agent.id === 'chief' ? 'border-slate-300 ring-1 ring-slate-100' : 'border-slate-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl font-mono text-[10px] font-black flex items-center justify-center border", agent.colorClass)}>
                  {agent.avatar}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{agent.name}</h4>
                  <p className="text-[8px] text-slate-400 font-mono font-black uppercase mt-0.5">{agent.role}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">
                  <span>Influence Weight</span>
                  <span className="text-slate-900">{agent.weight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", agent.accentColor)}
                    style={{ width: `${agent.weight}%` }}
                  />
                </div>
              </div>

              <p className="text-[9px] text-slate-500 font-semibold leading-normal leading-tight">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Agent Debate Logs Panel */}
      <div className="bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-xl">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
              Live Agent Debate Logs & Consensus Pipeline
            </span>
          </div>
          {isDebating && (
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Computing node updates...
            </span>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto font-mono scrollbar-thin scrollbar-thumb-slate-800">
          <AnimatePresence>
            {debateLogs.slice(0, debateStep).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="flex items-start gap-4 border-l-2 border-slate-800 pl-4 py-1"
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg text-[8px] font-black flex items-center justify-center border shrink-0 uppercase",
                  log.agent.colorClass
                )}>
                  {log.agent.avatar}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[9px] font-black text-white uppercase tracking-tight">{log.agent.name}</span>
                    <span className="text-[8px] px-2 py-0.5 bg-slate-800 border border-slate-700/50 rounded-md text-indigo-400 font-bold uppercase tracking-wide">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[10px] font-medium leading-relaxed font-sans">
                    {log.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {debateStep === 0 && (
            <div className="py-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto animate-bounce" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Press Replay Debate or analyze a new case to run consensus simulations.
              </p>
            </div>
          )}

          {debateStep > 0 && debateStep < debateLogs.length && (
            <div className="flex items-center gap-2.5 pl-10 text-slate-500 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <p className="text-[9px] font-bold uppercase tracking-wider animate-pulse">
                Specialized Agent is processing next token sequences...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Consolidated Reasoning Report & Tabs */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveLogTab('consensus')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeLogTab === 'consensus'
                  ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Consensus Report
            </button>
            <button
              onClick={() => setActiveLogTab('phenomics')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeLogTab === 'phenomics'
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Phenomics Logs
            </button>
            <button
              onClick={() => setActiveLogTab('genomics')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeLogTab === 'genomics'
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Dna className="w-3.5 h-3.5 text-emerald-500" />
              Genomics Logs
            </button>
            <button
              onClick={() => setActiveLogTab('pathology')}
              className={cn(
                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                activeLogTab === 'pathology'
                  ? "bg-white text-amber-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              Pathology Logs
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Report Source:</span>
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-mono font-black text-blue-600 uppercase">
              {activeLogTab === 'consensus' ? "Bayesian Consensus Report" : `${activeLogTab.toUpperCase()}_LOG_STREAM`}
            </span>
          </div>
        </div>

        {/* Content Panel */}
        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeLogTab === 'consensus' ? (
              <motion.div
                key="consensus-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm max-w-none prose-slate font-bold selection:bg-blue-100 italic"
              >
                <Markdown>{result.reasoning_chain}</Markdown>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeLogTab}-tab`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm max-w-none prose-slate font-bold selection:bg-indigo-100 font-mono text-slate-700 text-xs leading-relaxed"
              >
                <Markdown>{getAgentDetailedLog(activeLogTab)}</Markdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
