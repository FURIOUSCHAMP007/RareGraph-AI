import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  Filter, 
  RefreshCcw, 
  Database, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Check, 
  Play, 
  FileText, 
  ArrowUpRight, 
  BarChart3, 
  ShieldAlert,
  Sliders,
  Terminal,
  Layers,
  Activity,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import ChromosomalHeatmap from './ChromosomalHeatmap';

// Define the structure of a simulated VCF record
export interface VcfRecord {
  chrom: string;
  pos: number;
  id: string;
  ref: string;
  alt: string;
  qual: number;
  filter: string;
  gene: string;
  consequence: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';
  dp: number; // Read depth
  af: number; // Allele frequency
  classification: string;
  evidence_summary: string;
}

interface CudfVcfAnalyzerProps {
  onImportVariants: (imported: VcfRecord[]) => void;
}

const SAMPLE_DATASETS = [
  {
    id: 'giab_wgs',
    name: 'WGS GIAB HG002 High-Confidence Panel',
    variantsCount: 1248920,
    fileSize: '842 MB',
    vcfHeader: '##fileformat=VCFv4.2\n##reference=GRCh38\n##INFO=<ID=DP,Number=1,Type=Integer,Description="Read Depth">\n##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">',
    records: [
      { chrom: 'chr1', pos: 4381290, id: 'rs120491', ref: 'G', alt: 'A', qual: 994, filter: 'PASS', gene: 'KCNQ1', consequence: 'HIGH', dp: 54, af: 0.00012, classification: 'Pathogenic', evidence_summary: 'Associated with Long QT Syndrome Type 1; causes protein truncation.' },
      { chrom: 'chr1', pos: 115258747, id: 'rs1154', ref: 'C', alt: 'T', qual: 812, filter: 'PASS', gene: 'NRAS', consequence: 'HIGH', dp: 48, af: 0.00045, classification: 'Pathogenic', evidence_summary: 'Somatic mutation implicated in myelodysplastic syndrome.' },
      { chrom: 'chr2', pos: 166139044, id: 'rs3849', ref: 'T', alt: 'G', qual: 640, filter: 'PASS', gene: 'SCN1A', consequence: 'MODERATE', dp: 32, af: 0.0034, classification: 'VUS', evidence_summary: 'Identified in generalized epilepsy; functional studies incomplete.' },
      { chrom: 'chr3', pos: 37034821, id: 'rs9923', ref: 'C', alt: 'CA', qual: 520, filter: 'PASS', gene: 'SCN5A', consequence: 'HIGH', dp: 41, af: 0.00008, classification: 'Pathogenic', evidence_summary: 'Severe frameshift mutation associated with Brugada Syndrome 1.' },
      { chrom: 'chr7', pos: 117120148, id: 'rs113993960', ref: 'C', alt: 'A', qual: 980, filter: 'PASS', gene: 'CFTR', consequence: 'HIGH', dp: 62, af: 0.015, classification: 'Pathogenic', evidence_summary: 'CFTR deltaF508 analogue variant causing severe molecular misfolding.' },
      { chrom: 'chr11', pos: 108221473, id: 'rs2894', ref: 'A', alt: 'G', qual: 720, filter: 'PASS', gene: 'ATM', consequence: 'MODERATE', dp: 35, af: 0.00098, classification: 'Likely Pathogenic', evidence_summary: 'Associated with Ataxia-Telangiectasia; alters highly conserved kinase domain.' },
      { chrom: 'chr17', pos: 7578406, id: 'rs28934571', ref: 'C', alt: 'T', qual: 890, filter: 'PASS', gene: 'TP53', consequence: 'HIGH', dp: 78, af: 0.00002, classification: 'Pathogenic', evidence_summary: 'Li-Fraumeni syndrome hot spot mutation; severely disrupts DNA-binding.' },
      { chrom: 'chrX', pos: 153283281, id: 'rs5932', ref: 'G', alt: 'A', qual: 420, filter: 'PASS', gene: 'ABCD1', consequence: 'MODERATE', dp: 28, af: 0.0012, classification: 'VUS', evidence_summary: 'Detected in late-onset adrenomyeloneuropathy patients.' }
    ] as VcfRecord[]
  },
  {
    id: 'pediatric_exome',
    name: 'Pediatric Rare Disease Trios Exome Panel',
    variantsCount: 418500,
    fileSize: '215 MB',
    vcfHeader: '##fileformat=VCFv4.2\n##reference=GRCh37\n##INFO=<ID=DP,Number=1,Type=Integer,Description="Read Depth">\n##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">',
    records: [
      { chrom: 'chr9', pos: 139391448, id: 'rs7498', ref: 'A', alt: 'C', qual: 910, filter: 'PASS', gene: 'TSC1', consequence: 'HIGH', dp: 42, af: 0.00005, classification: 'Pathogenic', evidence_summary: 'Causes truncation of hamartin, leading to hyperactivation of mTORC1.' },
      { chrom: 'chr15', pos: 48512903, id: 'rs2839', ref: 'T', alt: 'C', qual: 550, filter: 'PASS', gene: 'FBN1', consequence: 'MODERATE', dp: 30, af: 0.00022, classification: 'Likely Pathogenic', evidence_summary: 'Implicated in Marfan syndrome; alters extracellular microfibril organization.' },
      { chrom: 'chr16', pos: 2123904, id: 'rs1903', ref: 'G', alt: 'A', qual: 380, filter: 'PASS', gene: 'PKD1', consequence: 'LOW', dp: 24, af: 0.045, classification: 'Likely Benign', evidence_summary: 'Frequent polymorphism in multiple databases with minimal effect.' },
      { chrom: 'chr22', pos: 29083921, id: 'rs9482', ref: 'C', alt: 'G', qual: 790, filter: 'PASS', gene: 'NF2', consequence: 'HIGH', dp: 38, af: 0.00003, classification: 'Pathogenic', evidence_summary: 'Splicing junction variant resulting in exon-skipped, unstable merlin.' }
    ] as VcfRecord[]
  },
  {
    id: 'mitochondrial_deep',
    name: 'Mitochondrial Genome Deep-Sequencing Cohort',
    variantsCount: 84320,
    fileSize: '36 MB',
    vcfHeader: '##fileformat=VCFv4.2\n##reference=Reconstructed_LSRS\n##INFO=<ID=DP,Number=1,Type=Integer,Description="Read Depth">\n##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">',
    records: [
      { chrom: 'chrM', pos: 3243, id: 'rs199476111', ref: 'A', alt: 'G', qual: 999, filter: 'PASS', gene: 'MT-TL1', consequence: 'HIGH', dp: 1250, af: 0.78, classification: 'Pathogenic', evidence_summary: 'Canonical tRNA-Leu(UUR) mutation in 80% of MELAS patients.' },
      { chrom: 'chrM', pos: 13513, id: 'rs199476123', ref: 'G', alt: 'A', qual: 920, filter: 'PASS', gene: 'MT-ND5', consequence: 'HIGH', dp: 940, af: 0.42, classification: 'Pathogenic', evidence_summary: 'NADH dehydrogenase subunit 5 variant causing Leigh syndrome.' },
      { chrom: 'chrM', pos: 8344, id: 'rs199476115', ref: 'A', alt: 'G', qual: 870, filter: 'PASS', gene: 'MT-TK', consequence: 'HIGH', dp: 1100, af: 0.65, classification: 'Pathogenic', evidence_summary: 'MERRF syndrome tRNA-Lys mutation; causes translational defects.' }
    ] as VcfRecord[]
  }
];

export default function CudfVcfAnalyzer({ onImportVariants }: CudfVcfAnalyzerProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState('giab_wgs');
  const [minQual, setMinQual] = useState(500);
  const [minDp, setMinDp] = useState(30);
  const [maxAf, setMaxAf] = useState(0.01);
  const [consequenceFilter, setConsequenceFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gpuLogs, setGpuLogs] = useState<string[]>([]);
  const [activeEngine, setActiveEngine] = useState<'pandas' | 'cudf'>('cudf');
  
  // Timing variables
  const [pandasTime, setPandasTime] = useState<number | null>(null);
  const [cudfTime, setCudfTime] = useState<number | null>(null);
  const [gpuMemoryAllocated, setGpuMemoryAllocated] = useState('0.00 MB');

  const selectedDataset = SAMPLE_DATASETS.find(d => d.id === selectedDatasetId) || SAMPLE_DATASETS[0];

  // Perform filtering
  const getFilteredRecords = () => {
    return selectedDataset.records.filter(r => {
      if (r.qual < minQual) return false;
      if (r.dp < minDp) return false;
      if (r.af > maxAf) return false;
      if (consequenceFilter !== 'ALL' && r.consequence !== consequenceFilter) return false;
      return true;
    });
  };

  const filteredRecords = getFilteredRecords();

  const handleRunBenchmark = () => {
    setIsProcessing(true);
    setProgress(5);
    setGpuLogs([]);
    
    const addLog = (msg: string) => {
      setGpuLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Initiating dual-engine benchmark on VCF: ${selectedDataset.name}`);
    addLog(`Targeting payload: ${selectedDataset.variantsCount.toLocaleString()} VCF records (${selectedDataset.fileSize})`);

    let curProg = 5;
    const interval = setInterval(() => {
      curProg += Math.floor(Math.random() * 20) + 15;
      if (curProg >= 100) {
        curProg = 100;
        clearInterval(interval);
        
        // Finalize timings
        const recordsCount = selectedDataset.variantsCount;
        
        // Calculate realistic CPU Pandas vs GPU cuDF speed comparison
        // cuDF uses parallel CUDA threads, pandas is single core
        // CPU time is roughly proportional to rows
        const calculatedCpuTime = Number(((recordsCount * 0.0018) + (Math.random() * 100)).toFixed(1));
        const calculatedGpuTime = Number(((recordsCount * 0.000009) + 4.2 + (Math.random() * 1)).toFixed(2));
        
        setPandasTime(calculatedCpuTime);
        setCudfTime(calculatedGpuTime);
        
        // GPU VRAM calculations
        const memoryMB = ((recordsCount * 144) / (1024 * 1024)).toFixed(2);
        setGpuMemoryAllocated(`${memoryMB} MB`);

        addLog(`[CPU Engine] pandas.read_csv() loaded ${recordsCount.toLocaleString()} records in ${calculatedCpuTime} ms.`);
        addLog(`[CPU Engine] pandas filtering (QUAL > ${minQual}, DP > ${minDp}, AF < ${maxAf}) completed.`);
        
        addLog(`[GPU Engine] cudf.read_csv() streamed into Device VRAM in ${(calculatedGpuTime * 0.4).toFixed(2)} ms.`);
        addLog(`[GPU Engine] Invoking CUDA JIT compiled kernel (cudf.DataFrame.query).`);
        addLog(`[GPU Engine] JIT filter & aggregation resolved across ${Math.ceil(recordsCount / 1024).toLocaleString()} thread blocks in ${(calculatedGpuTime * 0.6).toFixed(2)} ms.`);
        addLog(`RAPIDS cuDF speedup achieved: ${(calculatedCpuTime / calculatedGpuTime).toFixed(1)}x faster than pandas.`);

        setIsProcessing(false);
        toast.success('RAPIDS cuDF Acceleration Benchmark Complete!', {
          description: `GPU query resolved in ${calculatedGpuTime} ms vs. CPU pandas ${calculatedCpuTime} ms.`
        });
      } else {
        setProgress(curProg);
        if (curProg > 20 && curProg < 50) {
          addLog(`Configuring CPU pandas engine buffers and garbage collector...`);
        } else if (curProg >= 50 && curProg < 75) {
          addLog(`Binding GPU Arrow format memory buffer for local cuDF context.`);
          addLog(`Uploading VCF dataframe coordinates to NVIDIA H100 Hopper VRAM...`);
        } else if (curProg >= 75 && curProg < 95) {
          addLog(`Executing GPU parallel reduction and aggregation kernels.`);
        }
      }
    }, 300);
  };

  // Run automatically when parameters change
  useEffect(() => {
    // Generate simulated initial benchmark if none exists
    if (pandasTime === null) {
      const recordsCount = selectedDataset.variantsCount;
      const calculatedCpuTime = Number(((recordsCount * 0.0018) + 85).toFixed(1));
      const calculatedGpuTime = Number(((recordsCount * 0.000009) + 4.8).toFixed(2));
      setPandasTime(calculatedCpuTime);
      setCudfTime(calculatedGpuTime);
      setGpuMemoryAllocated(((recordsCount * 144) / (1024 * 1024)).toFixed(2) + " MB");
    }
  }, [selectedDatasetId]);

  const handleImportToWorkspace = () => {
    if (filteredRecords.length === 0) {
      toast.error('No Variants Scanned', {
        description: 'Adjust your cuDF filters to resolve at least one high-confidence candidate.'
      });
      return;
    }
    onImportVariants(filteredRecords);
    toast.success('Variants Imported successfully', {
      description: `Injected ${filteredRecords.length} high-priority records into Patient ClinVar annotations list.`
    });
  };

  // Speedup Factor
  const speedupFactor = pandasTime && cudfTime ? (pandasTime / cudfTime).toFixed(1) : '200+';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="p-6 bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#76B900]/15 rounded-xl border border-[#76B900]/30 text-[#76B900]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#76B900]/10 text-[#76B900] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#76B900]/30">
                RAPIDS cuDF GPU
              </span>
              <span className="text-zinc-500 text-[8px] font-mono uppercase tracking-wider">v24.04</span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-white mt-1">
              GPU-Accelerated VCF Filtering Engine
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mr-2">VCF Input Panel</span>
          <select
            value={selectedDatasetId}
            onChange={(e) => {
              setSelectedDatasetId(e.target.value);
              setPandasTime(null);
              setCudfTime(null);
            }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-3 py-1.5 text-[10px] font-mono font-bold focus:outline-none focus:border-[#76B900]"
          >
            {SAMPLE_DATASETS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.split(' - ')[0]} ({d.fileSize})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Interactive Parameters Panel */}
        <div className="lg:col-span-4 p-6 space-y-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">cuDF Dynamic Filters</h4>
            <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
              Tweak parameters to stream queries directly across GPU memory lanes.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Minimum Quality Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">Min Qual Score (QUAL)</span>
                <span className="font-mono text-slate-900">{minQual}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={minQual}
                onChange={(e) => setMinQual(Number(e.target.value))}
                className="w-full accent-[#76B900]"
              />
            </div>

            {/* Read Depth (DP) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">Min Read Depth (DP)</span>
                <span className="font-mono text-slate-900">{minDp}x</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={minDp}
                onChange={(e) => setMinDp(Number(e.target.value))}
                className="w-full accent-[#76B900]"
              />
            </div>

            {/* Allele Frequency (AF) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">Max Allele Frequency (AF)</span>
                <span className="font-mono text-slate-900">{maxAf.toExponential(4)}</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.1"
                step="0.005"
                value={maxAf}
                onChange={(e) => setMaxAf(Number(e.target.value))}
                className="w-full accent-[#76B900]"
              />
            </div>

            {/* Impact Consequence */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 block">Consequence Impact</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((con) => (
                  <button
                    key={con}
                    onClick={() => setConsequenceFilter(con)}
                    className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      consequenceFilter === con
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {con}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              <button
                onClick={handleRunBenchmark}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-[#76B900] hover:bg-[#66a000] disabled:bg-slate-100 disabled:text-slate-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    Compiling GPU Kernels... {progress}%
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run cuDF Acceleration Test
                  </>
                )}
              </button>
              
              <button
                onClick={handleImportToWorkspace}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Inject To Clinical Workspace ({filteredRecords.length})
              </button>
            </div>

          </div>
        </div>

        {/* Right Dashboard Results View */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-6 bg-slate-50/50">
          
          {/* Performance Comparison Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Standard Pandas (CPU) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">CPU Baseline (pandas)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-slate-700">
                  {pandasTime ? `${pandasTime}ms` : '---'}
                </span>
                <span className="text-[8px] font-bold text-slate-400">Single Core</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full w-full" />
              </div>
              <p className="text-[9px] text-slate-400 font-medium font-mono leading-none">
                pandas.DataFrame.query()
              </p>
            </div>

            {/* RAPIDS cuDF (GPU) */}
            <div className="bg-[#05070a] border border-zinc-900 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#76B900]/10 rounded-full blur-xl pointer-events-none" />
              <span className="text-[8px] font-black text-[#76B900] uppercase tracking-widest block">RAPIDS GPU (cuDF)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-emerald-400">
                  {cudfTime ? `${cudfTime}ms` : '---'}
                </span>
                <span className="text-[8px] font-bold text-emerald-500">CUDA Threads</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-900">
                <div className="h-full bg-[#76B900] rounded-full w-1/12 animate-pulse" />
              </div>
              <p className="text-[9px] text-[#76B900] font-bold font-mono leading-none">
                cudf.DataFrame.query()
              </p>
            </div>

            {/* Performance Multiplier speedup */}
            <div className="bg-[#76B900]/5 border border-[#76B900]/20 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Acceleration Factor</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#76B900] font-mono leading-none">
                  {speedupFactor}x
                </span>
                <span className="text-[8px] font-black text-[#76B900] uppercase tracking-wider">SPEEDUP</span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                Parallelized SIMT reduction. Memory: <span className="font-mono text-slate-700">{gpuMemoryAllocated}</span>
              </p>
            </div>

          </div>

          {/* GPU Terminal Execution Output */}
          <div className="bg-[#020305] border border-zinc-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">RAPIDS cuDF JIT Compiler Terminal</span>
              <span className="text-[#76B900] text-[8px] font-mono font-black uppercase flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> ACTIVE GPU MEMORY
              </span>
            </div>
            
            <div className="h-28 overflow-y-auto font-mono text-[8.5px] text-zinc-300 space-y-1.5 pr-1">
              {gpuLogs.length === 0 ? (
                <div className="space-y-1">
                  <span className="text-zinc-500 block">df = cudf.read_csv('{selectedDataset.name.split(' ')[0].toLowerCase()}_variants.vcf', sep='\t')</span>
                  <span className="text-zinc-500 block"># GPU query statement:</span>
                  <span className="text-emerald-500 block font-bold">df.query("QUAL &gt; {minQual} & DP &gt; {minDp} & AF &lt; {maxAf}")</span>
                  <span className="text-zinc-600 block italic">Trigger 'Run cuDF Acceleration Test' to compile kernel matrices...</span>
                </div>
              ) : (
                gpuLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l border-zinc-800 pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chromosomal Variant Heatmap Visualizer */}
          <ChromosomalHeatmap records={filteredRecords} />

          {/* Filtered records snippet table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                RAPIDS cuDF Filtered Active Buffer Stream
              </span>
              <span className="bg-[#76B900]/10 text-[#76B900] border border-[#76B900]/20 text-[8px] font-mono font-black px-1.5 py-0.5 rounded">
                {filteredRecords.length} of {selectedDataset.variantsCount.toLocaleString()} passed
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-150 text-[8.5px] uppercase font-black">
                    <th className="py-2.5 px-3">Locus</th>
                    <th className="py-2.5 px-3">Gene</th>
                    <th className="py-2.5 px-3">Impact</th>
                    <th className="py-2.5 px-3">QUAL</th>
                    <th className="py-2.5 px-3">DP</th>
                    <th className="py-2.5 px-3 text-right">AF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[10px] text-slate-400 italic">
                        No rows passed filter criteria. Tweak sliders to retrieve variants.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 text-slate-900 font-bold">
                          {rec.chrom}:{rec.pos}
                        </td>
                        <td className="py-2 px-3 text-[#76B900] font-sans font-black uppercase text-[9.5px]">
                          {rec.gene}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            rec.consequence === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            rec.consequence === 'MODERATE' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {rec.consequence}
                          </span>
                        </td>
                        <td className="py-2 px-3">{rec.qual}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{rec.dp}x</td>
                        <td className="py-2 px-3 text-right text-slate-500">{rec.af.toExponential(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
