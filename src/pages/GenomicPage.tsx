import React, { useState } from 'react';
import { 
  Dna, 
  ShieldAlert, 
  Cpu, 
  Database, 
  ChevronRight, 
  Activity, 
  Share2, 
  Sparkles, 
  RefreshCcw, 
  ExternalLink, 
  Info, 
  ChevronDown, 
  Tag, 
  Star, 
  Globe, 
  Users, 
  BarChart3, 
  ListFilter, 
  Microscope,
  BookOpen,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import GenomicNetwork from '../components/GenomicNetwork';
import GOHierarchy from '../components/GOHierarchy';
import EvidenceSynthesis from '../components/EvidenceSynthesis';
import { annotateVariants, VariantAnnotation } from '../services/annotationService';
import { runGOEnrichment, GOEnrichmentResult } from '../services/goService';
import CudfVcfAnalyzer, { VcfRecord } from '../components/CudfVcfAnalyzer';

import { useClinical } from '../context/ClinicalContext';

export default function GenomicPage() {
  const { addVariant } = useClinical();
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'cohort' | 'cudf'>('cohort');

  const handleImportVcfVariants = (imported: VcfRecord[]) => {
    const mapped: VariantAnnotation[] = imported.map(v => ({
      gene: v.gene,
      variant: `${v.chrom}:${v.pos} ${v.ref}>${v.alt}`,
      classification: v.classification,
      pSource: 'RAPIDS cuDF VCF',
      severity: v.consequence === 'HIGH' ? 0.95 : v.consequence === 'MODERATE' ? 0.65 : 0.25,
      clinvar_stars: v.consequence === 'HIGH' ? 3 : 1,
      gnomad_af: v.af,
      gnomad_hom: v.af < 0.001 ? 0 : 2,
      evidence_summary: v.evidence_summary || `GPU cuDF filtered variant with Read Depth of ${v.dp}x and Quality score of ${v.qual}.`,
      acmg_codes: v.consequence === 'HIGH' ? ['PS1', 'PM2'] : ['PM2']
    }));
    
    // Prevent duplicate additions
    setVariants(prev => {
      const existingKeys = new Set(prev.map(p => `${p.gene}-${p.variant}`));
      const filteredMapped = mapped.filter(m => !existingKeys.has(`${m.gene}-${m.variant}`));
      if (filteredMapped.length === 0) {
        toast.info('Selected variants are already in your active panel.');
        return prev;
      }
      return [...filteredMapped, ...prev];
    });
    
    // Switch to active cohort view so clinician can review annotated records immediately
    setActiveSubTab('cohort');
  };

  const handleSyncToProfile = () => {
    if (variants.length === 0) return;
    variants.forEach(v => addVariant({
      id: `${v.gene}-${v.variant}`,
      gene: v.gene,
      variant: v.variant,
      pathogenicity: v.classification as any,
      inheritance: 'Unknown',
      evidence: v.evidence_summary || `Severity: ${v.severity}`
    }));
    toast.success('Variants synced to clinical knowledge base.');
  };
  const [isEnriching, setIsEnriching] = useState(false);
  const [goResults, setGoResults] = useState<GOEnrichmentResult[]>([]);
  const [goView, setGoView] = useState<'list' | 'hierarchy'>('list');
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [variants, setVariants] = useState<VariantAnnotation[]>([
    { gene: 'MT-TL1', variant: 'm.3243A>G', classification: 'Pathogenic', pSource: 'ClinVar', severity: 0.95, evidence_summary: 'Primary variant associated with MELAS syndrome.', acmg_codes: ['PS1', 'PM2'], clinvar_stars: 3, gnomad_af: 0.00001, gnomad_hom: 0, clinvar_id: '9580' },
    { gene: 'MT-ND5', variant: 'm.13513G>A', classification: 'VUS', pSource: 'GnomAD', severity: 0.42, evidence_summary: 'Detected in infant cases with exercise intolerance.', acmg_codes: ['PM2'], clinvar_stars: 1, gnomad_af: 0.02, gnomad_hom: 0, clinvar_id: '143894'  },
    { gene: 'GAA', variant: 'c.1935C>A', classification: 'Likely Benign', pSource: 'LOVD', severity: 0.15, evidence_summary: 'Common polimorphism in Mediterranean populations.', acmg_codes: ['BP1'], clinvar_stars: 2, gnomad_af: 0.15, gnomad_hom: 12 },
    { gene: 'DMD', variant: 'c.583G>T', classification: 'Pathogenic', pSource: 'ClinVar', severity: 0.92, evidence_summary: 'Nonsense mutation leading to truncated dystrophin protein.', acmg_codes: ['PVS1', 'PM2'], clinvar_stars: 4, gnomad_af: 0.000005, gnomad_hom: 0, clinvar_id: '96660' },
    { gene: 'GLA', variant: 'c.901C>T', classification: 'Likely Pathogenic', pSource: 'ClinVar', severity: 0.85, evidence_summary: 'Associated with late-onset Fabry Disease cardiac phenotype.', acmg_codes: ['PM1', 'PM2', 'PP3'], clinvar_stars: 3, gnomad_af: 0.0001, gnomad_hom: 0, clinvar_id: '10744' },
    { gene: 'HTT', variant: 'CAG Expansion', classification: 'Pathogenic', pSource: 'Genomics PLC', severity: 0.99, evidence_summary: 'Expansion >40 repeats confirms Huntington disease diagnosis.', acmg_codes: ['PS1', 'PS3', 'PS4'], clinvar_stars: 4, gnomad_af: 0.000001, gnomad_hom: 0 },
  ]);

  const handleAutoAnnotate = async () => {
    setIsAnnotating(true);
    toast.promise(annotateVariants(variants), {
      loading: 'Connecting to ClinVar & gnomAD APIs...',
      success: (data) => {
        setVariants(data);
        setIsAnnotating(false);
        return 'Variants successfully annotated with clinical significance.';
      },
      error: 'Failed to connect to genomic databases.',
    });
  };

  const handleEnrichmentAnalysis = async () => {
    setIsEnriching(true);
    const genes = variants.map(v => v.gene);
    
    toast.promise(runGOEnrichment(genes), {
      loading: 'Running Gene Ontology Enrichment...',
      success: (data) => {
        setGoResults(data);
        setIsEnriching(false);
        return `GO Enrichment complete: ${data.length} functional themes identified.`;
      },
      error: 'Enrichment engine error.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Genomic Intel</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Variant Pathogenicity & ACMG Classification Engine</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <Database className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DB Sync: 100%</span>
          </div>
          <button 
            onClick={handleEnrichmentAnalysis}
            disabled={isEnriching || variants.length === 0}
            className="group px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
             <Microscope className={cn("w-4 h-4 text-blue-400", isEnriching && "animate-pulse")} />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Enrichment</span>
          </button>
          <button 
            onClick={handleSyncToProfile}
            className="group px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-3 shadow-xl transition-all active:scale-95"
          >
             <Database className="w-4 h-4 text-emerald-200" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Sync Profile</span>
          </button>
          <button 
            onClick={handleAutoAnnotate}
            disabled={isAnnotating}
            className="group px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
             <Sparkles className={cn("w-4 h-4 text-blue-200", isAnnotating && "animate-spin")} />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Annotate</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation Segment Control */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('cohort')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all flex items-center gap-2 ${
              activeSubTab === 'cohort'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Active Cohort Annotations ({variants.length})
          </button>
          
          <button
            onClick={() => setActiveSubTab('cudf')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all flex items-center gap-2 ${
              activeSubTab === 'cudf'
                ? 'bg-emerald-950 border-zinc-900 text-[#76B900] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-[#76B900] text-[#76B900]" />
            RAPIDS cuDF VCF Processing (GPU)
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-slate-400 font-bold uppercase mr-1">
          <Cpu className="w-3.5 h-3.5 text-slate-300" />
          <span>Active Acceleration Core: RAPIDS CUDA cuDF</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'cudf' ? (
          <motion.div
            key="cudf"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <CudfVcfAnalyzer onImportVariants={handleImportVcfVariants} />
          </motion.div>
        ) : (
          <motion.div
            key="cohort"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Variant Table Area */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
            <AnimatePresence>
            {isAnnotating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Re-Annotating Genomic Dataset...</p>
                <div className="mt-4 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Variants</h3>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">{variants.length} RECORDS FOUND</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100/50 text-[10px] text-slate-400 uppercase tracking-widest font-black text">
                <th className="p-5 w-10"></th>
                <th className="p-5 pl-0">Gene</th>
                <th className="p-5">Variant</th>
                <th className="p-5">Classification</th>
                <th className="p-5">Database</th>
                <th className="p-5">gnomAD AF</th>
                <th className="p-5 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40">
              {variants.map((v, i) => (
                <React.Fragment key={`${v.gene}-${v.variant}-${i}`}>
                  <tr 
                    className={cn(
                      "hover:bg-slate-50 transition-colors cursor-pointer group animate-in fade-in slide-in-from-left-2 duration-300",
                      expandedVariant === i && "bg-slate-50/80 border-l-2 border-l-blue-600"
                    )}
                    style={{ animationDelay: `${i * 100}ms` }}
                    onClick={() => setExpandedVariant(expandedVariant === i ? null : i)}
                  >
                    <td className="p-5 text-center">
                      <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", expandedVariant === i && "rotate-180 text-blue-600")} />
                    </td>
                    <td className="p-5 pl-0">
                      <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{v.gene}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">HGNC Approved</p>
                    </td>
                    <td className="p-5 text-xs font-mono text-slate-500 font-bold">{v.variant}</td>
                    <td className="p-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                        v.classification === 'Pathogenic' ? "bg-red-50 text-red-600 border-red-100 shadow-red-100/50" :
                        v.classification === 'VUS' ? "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50" :
                        v.classification === 'Likely Benign' || v.classification === 'Benign' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50" :
                        "bg-slate-50 text-slate-600 border-slate-100"
                      )}>
                        {v.classification}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                         <p className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-tight">{v.pSource}</p>
                         {v.clinvar_id && <ExternalLink className="w-2.5 h-2.5 text-slate-300" />}
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-[10px] font-mono text-slate-600 font-bold">
                        {v.gnomad_af !== undefined ? v.gnomad_af.toExponential(2) : '--'}
                      </p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs font-mono font-black text-slate-900">
                        {(v.severity * 10).toFixed(1)}
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${v.severity * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full", v.severity > 0.7 ? "bg-red-500" : v.severity > 0.3 ? "bg-amber-500" : "bg-emerald-500")} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedVariant === i && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/40"
                      >
                        <td colSpan={8} className="px-5 py-4">
                          <div className="bg-white border border-slate-100 rounded-xl p-0 shadow-inner overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100">
                              <div className="p-6 space-y-4">
                                <div>
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Clinical Evidence
                                  </h4>
                                  <p className="text-xs text-slate-700 font-bold leading-relaxed">{v.evidence_summary}</p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ClinVar Review Status</h4>
                                  <div className="flex gap-1">
                                    {[...Array(4)].map((_, idx) => (
                                      <Star 
                                        key={idx} 
                                        className={cn("w-3 h-3", idx < (v.clinvar_stars || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200")} 
                                      />
                                    ))}
                                    <span className="ml-2 text-[9px] font-mono text-slate-400">({v.clinvar_stars || 0} Stars)</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                   {v.acmg_codes.map(code => (
                                     <div key={code} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-blue-50 transition-colors">
                                       <Tag className="w-2.5 h-2.5 text-blue-500" />
                                       <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{code}</span>
                                     </div>
                                   ))}
                                </div>
                              </div>
                              
                              <div className="p-6 bg-slate-50/30 space-y-4">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                  <Globe className="w-3 h-3" /> Population Frequency (gnomAD)
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Allele Freq</p>
                                    <p className="text-xs font-mono font-black text-slate-900">
                                      {v.gnomad_af !== undefined ? v.gnomad_af.toExponential(4) : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Homozygotes</p>
                                    <p className="text-xs font-mono font-black text-slate-900">
                                      {v.gnomad_hom ?? '0'}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Population Bias</p>
                                    <Users className="w-3 h-3 text-slate-300" />
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500 rounded-full" style={{ width: v.gnomad_af && v.gnomad_af > 0.01 ? '85%' : '12%' }} />
                                  </div>
                                  <p className="mt-2 text-[9px] text-slate-500 font-medium italic">
                                    {v.gnomad_af && v.gnomad_af > 0.01 ? 'Common variant detected in multiple global cohorts.' : 'Rare/Ultra-rare variant; high suspicion for pathogenicity.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-slate-100 p-6 bg-slate-50/20">
                               <EvidenceSynthesis gene={v.gene} variant={v.variant} />
                            </div>

                            <div className="px-6 py-3 bg-slate-900 flex justify-between items-center">
                               <p className="text-[9px] text-slate-400 font-mono">Annotated on: {new Date().toLocaleDateString()}</p>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   if (v.clinvar_id) {
                                     window.open(`https://www.ncbi.nlm.nih.gov/clinvar/variation/${v.clinvar_id}`, '_blank');
                                   } else {
                                     window.open(`https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(`${v.gene} ${v.variant}`)}`, '_blank');
                                   }
                                 }}
                                 className="flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                               >
                                 Open ClinVar Profile <ExternalLink className="w-3 h-3" />
                               </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* Side Panel Area */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* ACMG scoring card - Sticky candidate */}
          <div className="sticky top-8 space-y-6">
            <section className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">ACMG Scoring Engine</h3>
                </div>
                <Info className="w-3 h-3 text-slate-300" />
              </div>
              <div className="space-y-4">
                { [
                  { code: 'PS1', label: 'Strong pathogenic', status: true, detail: 'Same amino acid change as a known pathogenic variant.' },
                  { code: 'PM2', label: 'Absent in gnomAD', status: true, detail: 'Extremely low frequency in control populations.' },
                  { code: 'PP3', label: 'In silico prediction', status: true, detail: 'Multiple computational tools predict deleterious effect.' },
                  { code: 'BP1', label: 'Missense in gene', status: false, detail: 'Missense variant in a gene where only LOF is pathogenic.' },
                ].map(c => (
                  <div 
                    key={c.code} 
                    className="flex justify-between items-center p-3 border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all rounded-xl cursor-pointer group active:scale-95"
                    onClick={() => toast.info(`${c.code}: ${c.label}`, { description: c.detail })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full", c.status ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-slate-200")} />
                      <div>
                        <p className={cn("text-[11px] font-black uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none mb-1", c.status ? "text-slate-900" : "text-slate-300")}>{c.code}</p>
                        <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">{c.label}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform group-hover:translate-x-1", c.status ? "text-slate-400" : "text-slate-200")} />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => toast.info('Full ACMG Report', { description: 'Generating detailed classification evidence summary...' })}
                className="mt-8 w-full p-4 bg-slate-900 rounded-2xl text-center hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">CLASSIFICATION: CLASS 5</span>
                </div>
              </button>
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm overflow-hidden relative">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 pb-2 border-b border-slate-100">Functional Insight</h3>
              <div className="relative group">
                <button 
                  onClick={() => toast.info('Pathway Logic', { description: 'Opening cellular pathway interaction graph for MT-TL1.' })}
                  className="w-full flex flex-col items-center py-6 bg-slate-50/50 rounded-2xl hover:bg-white border border-dashed border-slate-200 transition-all active:scale-[0.98]"
                >
                   <Cpu className="w-12 h-12 text-slate-200 mb-5 group-hover:text-blue-500 transition-colors" />
                   <p className="text-[11px] text-center text-slate-600 font-bold px-6 leading-relaxed">Variant disrupts the Electron Transport Chain (Complex I interaction).</p>
                   <div className="mt-8 flex gap-3">
                     <div className="w-2 h-2 bg-blue-100 rounded-full" />
                     <div className="w-2 h-2 bg-blue-300 rounded-full" />
                     <div className="w-2 h-2 bg-blue-600 rounded-full" />
                   </div>
                </button>
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Autonomous Insights</h4>
                </div>
                <p className="text-xs font-bold leading-relaxed mb-6 italic opacity-80">
                  {variants.some(v => v.classification === 'Pathogenic') 
                    ? "Detected high-confidence pathogenic variants in mitochondrial respiratory complexes. Genetic background suggests high risk of MELAS syndrome."
                    : "Analyzing genomic dataset for cryptic splicing and regulatory variants. No major structural abnormalities detected in primary coding regions."}
                </p>
                <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-900/50">
                  Generate Summary Report <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Analysis Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interaction Network Section */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Interaction Network</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-500 font-black uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="p-0 flex-1 min-h-[400px]">
            <GenomicNetwork detectedGenes={variants.map(v => v.gene)} />
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Topological mapping of pathogenicity clusters.</p>
             </div>
             <button 
               onClick={() => toast.info('Export started')}
               className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:text-blue-700 transition-colors"
             >
               Export
             </button>
          </div>
        </section>

        {/* Gene Ontology Enrichment Section */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">GO Enrichment</h3>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-xl">
               <button 
                 onClick={() => setGoView('list')}
                 className={cn(
                   "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                   goView === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 List
               </button>
               <button 
                 onClick={() => setGoView('hierarchy')}
                 className={cn(
                   "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                   goView === 'hierarchy' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 Hierarchy
               </button>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-visible relative">
            {goResults.length > 0 ? (
              <AnimatePresence mode="wait">
                {goView === 'list' ? (
                  <motion.div 
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 max-h-[450px] overflow-y-auto pr-2"
                  >
                    {goResults.map((res, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-center mb-2">
                           <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                            res.category === 'Biological Process' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            res.category === 'Molecular Function' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {res.category}
                          </span>
                          <span className="text-[9px] font-mono font-black text-slate-400">p={res.pValue.toExponential(2)}</span>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-2 leading-relaxed">{res.description}</h4>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className={cn(
                             "h-full rounded-full transition-all duration-1000",
                             res.category === 'Biological Process' ? "bg-indigo-500" : "bg-blue-500"
                           )} style={{ width: `${Math.min(100, Math.abs(Math.log10(res.pValue)) / 10 * 100)}%` }} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="hierarchy"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="h-full"
                  >
                    <GOHierarchy results={goResults} />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
                <ListFilter className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">Enrichment Idle</p>
                <p className="text-[10px] text-slate-400 font-bold max-w-[200px] mt-2">Run analysis to explore functional relationships.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}

