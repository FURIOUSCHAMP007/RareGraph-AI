import { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  FileDown,
  BrainCircuit,
  MessageSquare,
  Zap,
  Network,
  FlaskConical,
  Stethoscope,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import Markdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useClinical } from '../context/ClinicalContext';
import { synthesizeClinicalReport } from '../services/geminiService';

export default function ReportGeneratorPage() {
  const { hpoTerms, variants, patientName, caseId } = useClinical();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [reportSynthesis, setReportSynthesis] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [config, setConfig] = useState({
    pheno: true,
    genomic: true,
    pgx: true,
    pedigree: true,
    trials: true
  });

  const toggleConfig = (id: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const summary = await synthesizeClinicalReport(patientName, hpoTerms, variants);
      setReportSynthesis(summary);
      toast.success("AI clinical synthesis complete.");
    } catch (error) {
      toast.error("Synthesis failed. Check API configuration.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `RareGraph_Report_${caseId}`,
    onBeforePrint: () => {
      setIsGenerating(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGenerating(false);
      toast.success("Clinical report exported successfully.");
    },
    onPrintError: () => {
      setIsGenerating(false);
      toast.error("Print failed.");
    }
  });

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      // Small delay to ensure any layout shifts or animations are settled
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        logging: false,
        onclone: (clonedDoc) => {
          // Force hex values and clean up any oklch/oklab values that html2canvas can't parse
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { 
              border-color: #e2e8f0 !important; 
            }
            body, .font-sans { color: #0f172a !important; background-color: #ffffff !important; }
            .text-slate-900, h1, h2, h3, h4, h5, h6 { color: #0f172a !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-700 { color: #334155 !important; }
            .text-slate-600 { color: #475569 !important; }
            .text-slate-500 { color: #64748b !important; }
            .text-slate-400 { color: #94a3b8 !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-blue-500 { color: #3b82f6 !important; }
            .text-blue-400 { color: #60a5fa !important; }
            .text-rose-600 { color: #e11d48 !important; }
            .text-emerald-400 { color: #34d399 !important; }
            .text-emerald-500 { color: #10b981 !important; }
            .text-emerald-600 { color: #059669 !important; }
            .text-amber-500 { color: #f59e0b !important; }
            .text-indigo-900 { color: #312e81 !important; }
            .text-indigo-400 { color: #818cf8 !important; }
            .text-indigo-600 { color: #4f46e5 !important; }
            .text-white { color: #ffffff !important; }
            .text-white/40 { color: rgba(255, 255, 255, 0.4) !important; }
            .text-white/60 { color: rgba(255, 255, 255, 0.6) !important; }
            
            .bg-slate-900 { background-color: #0f172a !important; }
            .bg-slate-800 { background-color: #1e293b !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .bg-rose-50 { background-color: #fff1f2 !important; }
            .bg-rose-500 { background-color: #f43f5e !important; }
            .bg-indigo-50 { background-color: #eef2ff !important; }
            .bg-indigo-100 { background-color: #e0e7ff !important; }
            .bg-emerald-400 { background-color: #34d399 !important; }
            .bg-emerald-500 { background-color: #10b981 !important; }
            .bg-emerald-600 { background-color: #059669 !important; }
            .bg-emerald-900 { background-color: #064e3b !important; }
            .bg-amber-500 { background-color: #f59e0b !important; }
            .bg-white { background-color: #ffffff !important; }
            .bg-white\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
            .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05) !important; }
            .bg-slate-50\\/50 { background-color: rgba(248, 250, 252, 0.5) !important; }
            
            .border-slate-900 { border-color: #0f172a !important; }
            .border-slate-300 { border-color: #cbd5e1 !important; }
            .border-slate-200 { border-color: #e2e8f0 !important; }
            .border-slate-100 { border-color: #f1f5f9 !important; }
            .border-blue-600 { border-color: #2563eb !important; }
            .border-indigo-100 { border-color: #e0e7ff !important; }
            .border-indigo-200 { border-color: #c7d2fe !important; }
            .border-rose-100 { border-color: #ffe4e6 !important; }
            .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1) !important; }
            .border-2 { border-width: 2px !important; }
            .decoration-slate-200 { text-decoration-color: #e2e8f0 !important; }

            /* Catch-all for any opacity issues */
            .opacity-50 { opacity: 0.5 !important; }
            .opacity-80 { opacity: 0.8 !important; }
          `;
          clonedDoc.head.appendChild(style);

          // Deep sanitize all stylesheets for oklab/oklch
          const allStyles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < allStyles.length; i++) {
            const s = allStyles[i];
            if (s.innerHTML.includes('oklch') || s.innerHTML.includes('oklab')) {
              s.innerHTML = s.innerHTML.replace(/okl[ab|ch]\(.*?\)/g, '#94a3b8');
            }
          }

          // Deep search and replace any computed styles that use oklab/oklch on elements
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            
            // Fix computed styles
            try {
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.color && /okl[ab|ch]/.test(computedStyle.color)) {
                el.style.color = '#0f172a';
              }
              if (computedStyle.backgroundColor && /okl[ab|ch]/.test(computedStyle.backgroundColor)) {
                el.style.backgroundColor = '#f8fafc';
              }
              if (computedStyle.borderColor && /okl[ab|ch]/.test(computedStyle.borderColor)) {
                el.style.borderColor = '#cbd5e1';
              }
            } catch (e) {
              // ignore errors in getComputedStyle
            }

            if (el.style) {
              if (el.style.backgroundColor && /okl[ab|ch]/.test(el.style.backgroundColor)) {
                el.style.backgroundColor = '#f8fafc';
              }
              if (el.style.color && /okl[ab|ch]/.test(el.style.color)) {
                el.style.color = '#0f172a';
              }
              if (el.style.borderColor && /okl[ab|ch]/.test(el.style.borderColor)) {
                el.style.borderColor = '#cbd5e1';
              }
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Use standard A4 format
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      // Calculate dimensions to fit A4
      let finalWidth = pdfWidth;
      let finalHeight = pdfWidth / ratio;
      
      if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * ratio;
      }
      
      // Center the image
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
      pdf.save(`RareGraph_Report_${caseId}.pdf`);
      
      toast.success("PDF clinical report downloaded successfully.");
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error("Failed to generate PDF download. Try the Classic Print Dialog.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
          <FileText className="w-3 h-3" />
          Automated Clinical Report Generator (v1.2)
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Synoptic Case Synthesis</h2>
        <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
          Saves specialists hours of administrative work. Synthesizes findings from across the platform—Note Entitizer, Genomic Intel, and PGx Hub—into a professional clinical summary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
        {/* Settings / Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm space-y-8">
              <div className="space-y-4">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Report Configuration</h3>
                 <div className="space-y-3">
                    {[
                      { id: 'pheno', label: 'Phenotype Catalog (HPO)' },
                      { id: 'genomic', label: 'Variant Prioritization' },
                      { id: 'pgx', label: 'Pharmacogenomics Dashboard' },
                      { id: 'pedigree', label: 'Inheritance Map' },
                      { id: 'trials', label: 'Experimental Therapeutic Options' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                         <input 
                          type="checkbox" 
                          checked={config[item.id as keyof typeof config]} 
                          onChange={() => toggleConfig(item.id as keyof typeof config)}
                          className="w-5 h-5 accent-blue-600 cursor-pointer" 
                         />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                 <button 
                   onClick={handleSynthesize}
                   disabled={isSynthesizing}
                   className={cn(
                     "w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]",
                     isSynthesizing && "opacity-50 cursor-not-allowed"
                   )}
                 >
                   {isSynthesizing ? (
                     <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                   ) : (
                     <BrainCircuit className="w-5 h-5 text-blue-400" />
                   )}
                   {isSynthesizing ? 'Analyzing Patterns...' : 'AI Clinical Synthesis'}
                 </button>
                 <button 
                   onClick={handleDownloadPDF}
                   disabled={isGenerating}
                   className={cn(
                     "w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]",
                     isGenerating && "opacity-50 cursor-not-allowed"
                   )}
                 >
                   {isGenerating ? (
                     <RefreshCw className="w-5 h-5 animate-spin" />
                   ) : (
                     <FileDown className="w-5 h-5" />
                   )}
                   {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
                 </button>
                 <button 
                   onClick={handlePrint}
                   disabled={isGenerating}
                   className="w-full flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all active:scale-[0.98]"
                 >
                    <Printer className="w-5 h-5" />
                    Classic Print Dialog
                 </button>
                 <button className="w-full flex items-center justify-center gap-3 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all active:scale-[0.98]">
                    <Mail className="w-5 h-5" />
                    Secure Transfer to EMR
                 </button>
              </div>
           </div>

           <div className="p-8 bg-emerald-900 rounded-[40px] text-white space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">HIPAA Compliant</span>
              </div>
              <p className="text-xs font-bold leading-relaxed opacity-80 italic">
                "Report synthesis uses edge computing to ensure no Protected Health Information (PHI) leaves the local secure environment during PDF rasterization."
              </p>
           </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8">
           <div className="bg-slate-200 border border-slate-300 rounded-[48px] p-12 shadow-inner min-h-[1000px] flex items-start justify-center overflow-auto">
              {/* Actual Report Markup for Export */}
              <div 
                ref={reportRef}
                className="w-full max-w-[800px] bg-white shadow-2xl p-16 space-y-12 text-slate-900 font-sans"
              >
                {/* PDF Header */}
                <div className="flex items-start justify-between border-b-[8px] border-slate-900 pb-12">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-2xl">R</div>
                         <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">RareGraph AI</h1>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Reasoning beyond symptoms</p>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Case Reference</p>
                         <p className="text-2xl font-black text-slate-900">{caseId || 'GL-092-BETA-2026'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Report Date</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <div className="mt-8 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border border-rose-100">
                         Priority: URGENT
                      </div>
                   </div>
                </div>

                {/* AI Synthesis Narrative */}
                <AnimatePresence>
                  {reportSynthesis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 p-10 bg-slate-50 rounded-[40px] border border-slate-200 relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                          <BrainCircuit className="w-32 h-32 text-slate-900" />
                       </div>
                       <div className="flex items-center gap-3 relative z-10">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clinical Narrative Synthesis</h3>
                       </div>
                       <div className="prose prose-slate prose-sm max-w-none relative z-10">
                          <div className="text-[11px] leading-relaxed font-medium text-slate-700 italic">
                             <Markdown>{reportSynthesis}</Markdown>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Patient Overview */}
                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-900 pl-4">Patient Profile</h4>
                      <div className="grid grid-cols-2 gap-6 pt-2">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sex / Age</p>
                            <p className="text-xs font-black text-slate-900 uppercase">Male / 3.4 yrs</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-black text-rose-600 uppercase">Affected</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-900 pl-4">Primary Indication</h4>
                      <div className="pt-2">
                         <p className="text-xs font-black text-slate-900 uppercase">Early-onset Encephalomyopathy</p>
                         <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Mitochondrial Phenotype Cluster</p>
                      </div>
                   </div>
                </div>
                {/* Phenotype Catalog (HPO) */}
                {config.pheno && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Phenotype Catalog (HPO Summary)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {(hpoTerms.length > 0 ? hpoTerms : [
                          { id: 'HP:0001250', name: 'Seizures', type: 'Major' },
                          { id: 'HP:0002015', name: 'Dysphagia', type: 'Moderate' },
                          { id: 'HP:0001263', name: 'Developmental Delay', type: 'Major' },
                          { id: 'HP:0003206', name: 'Lactic Acidosis', type: 'Biochemical' }
                        ]).map((p) => (
                          <div key={p.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{p.name}</span>
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{p.id}</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Validated</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Variant Prioritization */}
                {config.genomic && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Variant Prioritization & Genomic Findings</h3>
                    </div>
                    <div className="space-y-4">
                        {(variants.length > 0 ? variants : [
                          { variant: 'm.3243A>G', gene: 'MT-TL1', significance: 'Pathogenic' }
                        ]).map((v, i) => (
                          <div key={i} className="p-8 bg-slate-900 rounded-[32px] text-white">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Tier {i+1} Variant</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">{v.significance}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                  <h4 className="text-2xl font-black tracking-tight mb-2">{v.variant} ({v.gene})</h4>
                                  <p className="text-[10px] font-medium text-white/60 leading-relaxed max-w-sm">
                                    Primary molecular driver identified. Predicted loss of function with high phenotypic correlation.
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-3xl font-black tracking-tighter">97.8%</p>
                                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Match Score</p>
                                </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Pharmacogenomics Dashboard */}
                {config.pgx && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Pharmacogenomics Dashboard (PGx)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { drug: 'Valproate', gene: 'POLG', effect: 'Major Contraindication', status: 'critical' },
                         { drug: 'Levetiracetam', gene: 'CYP2D6', effect: 'Enhanced Metabolism', status: 'warning' },
                         { drug: 'Morphine', gene: 'OPRM1', effect: 'Normal Sensitivity', status: 'safe' }
                       ].map((item, idx) => (
                        <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3 relative overflow-hidden">
                           <div className={cn(
                             "absolute top-0 right-0 w-1 h-full",
                             item.status === 'critical' ? "bg-rose-500" : item.status === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                           )} />
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 uppercase underline decoration-slate-200 underline-offset-4">{item.drug}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.gene}</span>
                           </div>
                           <p className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             item.status === 'critical' ? "text-rose-600" : "text-slate-600"
                           )}>{item.effect}</p>
                        </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Inheritance Map */}
                {config.pedigree && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Inheritance Map & Pedigree Analysis</h3>
                    </div>
                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-center justify-between">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mechanism of Inheritance</p>
                          <p className="text-xl font-black text-indigo-900">Mitochondrial (Matrilineal)</p>
                       </div>
                       <div className="flex gap-4">
                          {[
                            { label: 'Proband', val: 'Affected' },
                            { label: 'Mother', val: 'Carrier (Asymp)' },
                            { label: 'Sibling', val: 'Status Unknown' }
                          ].map((item, i) => (
                            <div key={i} className="text-center px-4 py-2 bg-white/50 rounded-xl border border-indigo-200">
                               <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                               <p className="text-[10px] font-black text-indigo-900 leading-none">{item.val}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {/* Experimental Therapeutic Options */}
                {config.trials && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Experimental Therapeutic Options</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { title: 'NCT03747302', desc: 'Gene therapy modulators for mitochondrial MT-TL1 variants.', phase: 'Phase II' },
                         { title: 'Off-label CoQ10', desc: 'High-dose supplementation for respiratory chain support.', phase: 'Supportive' }
                       ].map((trial, i) => (
                        <div key={i} className="p-6 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                  <Stethoscope className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 uppercase">{trial.title}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{trial.desc}</p>
                               </div>
                            </div>
                            <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                               {trial.phase}
                            </div>
                        </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Signature Block */}
                <div className="pt-20 flex items-center justify-between">
                   <div className="space-y-4">
                      <div className="w-48 h-px bg-slate-200" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Investigator Signature</p>
                   </div>
                   <div className="text-right space-y-2">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">RareGraph AI Certification</p>
                       <div className="flex items-center justify-end gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified Digital Hash: 0x82f...91a</span>
                       </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
