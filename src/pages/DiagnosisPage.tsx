import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  BrainCircuit, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Dna,
  X,
  Activity,
  Database,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { diagnosePatient } from '../services/geminiService';
import { DiagnosisResult, HPOTerm, Disease } from '../types';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function DiagnosisPage() {
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [genetics, setGenetics] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; type: string; data: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!symptoms && files.length === 0) return;
    setIsAnalyzing(true);
    try {
      const diagnosis = await diagnosePatient(symptoms, history, genetics, files);
      setResult(diagnosis);
    } catch (error) {
      console.error("Diagnosis failed:", error);
      alert("System processing error. Please verify input data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sampleCases = [
    {
      id: "MELAS",
      title: "Mitochondrial Syndrome",
      label: "MELAS",
      symptoms: "Bilateral muscle weakness, intermittent exercise intolerance, frequent severe headaches, recent focal seizure followed by transient hemiparesis.",
      history: "Normal development until age 6. Short stature compared to siblings. Maternal uncle had early-onset hearing loss and strokes in his 30s.",
      genetics: "Suspected mitochondrial inheritance. Lactic acid elevated (4.2 mmol/L). WES pending.",
      color: "bg-rose-500"
    },
    {
      id: "EDS",
      title: "Connective Tissue Disorder",
      label: "hEDS",
      symptoms: "Chronic widespread joint pain, frequent subluxations of shoulders and hips, velvety skin, easy bruising without significant trauma.",
      history: "History of gastric reflux (GERD) and postural orthostatic tachycardia (POTS). Positive Beighton score (8/9).",
      genetics: "No known variants in COL5A1/COL5A2. Negative for vascular EDS markers.",
      color: "bg-amber-500"
    },
    {
      id: "FABRY",
      title: "Lysosomal Storage Disease",
      label: "Fabry",
      symptoms: "Burning pain in hands and feet (acroparesthesia) triggered by heat or exercise. Cluster of small reddish-purple spots on lower trunk (angiokeratomas).",
      history: "Decreased ability to sweat (hypohidrosis). Recent ophthalmologist report mentions 'cornea verticillata'. Unexplained proteinuria.",
      genetics: "GLA gene sequencing requested. Family history of early renal failure in paternal grandfather.",
      color: "bg-blue-600"
    },
    {
      id: "HD",
      title: "Neurodegenerative Condition",
      label: "HD",
      symptoms: "Involuntary jerking movements (chorea) in arms and face. Significant irritability, depression, and social withdrawal over the last 12 months.",
      history: "Paternal side history unknown but uncle reportedly had 'personality changes' and walking difficulties before passing at 50.",
      genetics: "CAG repeat expansion testing in HTT gene pending.",
      color: "bg-indigo-600"
    },
    {
      id: "USHER",
      title: "Neurosensory Dual Loss",
      label: "Usher II",
      symptoms: "Progressive night blindness and loss of peripheral vision. Moderate sensorineural hearing loss since birth.",
      history: "Stable hearing loss using aids. No vestibular issues (can walk in dark relatively well). Retinal examination shows 'bone spicule' pigmentation.",
      genetics: "Candidate genes: USH2A, MYO7A, GPR98.",
      color: "bg-emerald-600"
    }
  ];

  const applySample = (sc: typeof sampleCases[0]) => {
    setSymptoms(sc.symptoms);
    setHistory(sc.history);
    setGenetics(sc.genetics);
    toast.success(`Case Loaded: ${sc.title}`, { description: "Clinical parameters pre-populated for inference." });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-12">
      {/* Input Section */}
      <div className="xl:col-span-4 space-y-4">
        <section className="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Clinical Intake</h3>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[8px] font-mono text-blue-600 font-black">LIVE ENGINE</span>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-5 gap-2">
              {sampleCases.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => applySample(sc)}
                  className="flex flex-col items-center gap-1 group w-full"
                  title={sc.title}
                >
                  <div className={cn(
                    "w-full aspect-square rounded-lg border-2 border-transparent group-hover:border-slate-400 transition-all flex items-center justify-center overflow-hidden shadow-sm relative", 
                    sc.color
                  )}>
                     <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                     <span className="text-[9px] font-black text-white relative z-10">{sc.label}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase group-hover:text-slate-900 transition-colors">Case</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 mt-2">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Active Session</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-tighter font-bold">ID: #RG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <label>Observable Symptoms</label>
                <span className={cn(symptoms.length > 1000 ? "text-red-500" : "text-slate-300")}>
                  {symptoms.length}/1000
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-2 py-2">
                {[
                  "Muscle weakness", "Exercise intolerance", "Seizures", 
                  "Severe headache", "Joint pain", "Acroparesthesia", 
                  "Night blindness", "Depression", "Dystonia", 
                  "Proteinuria", "Vertigo"
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (!symptoms.includes(s)) {
                        setSymptoms(prev => (prev ? `${prev.trim()}, ${s}` : s).slice(0, 1000));
                        toast.info(`Phenotype Added: ${s}`, { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> });
                      }
                    }}
                    className={cn(
                      "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border transition-all active:scale-95",
                      symptoms.includes(s) 
                        ? "bg-blue-600 border-blue-700 text-white shadow-sm" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value.slice(0, 1000))}
                placeholder="Enter physical manifestations, duration, and severity (e.g., 'Bilateral muscle weakness starting in lower limbs...')"
                className="w-full h-24 bg-white border border-slate-200 rounded p-3 text-xs font-mono text-slate-700 focus:border-blue-600 outline-none transition-all resize-none placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <label>Clinical History</label>
                <span className={cn(history.length > 500 ? "text-red-500" : "text-slate-300")}>
                  {history.length}/500
                </span>
              </div>
              <textarea 
                value={history}
                onChange={(e) => setHistory(e.target.value.slice(0, 500))}
                placeholder="Previous diagnoses, developmental milestones, and family history..."
                className="w-full h-20 bg-white border border-slate-200 rounded p-3 text-xs font-mono text-slate-700 focus:border-blue-600 outline-none transition-all resize-none placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <label>Genetic Context</label>
                <span className={cn(genetics.length > 500 ? "text-red-500" : "text-slate-300")}>
                  {genetics.length}/500
                </span>
              </div>
              <div className="relative">
                <textarea 
                  value={genetics}
                  onChange={(e) => setGenetics(e.target.value.slice(0, 500))}
                  placeholder="Insert VUS, WES/WGS variants, or relevant gene panels..."
                  className="w-full h-20 bg-white border border-slate-200 rounded p-3 pr-8 text-xs font-mono text-slate-700 focus:border-blue-600 outline-none transition-all resize-none placeholder:text-slate-300"
                />
                <Dna className="absolute top-2 right-2 w-4 h-4 text-blue-200" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multimodal Evidence</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-dashed border-slate-200 rounded hover:bg-slate-100 cursor-pointer transition-all">
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Upload Clinical Scans...</span>
                </label>
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", file.type.startsWith('image/') ? "bg-blue-500" : "bg-green-500")}></div>
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!symptoms && files.length === 0)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                Run Diagnosis
              </>
            )}
          </button>
        </section>
      </div>

      {/* Results Section */}
      <div className="xl:col-span-8 space-y-4">
        <AnimatePresence mode="wait">
          {result ? (
                    <motion.div 
                      key="result-content"
                      variants={{
                        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } }
                      }}
                      initial={{ opacity: 0, y: 15 }}
                      animate="show"
                      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                      <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                        {/* Reasoning Timeline */}
                        <section className="relative pl-12 sm:pl-16">
                          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-slate-200" />
                          
                          <div className="space-y-12">
                            {/* Step 01 */}
                            <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                              <div className="absolute -left-[54px] sm:-left-[60px] top-0 w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-sm z-10 transition-transform hover:scale-110">
                                <span className="text-[10px] font-black text-blue-600 font-mono">01</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Phenotype Extraction</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                <div className="flex flex-wrap gap-2">
                                  {result.hpo_terms.map(hpo => (
                                    <button 
                                      key={hpo.id} 
                                      onClick={() => toast.info(`HPO Detail: ${hpo.name}`, { description: `Standardized identifier: ${hpo.id}` })}
                                      className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-blue-600 border border-slate-200 hover:border-blue-700 rounded-lg transition-all active:scale-95"
                                    >
                                      <span className="text-[10px] font-bold text-slate-700 group-hover:text-white uppercase tracking-tight">{hpo.name}</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-blue-200">#{hpo.id}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>

                            {/* Step 02 */}
                            <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                              <div className="absolute -left-[54px] sm:-left-[60px] top-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm z-10">
                                <span className="text-[10px] font-black text-slate-400 font-mono">02</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Clinical Reasoning</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="p-7 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-l-4 border-l-blue-600/30">
                                <div className="prose prose-sm max-w-none prose-slate font-medium selection:bg-blue-100 italic font-serif text-slate-700 line-height-[1.8]">
                                  <Markdown>{result.reasoning_chain}</Markdown>
                                </div>
                              </div>
                            </motion.div>

                            {/* Step 03 */}
                            <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                              <div className="absolute -left-[54px] sm:-left-[60px] top-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm z-10">
                                <span className="text-[10px] font-black text-slate-400 font-mono">03</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Genomic Protocols</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-rose-50/30 border border-rose-100 rounded-xl">
                                   <div className="flex items-center gap-2 mb-3">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                      <p className="text-[9px] font-black text-rose-800 uppercase tracking-widest">Evidence Gap</p>
                                   </div>
                                   <ul className="space-y-2">
                                     {result.missing_evidence.map((me, i) => (
                                       <li key={i} className="text-[10px] text-rose-900/70 flex gap-3 font-bold leading-tight">
                                         <span className="text-rose-400 shrink-0">•</span> {me}
                                       </li>
                                     ))}
                                   </ul>
                                </div>
                                <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-xl">
                                   <div className="flex items-center gap-2 mb-3">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Inference Path</p>
                                   </div>
                                   <ul className="space-y-2">
                                     {result.recommended_tests.map((rt, i) => (
                                       <li key={i} className="text-[10px] text-emerald-900/70 flex gap-3 font-bold leading-tight">
                                         <span className="text-emerald-400 shrink-0">✓</span> {rt}
                                       </li>
                                     ))}
                                   </ul>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </section>
                      </div>

                      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                        {/* Ranked Diagnoses */}
                        <section className="bg-white p-7 border border-slate-200 rounded-2xl flex flex-col h-full shadow-lg shadow-slate-200/40">
                          <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                             <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Differential</h4>
                             <Database className="w-4 h-4 text-slate-300" />
                          </div>
                          
                          <div className="space-y-3">
                            {result.diseases.map((disease, idx) => (
                              <motion.div 
                                key={idx}
                                variants={{ hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } }}
                                onClick={() => toast.info(`Investigating ${disease.name}`, { description: `Confidence level calculated at ${(disease.confidence * 100).toFixed(1)}%` })}
                                className={cn(
                                "group p-5 bg-white rounded-xl relative overflow-hidden transition-all border cursor-pointer active:scale-[0.98]",
                                idx === 0 ? "border-blue-200 ring-1 ring-blue-50 bg-gradient-to-br from-blue-50/50 to-white" : "border-slate-100 hover:border-slate-200"
                              )}>
                                <div className="flex justify-between items-start mb-3">
                                  <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest",
                                    idx === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                  )}>
                                    {(disease.confidence * 100).toFixed(1)}%
                                  </div>
                                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform group-hover:translate-x-1", idx === 0 ? "text-blue-600" : "text-slate-300")} />
                                </div>
                                
                                <h5 className={cn("text-xs font-black uppercase tracking-tight mb-2", idx === 0 ? "text-blue-900" : "text-slate-800")}>
                                  {disease.name}
                                </h5>
                                
                                <p className="text-[10px] text-slate-500 leading-relaxed mb-5 font-bold">
                                  {disease.reasoning.substring(0, 120)}...
                                </p>
                                
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${disease.confidence * 100}%` }}
                                    className={cn("h-full transition-all duration-1000 ease-out", idx === 0 ? "bg-blue-600" : "bg-slate-300")}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="mt-8">
                            <div className="p-6 bg-slate-900 rounded-xl relative overflow-hidden group border border-slate-800 shadow-xl">
                              <div className="relative z-10 text-center">
                                 <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-3 border border-blue-500/30 group-hover:scale-110 transition-transform">
                                   <BrainCircuit className="w-5 h-5 text-blue-400" />
                                 </div>
                                 <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-400 block mb-1">Engine Synthesis</span>
                                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Abstract Node Mapping Active</p>
                              </div>
                              {/* Abstract visual background */}
                              <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
                                <svg width="100%" height="100%" className="blur-[1px]">
                                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="1.5" fill="#3b82f6" />
                                  </pattern>
                                  <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl border-dashed">
              <div className="w-16 h-16 rounded bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                <BrainCircuit className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Awaiting Diagnostic Run</h3>
              <p className="text-xs text-slate-400 max-w-xs text-center border-t border-slate-100 pt-4 mt-2">
                Populate clinical fields in the lateral panel to initiate neuro-symbolic reasoning.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
