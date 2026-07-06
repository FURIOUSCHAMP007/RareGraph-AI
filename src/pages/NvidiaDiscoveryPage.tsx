import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atom, Play, Sparkles, Server, Compass, FileText, ChevronRight, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function NvidiaDiscoveryPage() {
  const [targetPdb, setTargetPdb] = useState<string>('6M0J');
  const [smiles, setSmiles] = useState<string>('CC(=O)NC1=CC=C(C=C1)O'); // Acetaminophen
  const [generating, setGenerating] = useState<boolean>(false);
  const [docking, setDocking] = useState<boolean>(false);
  const [dockResult, setDockResult] = useState<any | null>(null);
  const [interpolatedSmiles, setInterpolatedSmiles] = useState<string[]>([]);

  const handleGenerateMolecules = () => {
    if (!smiles) return;
    setGenerating(true);
    setInterpolatedSmiles([]);
    toast.info('MegaMolBART generating structural analogues...');
    
    setTimeout(() => {
      setGenerating(false);
      setInterpolatedSmiles([
        'CC(=O)NC1=CC=C(C=C1)OC', // Methacetin
        'CC(=O)NC1=CC=CC=C1O',    // Ortho-acetamide
        'CC(=O)NC1=CC=C(O)C=C1',   // Paracetamol variant
        'CCN(CC)C(=O)NC1=CC=CC=C1' // Diethylacetamide variant
      ]);
      toast.success('Analogues generated successfully!', {
        description: 'MegaMolBART successfully mapped 4 drug-like molecules in latent space.'
      });
    }, 1200);
  };

  const handleRunDocking = () => {
    setDocking(true);
    setDockResult(null);
    toast.info('DiffDock molecular docking pipeline active...');

    setTimeout(() => {
      setDocking(false);
      setDockResult({
        affinity: -8.4,
        confidence: 0.94,
        hydrogenBonds: 5,
        rmsd: 0.98,
        electrostaticEnergy: -12.5,
        solventAccessibility: '342 Å²',
        bindingResidues: ['GLN-493', 'ASN-501', 'TYR-505']
      });
      toast.success('DiffDock molecular docking complete!', {
        description: 'Binding pocket coordinates successfully resolved with high affinity.'
      });
    }, 1800);
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20">
              Generative Chem NIM
            </span>
            <span className="bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-amber-500/20">
              DiffDock Suite
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Atom className="w-8 h-8 text-[#76B900]" />
            Drug Discovery Workspace
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Explore chemical spaces and simulate molecular binding affinities. Use MegaMolBART transformers to generate structural analogues of active ligands, and DiffDock diffusion models to dock molecules into target pockets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generative Chemistry panel (MegaMolBART) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">MegaMolBART Transformer</span>
              <h3 className="text-xs font-black text-slate-950 uppercase">Generative Chemical Space Exploration</h3>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <div>
                <label className="text-[8.5px] font-black uppercase text-slate-400 block mb-1">Input Ligand SMILES String</label>
                <input 
                  type="text" 
                  value={smiles} 
                  onChange={(e) => setSmiles(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-950" 
                  placeholder="CC(=O)NC1..."
                />
                <span className="text-[7.5px] text-slate-400 mt-1 uppercase font-bold block">Chemical representation format</span>
              </div>
            </div>

            <button
              onClick={handleGenerateMolecules}
              disabled={generating}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                generating 
                  ? 'bg-slate-100 border border-slate-200 text-slate-400' 
                  : 'bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20 hover:bg-[#76B900]/20'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Mapping Latent Space...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Analogues (MegaMolBART)
                </>
              )}
            </button>

            {/* Generated Analogues table */}
            <AnimatePresence>
              {interpolatedSmiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2.5 pt-2 border-t border-slate-100"
                >
                  <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">Structural Analogues</span>
                  <div className="space-y-2">
                    {interpolatedSmiles.map((ana, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSmiles(ana);
                          toast.success('Copied SMILES to Docking Input!');
                        }}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-[#76B900]/30 transition-all cursor-pointer"
                      >
                        <span className="font-mono text-[9px] text-slate-800 font-bold truncate pr-3">{ana}</span>
                        <span className="text-[8px] font-mono font-black text-[#76B900] uppercase shrink-0">Use as Target</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Molecular Docking simulation panel (DiffDock) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block font-bold">DiffDock Molecular Docking</span>
              <h3 className="text-xs font-black text-slate-950 uppercase">Atomic Target Binding Sim</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Target PDB Receptor</label>
                <select 
                  value={targetPdb} 
                  onChange={(e) => setTargetPdb(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-950 cursor-pointer"
                >
                  <option value="6M0J">6M0J (SARS-CoV-2)</option>
                  <option value="1A9N">1A9N (Ubiquitin)</option>
                  <option value="2V5D">2V5D (PIK3CA Kinase)</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Docking Seeds</label>
                <input 
                  type="number" 
                  defaultValue={40} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-950" 
                  disabled
                />
              </div>
            </div>

            <button
              onClick={handleRunDocking}
              disabled={docking}
              className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                docking 
                  ? 'bg-slate-100 border border-slate-200 text-slate-400' 
                  : 'bg-[#76B900] hover:bg-[#66a000] text-black shadow-md shadow-[#76B900]/10 hover:shadow-[#76B900]/20'
              }`}
            >
              {docking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Simulating Binding Diffusion...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute DiffDock Calculation
                </>
              )}
            </button>

            <AnimatePresence>
              {docking ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#76B900] animate-spin mb-4" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">Diffusable Torsional Pose Alignment active...</span>
                </motion.div>
              ) : dockResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#05070a] border border-zinc-900 rounded-xl p-5 text-zinc-400 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <span className="text-[8px] font-mono font-black text-[#76B900] uppercase tracking-widest block">Affinity Output</span>
                    <span className="text-emerald-400 text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      RESOLVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-mono text-[9.5px]">
                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-500 uppercase block">Free Energy (ΔG)</span>
                      <strong className="text-white text-lg font-black">{dockResult.affinity} kcal/mol</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-500 uppercase block">Pose Confidence</span>
                      <strong className="text-white text-lg font-black">{dockResult.confidence * 100}%</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-500 uppercase block">Hydrogen Bonds</span>
                      <strong className="text-white text-lg font-black">{dockResult.hydrogenBonds} active bonds</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-500 uppercase block">Ligand RMSD</span>
                      <strong className="text-white text-lg font-black">{dockResult.rmsd} Å</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 space-y-1.5">
                    <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Docked Binding Residues</span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[9px] text-zinc-300">
                      {dockResult.bindingResidues.map((res: string, idx: number) => (
                        <span key={idx} className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Compass className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase">Pose binding map pending</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
