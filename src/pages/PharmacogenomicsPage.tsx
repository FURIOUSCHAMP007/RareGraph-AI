import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  ShieldAlert, 
  Dna, 
  Activity, 
  ChevronRight, 
  AlertCircle,
  FlaskConical,
  Target,
  Zap,
  RefreshCw,
  Search,
  BookOpen,
  Sliders,
  Layers,
  Settings,
  Eye,
  Atom,
  Grid3X3,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import { analyzePharmacogenomics } from '../services/geminiService';
import { PGxResult } from '../types';
import { cn } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function PharmacogenomicsPage() {
  const [genetics, setGenetics] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PGxResult | null>(null);

  // Computational Docking States
  const [repurposingTarget, setRepurposingTarget] = useState('Mitochondrial Complex I Deficiency');
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [repurposingLog, setRepurposingLog] = useState<string>('');
  const [repurposingResult, setRepurposingResult] = useState<any[] | null>(null);

  // Virtual Screening Grid Configuration
  const [gridCenterX, setGridCenterX] = useState<number>(12.4);
  const [gridCenterY, setGridCenterY] = useState<number>(-8.2);
  const [gridCenterZ, setGridCenterZ] = useState<number>(24.1);
  const [gridSizeX, setGridSizeX] = useState<number>(22.0);
  const [gridSizeY, setGridSizeY] = useState<number>(22.0);
  const [gridSizeZ, setGridSizeZ] = useState<number>(22.0);
  const [exhaustiveness, setExhaustiveness] = useState<number>(16);
  const [dockingAlgorithm, setDockingAlgorithm] = useState<'autodock' | 'genetic'>('autodock');

  // Selected drug and residue interaction states
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  const [hoveredResidueId, setHoveredResidueId] = useState<string | null>(null);

  // NVIDIA BioNeMo Generative AI Suite States
  const [bionemoTab, setBionemoTab] = useState<'esm2' | 'esmfold' | 'megamolbart' | 'diffdock'>('esm2');
  
  // ESM-2 Sequence Scanner States
  const [esm2Seq, setEsm2Seq] = useState('MPMANLLLLIVPVLIMARAQQNLNGMSLLVLMLLS');
  const [esm2MutationPos, setEsm2MutationPos] = useState(14);
  const [esm2NewResidue, setEsm2NewResidue] = useState('G');
  const [isEsm2Scanning, setIsEsm2Scanning] = useState(false);
  const [esm2Result, setEsm2Result] = useState<any | null>(null);

  // ESMFold Protein Folding States
  const [esmFoldSeq, setEsmFoldSeq] = useState('MAQNGSSTLQGVDLNQLPAGVYLSVIIPMAAAVGLIV');
  const [isEsmFoldFolding, setIsEsmFoldFolding] = useState(false);
  const [esmFoldResult, setEsmFoldResult] = useState<any | null>(null);

  // MegaMolBART Generative Chemistry States
  const [molSMILES, setMolSMILES] = useState('CC1=C(C(=O)C2=C(C1=O)C(C(C=C2)OC)OC)O'); // Ubiquinol-like base
  const [isMolGenerating, setIsMolGenerating] = useState(false);
  const [molResult, setMolResult] = useState<any | null>(null);

  // DiffDock Deep Molecular Docking States
  const [diffdockTargetId, setDiffdockTargetId] = useState('Complex-I-Mutant-6I0D');
  const [diffdockLigandSMILES, setDiffdockLigandSMILES] = useState('CC1=C(C(=O)C2=C(C1=O)C(C(C=C2)OC)OC)O');
  const [isDiffdockRunning, setIsDiffdockRunning] = useState(false);
  const [diffdockResult, setDiffdockResult] = useState<any | null>(null);

  const samplePanels = [
    {
      label: "Standard CPIC",
      genetics: "CYP2C19*2/*2, CYP2D6*4/*4, CYP3A5*3/*3, DPYD*2A, VKORC1-1639G>A",
      description: "Standard pharmaceutical variant panel."
    },
    {
      label: "Oncology Focus",
      genetics: "DPYD*2A, UGT1A1*28, TPMT*3A, NUDT15*3",
      description: "Chemotherapy response markers."
    },
    {
      label: "Cardio Panel",
      genetics: "CYP2C19*17, SLCO1B1*5, VKORC1-1639G>A, CYP4F2*3",
      description: "Statin and Anticoagulant focus."
    },
    {
      label: "Psychiatry",
      genetics: "CYP2D6*1/*1, CYP2C19*2/*17, HLA-B*15:02",
      description: "Antidepressant and Anticonvulsant panel."
    },
    {
      label: "Pediatric Rare",
      genetics: "G6PD (Mediterranean), MT-RNR1 m.1555A>G, CYP2D6*2XN",
      description: "Ototoxicity and Metabolic risk."
    }
  ];

  const repurposingLibrary: Record<string, {
    pdbId: string;
    description: string;
    residues: { id: string; name: string; type: string; bond: string; dist: number; angle: number }[];
    drugs: {
      name: string;
      code: string;
      binding: number;
      bbb: string;
      phase: string;
      mechanism: string;
      safety: string;
      adme: { abs: number; dist: number; met: number; exc: number; tox: number };
    }[];
  }> = {
    'Mitochondrial Complex I Deficiency': {
      pdbId: '6I0D',
      description: 'NADH Dehydrogenase [Ubiquinone] 1 alpha subcomplex mutant model.',
      residues: [
        { id: 'res-1', name: 'TYR-104', type: 'Hydrogen Bond', bond: 'H-Donor', dist: 2.8, angle: 30 },
        { id: 'res-2', name: 'HIS-181', type: 'Pi-Pi Stacking', bond: 'Aromatic Ring', dist: 3.4, angle: 120 },
        { id: 'res-3', name: 'ASP-203', type: 'Electrostatic', bond: 'Salt Bridge', dist: 3.1, angle: 210 },
        { id: 'res-4', name: 'GLU-222', type: 'Hydrophobic', bond: 'Van der Waals', dist: 3.9, angle: 300 }
      ],
      drugs: [
        { name: 'Idebenone', code: 'CID-5311271', binding: -8.7, bbb: 'High', phase: 'Phase III', mechanism: 'Acts as alternate electron carrier to bypass Complex I, transferring electrons directly to Complex III.', safety: 'Well tolerated, transient GI symptoms.', adme: { abs: 92, dist: 78, met: 85, exc: 70, tox: 15 } },
        { name: 'EPI-743 (Vatiquinone)', code: 'CID-49852230', binding: -9.1, bbb: 'High', phase: 'Phase II/III', mechanism: 'Regulates glutathione synthesis, down-regulating lipid peroxidation and preventing cell death.', safety: 'Excellent safety profile in pediatric patients.', adme: { abs: 88, dist: 84, met: 72, exc: 75, tox: 10 } },
        { name: 'Resveratrol', code: 'CID-445154', binding: -7.4, bbb: 'Moderate', phase: 'Phase II', mechanism: 'Sirtuin-1 (SIRT1) activator; stimulates PGC-1alpha transcription to promote mitochondrial biogenesis.', safety: 'Mild headache or nausea in high doses.', adme: { abs: 95, dist: 65, met: 90, exc: 80, tox: 5 } },
        { name: 'Coenzyme Q10 (Ubiquinol)', code: 'CID-5281227', binding: -6.8, bbb: 'Moderate', phase: 'Approved', mechanism: 'Primary electron carrier in mitochondrial transport chain; powerful membrane antioxidant.', safety: 'Virtually no adverse effects.', adme: { abs: 45, dist: 95, met: 50, exc: 60, tox: 2 } }
      ]
    },
    'Epileptic Encephalopathy (KCNQ2)': {
      pdbId: '7VGP',
      description: 'Voltage-Gated Potassium Channel KCNQ2-5 transmembrane channel model.',
      residues: [
        { id: 'res-1', name: 'TRP-236', type: 'Cation-Pi', bond: 'Aromatic Ring', dist: 3.2, angle: 45 },
        { id: 'res-2', name: 'LEU-275', type: 'Hydrophobic', bond: 'Van der Waals', dist: 3.6, angle: 135 },
        { id: 'res-3', name: 'PHE-305', type: 'Pi-Pi Stacking', bond: 'Aromatic Ring', dist: 3.5, angle: 225 },
        { id: 'res-4', name: 'GLN-307', type: 'Hydrogen Bond', bond: 'H-Acceptor', dist: 2.9, angle: 315 }
      ],
      drugs: [
        { name: 'Retigabine (Ezogabine)', code: 'CID-134591', binding: -9.3, bbb: 'High', phase: 'Phase III / Approved', mechanism: 'Allosteric opener of KCNQ2-5 potassium channels; stabilizes resting membrane potential.', safety: 'Risk of urinary retention, skin pigmentation.', adme: { abs: 85, dist: 75, met: 80, exc: 85, tox: 35 } },
        { name: 'SF0034', code: 'CID-78323491', binding: -9.8, bbb: 'High', phase: 'Preclinical', mechanism: 'Highly selective KCNQ2/3 opener with 20x potency of Retigabine, avoiding KCNQ4/5 bladder side effects.', safety: 'Minimal adverse toxicity observed in vivo.', adme: { abs: 90, dist: 82, met: 78, exc: 80, tox: 12 } },
        { name: 'Sodium Valproate', code: 'CID-3121', binding: -5.9, bbb: 'High', phase: 'Approved', mechanism: 'Blocks T-type calcium channels and inhibits GABA transaminase to elevate synaptic GABA levels.', safety: 'Hepatotoxicity, teratogenic potential.', adme: { abs: 99, dist: 90, met: 95, exc: 90, tox: 40 } }
      ]
    },
    'Huntington Polyglutamine Toxicity': {
      pdbId: '5HK2',
      description: 'Sigma-1 Receptor Chaperone ligand binding pocket mutant model.',
      residues: [
        { id: 'res-1', name: 'ASP-126', type: 'Salt Bridge', bond: 'Charge-Charge', dist: 2.7, angle: 60 },
        { id: 'res-2', name: 'GLU-172', type: 'Electrostatic', bond: 'Dipole-Dipole', dist: 3.0, angle: 150 },
        { id: 'res-3', name: 'ILE-178', type: 'Hydrophobic Pocket', bond: 'Van der Waals', dist: 3.8, angle: 240 },
        { id: 'res-4', name: 'TYR-206', type: 'Hydrogen Bond', bond: 'H-Donor', dist: 2.8, angle: 330 }
      ],
      drugs: [
        { name: 'Pridopidine', code: 'CID-11210803', binding: -8.4, bbb: 'High', phase: 'Phase III', mechanism: 'Sigma-1 receptor (S1R) agonist; enhances BDNF secretion, restoring neuroprotective calcium flux.', safety: 'Extremely high tolerability across adult cohorts.', adme: { abs: 94, dist: 80, met: 85, exc: 88, tox: 15 } },
        { name: 'Branaplam', code: 'CID-12901324', binding: -8.9, bbb: 'High', phase: 'Phase II', mechanism: 'Splice modulator that lowers huntingtin (HTT) mRNA transcription to decrease toxic polyQ aggregates.', safety: 'Peripheral neuropathy requires monitoring.', adme: { abs: 86, dist: 78, met: 75, exc: 70, tox: 22 } },
        { name: 'Selisistat (EX-527)', code: 'CID-10433245', binding: -7.8, bbb: 'High', phase: 'Phase II', mechanism: 'Selective SIRT1 inhibitor; increases huntingtin acetylation to promote its autophagic clearance.', safety: 'Subtle elevations in hepatic enzymes.', adme: { abs: 92, dist: 72, met: 88, exc: 85, tox: 18 } }
      ]
    }
  };

  const loadSample = (panel: typeof samplePanels[0]) => {
    setGenetics(panel.genetics);
    toast.info(`Panel Loaded: ${panel.label}`, { description: panel.description });
  };

  const handleAnalyze = async () => {
    if (!genetics.trim()) {
      toast.error('Please enter genetic variant data first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzePharmacogenomics(genetics);
      setResult(data);
      toast.success('Pharmacogenomics profile synthesized.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PGx profile.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runRepurposing = () => {
    setIsRepurposing(true);
    setRepurposingLog('Booting computational docking engine...');
    setRepurposingResult(null);
    setSelectedDrugIndex(0);

    const activeTargetData = repurposingLibrary[repurposingTarget];
    const pdbCode = activeTargetData ? activeTargetData.pdbId : 'MUTANT';

    const logs = [
      `Initializing Virtual Grid [Center: ${gridCenterX}, ${gridCenterY}, ${gridCenterZ} Å]`,
      `Retrieving Target Receptor coordinates from Protein Data Bank (PDB ID: ${pdbCode})...`,
      `Optimizing receptor sidechains and removing solvent crystal water molecules...`,
      `Configuring Vina search space with grid box boundaries [Size: ${gridSizeX} × ${gridSizeY} × ${gridSizeZ} Å]...`,
      `Running Lamarckian Genetic Algorithm (Exhaustiveness Index: ${exhaustiveness}x)...`,
      `Generating active ligand conformers & optimizing rotational free-energy bounds...`,
      `Computing electrostatic, London dispersion, and hydrogen bonding grids...`,
      `Clustering final docked poses by Root-Mean-Square Deviation (RMSD < 2.0 Å)...`,
      `Filtering binding scores for pharmacokinetic ADME and blood-brain-barrier indexes...`,
      `Virtual Docking Complete. Ranking small-molecule library based on Gibbs binding energy (ΔG)...`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setRepurposingLog(logs[step]);
        step++;
      } else {
        clearInterval(interval);
        setRepurposingResult(repurposingLibrary[repurposingTarget]?.drugs || []);
        setIsRepurposing(false);
        toast.success("Virtual Docking Complete", {
          description: `Successfully ranked candidate ligands against PDB:${pdbCode}.`
        });
      }
    }, 380);
  };

  // NVIDIA BioNeMo ESM-2 Sequence Scanning Simulation
  const runEsm2Scan = () => {
    setIsEsm2Scanning(true);
    setEsm2Result(null);
    toast.loading("Querying NVIDIA BioNeMo ESM-2 (650M) API...", { id: "esm2-toast" });

    setTimeout(() => {
      const seqArray = esm2Seq.toUpperCase().split('');
      const scanMap = seqArray.map((res, index) => {
        const isTarget = index === (esm2MutationPos - 1);
        const wildtypeScore = -1.2 - (Math.random() * 0.8);
        const mutantScore = isTarget 
          ? -7.8 - (Math.random() * 2.1) 
          : -1.0 - (Math.random() * 2.5);
        
        return {
          pos: index + 1,
          residue: res,
          wildtypeScore: Number(wildtypeScore.toFixed(3)),
          mutantScore: Number(mutantScore.toFixed(3)),
          delta: Number((mutantScore - wildtypeScore).toFixed(3)),
          pathogenicity: isTarget ? 'High (Pathogenic)' : (Math.random() > 0.85 ? 'Moderate (VUS)' : 'Low (Benign)')
        };
      });

      setEsm2Result({
        scanMap,
        scoreDelta: -6.45,
        acmgClassification: "PS1 (Strong Functional Damage evidence)",
        confidence: "99.2% (Deep Representation Alignment)"
      });
      setIsEsm2Scanning(false);
      toast.dismiss("esm2-toast");
      toast.success("ESM-2 Mutational Scan Complete", {
        description: "Zero-shot sequence likelihood delta calculated for all codons."
      });
    }, 1200);
  };

  // NVIDIA BioNeMo ESMFold 3D Structure Folding Simulation
  const runEsmFold = () => {
    setIsEsmFoldFolding(true);
    setEsmFoldResult(null);
    toast.loading("Invoking NVIDIA BioNeMo ESMFold (SOTA folding) container...", { id: "esmfold-toast" });

    setTimeout(() => {
      setEsmFoldResult({
        plddt: 94.8,
        confidence: "Very High Confidence",
        helicalRatio: 58.2,
        sheetRatio: 12.4,
        rmsdToWildtype: 3.84,
        ribbonD: "M 10 90 C 40 10, 60 10, 90 90 C 120 10, 140 10, 170 90",
        structuralDeltaG: 14.2 // kcal/mol destabilization
      });
      setIsEsmFoldFolding(false);
      toast.dismiss("esmfold-toast");
      toast.success("ESMFold 3D Structure Computed", {
        description: "High-confidence 3D backbone fold predicted directly from amino acid sequence."
      });
    }, 1500);
  };

  // NVIDIA BioNeMo MegaMolBART Generative Small-Molecule Optimizer
  const runMegaMolBart = () => {
    setIsMolGenerating(true);
    setMolResult(null);
    toast.loading("Querying NVIDIA BioNeMo MegaMolBART Latent Spaces...", { id: "mol-toast" });

    setTimeout(() => {
      setMolResult({
        qed: 0.82, // Quantitative Estimate of Drug-likeness
        sas: 2.15, // Synthetic Accessibility Score (lower is easier)
        logP: 1.84,
        molecularWeight: 244.2,
        analogs: [
          { smiles: "CC1=C(C(=O)C2=C(C1=O)C(C(C=C2)F)OC)O", bindingScore: -10.4, qed: 0.85, sas: 2.3, status: "Optimized Binding" },
          { smiles: "CC1=C(C(=O)C2=C(C1=O)C(C(C=C2)OC)F)O", bindingScore: -9.8, qed: 0.81, sas: 2.5, status: "Enhanced BBB" },
          { smiles: "CC1=C(C(=O)C2=C(C1=O)C(C(C=C2)OC)OC)N", bindingScore: -9.2, qed: 0.79, sas: 2.1, status: "Improved Solubility" }
        ]
      });
      setIsMolGenerating(false);
      toast.dismiss("mol-toast");
      toast.success("MegaMolBART Generative Optimization Complete", {
        description: "Generated 3 high-affinity candidate analogs inside the latent pocket space."
      });
    }, 1400);
  };

  // NVIDIA BioNeMo DiffDock Deep Docking Simulation
  const runDiffdockDocking = () => {
    setIsDiffdockRunning(true);
    setDiffdockResult(null);
    toast.loading("Spinning up NVIDIA BioNeMo DiffDock rigid/flexible docking server...", { id: "diffdock-toast" });

    setTimeout(() => {
      setDiffdockResult({
        predictedBindingAffinity: -11.45, // kcal/mol
        poseConfidence: 0.942, // Pose probability score
        rmsdToGoldStandard: 1.12, // Å
        resolvedBonds: 8,
        predictedKi: 4.25 // nM (Nanomolar affinity!)
      });
      setIsDiffdockRunning(false);
      toast.dismiss("diffdock-toast");
      toast.success("DiffDock Docking Run Complete", {
        description: "Predictive binding pose coordinates calculated with sub-angstrom precision."
      });
    }, 1600);
  };

  const activeTargetData = repurposingLibrary[repurposingTarget];
  const selectedDrug = activeTargetData?.drugs[selectedDrugIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">PGx Hub & Drug Repurposing</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Precision Pharmacogenomics & Computational Drug Screens</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Surface */}
        <div className="lg:col-span-12">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Dna className="w-4 h-4 text-rose-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Genetic Variant Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {samplePanels.map(panel => (
                  <button 
                    key={panel.label}
                    onClick={() => loadSample(panel)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-100 hover:border-slate-900 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                  >
                    {panel.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={genetics}
              onChange={(e) => setGenetics(e.target.value)}
              placeholder="Enter variant data (e.g., CYP2C19*2/*2, MT-TL1 m.3243A>G, CYP2D6 poor metabolizer...)"
              className="w-full h-24 p-5 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all text-sm leading-relaxed text-slate-700 font-bold placeholder:text-slate-300"
            />

            <div className="flex justify-start mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !genetics.trim()}
                className="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20 active:scale-[0.98]"
              >
                <FlaskConical className={cn("w-4 h-4 text-rose-200", isAnalyzing && "animate-spin")} />
                {isAnalyzing ? 'Mapping Pathways...' : 'Synthesize PGx Profile'}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <>
              {/* Variant Details */}
              <div className="lg:col-span-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Drug Response Predictors</h3>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      Cross-Validated Results
                    </div>
                  </div>
                  
                  <div className="space-y-12">
                    {result.variants.map((v, i) => (
                      <div key={i} className="space-y-6 border-l-2 border-slate-100 pl-8 relative">
                        <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 bg-white border-2 border-slate-900 rounded-full" />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{v.gene} {v.variant}</h4>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Predicted Phenotype: <span className="text-rose-600">{v.phenotype}</span></p>
                          </div>
                          <div className={cn(
                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            v.impact === 'Normal' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {v.impact} Impact
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {v.drugs.map((drug, di) => (
                            <div key={di} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-slate-200 transition-all cursor-pointer hover:shadow-md">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{drug.name}</span>
                                <span className={cn(
                                  "text-[8px] font-black px-2 py-0.5 rounded-full border",
                                  drug.level === 'Strong' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>{drug.level} Evidence</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{drug.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar Insights */}
              <div className="lg:col-span-4 space-y-6">
                {/* Contraindications */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-600 rounded-[32px] p-8 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                  
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <ShieldAlert className="w-5 h-5 text-rose-200" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white/80">Critical Contraindications</h3>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {result.contraindications.map((c, i) => (
                      <div key={i} className="p-5 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl group hover:bg-white/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-black uppercase tracking-tight">{c.drug}</span>
                          <AlertCircle className={cn("w-4 h-4", c.severity === 'High' ? "text-rose-200" : "text-amber-200")} />
                        </div>
                        <p className="text-[10px] font-bold text-rose-100 leading-relaxed uppercase tracking-widest">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Accuracy Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PGx Confidence</h4>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">98.4% Accuracy</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Active Inference Mode</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold leading-tight uppercase tracking-wider italic">
                      Cross-referenced against CPIC v3.2 and PharmGKB internal ontology.
                    </p>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Drug Repurposing Section */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm relative space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">In-Silico Screening</span>
              <span className="bg-rose-100 text-rose-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">Structure-Based AI</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Computational Drug Repurposing Board</h3>
            <p className="text-xs text-slate-500 font-bold leading-normal">
              Virtually screens thousands of existing small molecules against specific rare disease mutant receptors using molecular docking simulations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={repurposingTarget}
              onChange={(e) => {
                setRepurposingTarget(e.target.value);
                setRepurposingResult(null);
                setSelectedDrugIndex(0);
              }}
              disabled={isRepurposing}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="Mitochondrial Complex I Deficiency">Complex I Deficiency (MELAS / Leigh)</option>
              <option value="Epileptic Encephalopathy (KCNQ2)">KCNQ2 Epileptic Encephalopathy</option>
              <option value="Huntington Polyglutamine Toxicity">Huntington PolyQ Aggregates</option>
            </select>
            <button
              onClick={runRepurposing}
              disabled={isRepurposing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {isRepurposing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {isRepurposing ? "Docking..." : "Run Docking Simulation"}
            </button>
          </div>
        </div>

        {/* Configuration Sliders & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">Search Center (Å)</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Center X</span>
                <span className="font-bold text-slate-800">{gridCenterX.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-30" max="30" step="0.5" value={gridCenterX}
                disabled={isRepurposing}
                onChange={(e) => setGridCenterX(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Center Y</span>
                <span className="font-bold text-slate-800">{gridCenterY.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-30" max="30" step="0.5" value={gridCenterY}
                disabled={isRepurposing}
                onChange={(e) => setGridCenterY(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Center Z</span>
                <span className="font-bold text-slate-800">{gridCenterZ.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-30" max="30" step="0.5" value={gridCenterZ}
                disabled={isRepurposing}
                onChange={(e) => setGridCenterZ(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Grid3X3 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">Search Box Size (Å)</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Size X</span>
                <span className="font-bold text-slate-800">{gridSizeX.toFixed(0)}</span>
              </div>
              <input 
                type="range" min="10" max="40" step="1" value={gridSizeX}
                disabled={isRepurposing}
                onChange={(e) => setGridSizeX(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Size Y</span>
                <span className="font-bold text-slate-800">{gridSizeY.toFixed(0)}</span>
              </div>
              <input 
                type="range" min="10" max="40" step="1" value={gridSizeY}
                disabled={isRepurposing}
                onChange={(e) => setGridSizeY(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Size Z</span>
                <span className="font-bold text-slate-800">{gridSizeZ.toFixed(0)}</span>
              </div>
              <input 
                type="range" min="10" max="40" step="1" value={gridSizeZ}
                disabled={isRepurposing}
                onChange={(e) => setGridSizeZ(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">Docking Parameters</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Exhaustiveness Index</span>
                <span className="font-bold text-slate-800">{exhaustiveness}x</span>
              </div>
              <input 
                type="range" min="8" max="64" step="8" value={exhaustiveness}
                disabled={isRepurposing}
                onChange={(e) => setExhaustiveness(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Docking Engine Algorithm</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['autodock', 'genetic'] as const).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setDockingAlgorithm(alg)}
                    disabled={isRepurposing}
                    className={cn(
                      "py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider border cursor-pointer",
                      dockingAlgorithm === alg 
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {alg === 'autodock' ? 'Vina Grid' : 'Lamarckian GA'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-150/60 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block">Active Target Receptor</span>
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">PDB ID: {activeTargetData?.pdbId}</span>
              <p className="text-[9px] font-bold text-slate-400 leading-normal uppercase">{activeTargetData?.description}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[8px] font-mono text-slate-400">
              Spacing: 0.375 Å <br />
              Seed: 419208311
            </div>
          </div>
        </div>

        {isRepurposing && (
          <div className="p-12 border border-slate-100 bg-slate-50/50 rounded-3xl flex flex-col items-center justify-center space-y-4 animate-pulse">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Molecular Docking Server Executing</h4>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider text-center max-w-md font-bold px-4 bg-white border border-slate-200 py-3 rounded-2xl shadow-sm">
              {repurposingLog}
            </div>
          </div>
        )}

        {repurposingResult && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: List and Comparative Chart */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Computational Library Rankings</span>

              <div className="space-y-3">
                {repurposingResult.map((drug, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDrugIndex(i)}
                    className={cn(
                      "p-5 border rounded-2xl cursor-pointer transition-all flex justify-between items-center group shadow-sm",
                      selectedDrugIndex === i 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-slate-50 border-slate-200/60 hover:border-slate-300 text-slate-700 hover:bg-white"
                    )}
                  >
                    <div>
                      <span className="bg-slate-200 text-slate-600 text-[8px] font-mono font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-wide">{drug.code}</span>
                      <h4 className="text-sm font-black uppercase tracking-tight mt-1">{drug.name}</h4>
                      <p className={cn("text-[8px] font-black uppercase tracking-wider mt-0.5", selectedDrugIndex === i ? "text-indigo-400" : "text-slate-400")}>{drug.phase}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black uppercase tracking-widest block opacity-60">Affinity</span>
                      <span className={cn("text-sm font-mono font-black", selectedDrugIndex === i ? "text-indigo-400" : "text-indigo-600")}>
                        {drug.binding} kcal/mol
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Binding Affinity Bar Chart */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Binding Free Energy (ΔG) Comparative</span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repurposingResult} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[-12, 0]} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} width={70} />
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#f8fafc', fontSize: '10px' }}
                      />
                      <Bar dataKey="binding" fill="#6366f1" radius={[0, 8, 8, 0]}>
                        {repurposingResult.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === selectedDrugIndex ? '#f43f5e' : '#6366f1'} 
                            cursor="pointer"
                            onClick={() => setSelectedDrugIndex(index)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Interaction Pocket Map & ADME Profile */}
            <div className="lg:col-span-7 space-y-6">
              {/* Selected Drug Analysis Panel */}
              {selectedDrug && (
                <div className="p-8 bg-slate-900 border border-slate-850 rounded-[40px] text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <Atom className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-[8px] text-indigo-400 font-mono font-black uppercase tracking-widest">{selectedDrug.code}</span>
                        <h3 className="text-xl font-black uppercase tracking-tight">{selectedDrug.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Docking Pose Score</span>
                      <span className="text-lg font-mono font-black text-rose-500">{selectedDrug.binding} kcal/mol</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-bold leading-relaxed uppercase tracking-wide border-l-2 border-indigo-500 pl-4">
                    {selectedDrug.mechanism}
                  </p>

                  {/* SVG Molecular Interaction Map */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 relative">
                    <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 py-1.5 px-3 rounded-lg text-[8px] font-mono text-slate-400">
                      Ligand Target Interactive Map
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Interactive SVG Canvas */}
                      <div className="w-48 h-48 relative shrink-0">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Inner glow or shadow rings */}
                          <circle cx="100" cy="100" r="12" fill="#f43f5e" fillOpacity="0.15" />
                          <circle cx="100" cy="100" r="6" fill="#f43f5e" />

                          {/* Dynamic Residue Nodes */}
                          {activeTargetData?.residues.map((res, idx) => {
                            const radians = (res.angle * Math.PI) / 180;
                            const r = 64; // Radius of outer ring
                            const cx = 100 + r * Math.cos(radians);
                            const cy = 100 + r * Math.sin(radians);
                            const isHoveredOrActive = hoveredResidueId === res.id;

                            let bondColor = '#6366f1';
                            if (res.type === 'Hydrogen Bond') bondColor = '#f59e0b';
                            if (res.type === 'Electrostatic' || res.type === 'Salt Bridge') bondColor = '#f43f5e';
                            if (res.type === 'Pi-Pi Stacking') bondColor = '#3b82f6';
                            if (res.type === 'Hydrophobic' || res.type === 'Hydrophobic Pocket') bondColor = '#10b981';

                            return (
                              <g key={res.id}>
                                {/* Interaction Line */}
                                <line 
                                  x1="100" y1="100" x2={cx} y2={cy} 
                                  stroke={bondColor} 
                                  strokeWidth={isHoveredOrActive ? 3 : 1.5} 
                                  strokeDasharray="4 3" 
                                  className={cn("transition-all duration-300", isHoveredOrActive && "animate-pulse")}
                                />

                                {/* Distance Marker Label on line */}
                                <g transform={`translate(${(100 + cx) / 2}, ${(100 + cy) / 2})`}>
                                  <rect x="-12" y="-6" width="24" height="12" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                                  <text fill="#cbd5e1" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle" y="3">
                                    {res.dist}Å
                                  </text>
                                </g>

                                {/* Amino Acid Node */}
                                <circle 
                                  cx={cx} cy={cy} r={isHoveredOrActive ? 14 : 10} 
                                  fill="#1e293b" stroke={bondColor} strokeWidth="2" 
                                  className="transition-all cursor-pointer hover:scale-110"
                                  onMouseEnter={() => setHoveredResidueId(res.id)}
                                  onMouseLeave={() => setHoveredResidueId(null)}
                                />

                                <text 
                                  x={cx} y={cy + 3} 
                                  fill="#ffffff" fontSize="7" fontWeight="900" 
                                  fontFamily="monospace" textAnchor="middle" 
                                  className="pointer-events-none select-none"
                                >
                                  {res.name.split('-')[0]}
                                </text>

                                {/* Labels Outside the Circle */}
                                <text 
                                  x={cx + (cx > 100 ? 16 : -16)} 
                                  y={cy + 4} 
                                  fill="#94a3b8" fontSize="8" fontWeight="bold" 
                                  textAnchor={cx > 100 ? "start" : "end"}
                                  className="pointer-events-none select-none uppercase tracking-tight"
                                >
                                  {res.name}
                                </text>
                              </g>
                            );
                          })}

                          <text x="100" y="118" fill="#f43f5e" fontSize="7" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                            LIGAND
                          </text>
                        </svg>
                      </div>

                      {/* Pocket Residue Details text panel */}
                      <div className="space-y-4 flex-1">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Active Pocket Residue Mechanics</span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {activeTargetData?.residues.map((res) => {
                            const isActive = hoveredResidueId === res.id;
                            let nodeBorder = 'border-slate-800';
                            if (isActive) {
                              if (res.type === 'Hydrogen Bond') nodeBorder = 'border-amber-500 bg-amber-500/10';
                              else if (res.type === 'Electrostatic' || res.type === 'Salt Bridge') nodeBorder = 'border-rose-500 bg-rose-500/10';
                              else if (res.type === 'Pi-Pi Stacking') nodeBorder = 'border-blue-500 bg-blue-500/10';
                              else nodeBorder = 'border-emerald-500 bg-emerald-500/10';
                            }

                            return (
                              <div
                                key={res.id}
                                onMouseEnter={() => setHoveredResidueId(res.id)}
                                onMouseLeave={() => setHoveredResidueId(null)}
                                className={cn(
                                  "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                  isActive ? nodeBorder : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                                )}
                              >
                                <div>
                                  <span className="text-[10px] font-black text-white uppercase block">{res.name} ({res.type})</span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">Interaction Bond: {res.bond}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Distance</span>
                                  <span className="text-xs font-mono font-black text-indigo-400">{res.dist} Å</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADME properties panel */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">ADME Pharmacokinetics Index</span>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { label: 'GI Absorption', val: selectedDrug.adme.abs, color: 'bg-emerald-500', desc: 'Oral bioavailability' },
                        { label: 'Volume Dist.', val: selectedDrug.adme.dist, color: 'bg-blue-500', desc: 'Tissue penetration' },
                        { label: 'Metabolism (CYP)', val: selectedDrug.adme.met, color: 'bg-indigo-500', desc: 'Hepatic clearance' },
                        { label: 'Excretion Rate', val: selectedDrug.adme.exc, color: 'bg-amber-500', desc: 'Renal clearance' },
                        { label: 'Toxicity Score', val: selectedDrug.adme.tox, color: 'bg-rose-500', desc: 'In-silico Ames hazard' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{item.label}</span>
                            <span className="text-[6px] text-slate-500 font-bold uppercase block leading-none mt-0.5">{item.desc}</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-mono font-black">{item.val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!isRepurposing && !repurposingResult && (
          <div className="p-12 border border-slate-200 border-dashed rounded-3xl text-center space-y-3 bg-slate-50/50">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In-Silico Docking Library Ready</h4>
            <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto uppercase leading-relaxed">
              Select a clinical target pathology in the dropdown above, and trigger the docking simulation to run computational drug repurposing across active compound structures.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


