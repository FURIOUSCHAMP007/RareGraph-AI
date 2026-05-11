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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Diagnostic Engine</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Neuro-Symbolic Rare Disease Inference</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Input Section */}
        <div className="xl:col-span-4 space-y-4">
          <section className="bg-white rounded-[32px] border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Intake Panel</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Live Synth</span>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {sampleCases.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => applySample(sc)}
                    className="flex flex-col items-center gap-1.5 group w-full"
                    title={sc.title}
                  >
                    <div className={cn(
                      "w-full aspect-square rounded-xl border-2 border-transparent group-hover:border-slate-900 transition-all flex items-center justify-center overflow-hidden shadow-sm relative active:scale-90", 
                      sc.color
                    )}>
                       <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                       <span className="text-[9px] font-black text-white relative z-10">{sc.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Protocol</p>
                   <p className="text-[10px] text-slate-900 font-mono font-black tracking-tight">RG-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                   <Database className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <label className="flex items-center gap-2"><Activity className="w-3 h-3" /> Manifestations</label>
                  <span className={cn(symptoms.length > 1000 ? "text-rose-500" : "text-slate-300")}>
                    {symptoms.length}/1k
                  </span>
                </div>
                
                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value.slice(0, 1000))}
                  placeholder="Observable symptoms and severity..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <label className="flex items-center gap-2"><Stethoscope className="w-3 h-3" /> History</label>
                </div>
                <textarea 
                  value={history}
                  onChange={(e) => setHistory(e.target.value.slice(0, 500))}
                  placeholder="Developmental and family background..."
                  className="w-full h-20 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <label className="flex items-center gap-2"><Dna className="w-3 h-3" /> Genetics</label>
                </div>
                <textarea 
                  value={genetics}
                  onChange={(e) => setGenetics(e.target.value.slice(0, 500))}
                  placeholder="Mutations, panels, or VUS details..."
                  className="w-full h-20 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Evidence Uploads</h3>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center justify-center gap-3 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 cursor-pointer transition-all group">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Append Patient Scans</span>
                  </label>
                  {files.map((file, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-1.5 rounded-full", file.type.startsWith('image/') ? "bg-blue-500" : "bg-emerald-500")}></div>
                        <span className="text-[9px] font-mono font-black text-slate-500 truncate max-w-[150px] uppercase">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!symptoms && files.length === 0)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reasoning Across Nodes...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  Initiate Inference
                </>
              )}
            </button>
          </section>
        </div>

        {/* Results Section */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {result ? (
                      <motion.div 
                        key="result-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                      >
                        <div className="lg:col-span-7 space-y-6">
                          {/* Reasoning Timeline */}
                          <section className="relative pl-12 flex flex-col gap-10">
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
                            
                            {/* Step 01 */}
                            <div className="relative">
                              <div className="absolute -left-[38px] top-0 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg z-10">
                                <span className="text-[9px] font-black text-white">01</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Identified HPO Vectors</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {result.hpo_terms.map(hpo => (
                                  <button 
                                    key={hpo.id} 
                                    className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all shadow-sm"
                                  >
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{hpo.name}</span>
                                    <span className="text-[8px] font-mono font-black text-slate-300 group-hover:text-blue-500">#{hpo.id}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Step 02 */}
                            <div className="relative">
                              <div className="absolute -left-[38px] top-0 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg z-10">
                                <span className="text-[9px] font-black text-white">02</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Expert Reasoning Chain</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="p-6 bg-white border border-slate-200 rounded-[32px] text-slate-700 text-sm leading-relaxed shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                <div className="prose prose-sm max-w-none prose-slate font-bold selection:bg-blue-100 italic relative z-10">
                                  <Markdown>{result.reasoning_chain}</Markdown>
                                </div>
                              </div>
                            </div>

                            {/* Step 03 */}
                            <div className="relative">
                              <div className="absolute -left-[38px] top-0 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg z-10">
                                <span className="text-[9px] font-black text-white">03</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Diagnostic Protocols</h4>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[32px]">
                                   <div className="flex items-center gap-2 mb-3">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                      <p className="text-[9px] font-black text-rose-900 uppercase tracking-widest">Evidence Gaps</p>
                                   </div>
                                   <ul className="space-y-2">
                                     {result.missing_evidence.map((me, i) => (
                                       <li key={i} className="text-[9px] text-rose-900/60 flex gap-2 font-black leading-tight uppercase">
                                         <span className="text-rose-400 shrink-0">•</span> {me}
                                       </li>
                                     ))}
                                   </ul>
                                </div>
                                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[32px]">
                                   <div className="flex items-center gap-2 mb-3">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      <p className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">Action Items</p>
                                   </div>
                                   <ul className="space-y-2">
                                     {result.recommended_tests.map((rt, i) => (
                                       <li key={i} className="text-[9px] text-emerald-900/60 flex gap-2 font-black leading-tight uppercase">
                                         <span className="text-emerald-400 shrink-0">✓</span> {rt}
                                       </li>
                                     ))}
                                   </ul>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                          <section className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                            
                            <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/10 uppercase tracking-widest">
                                 <h4 className="text-[10px] font-black text-blue-200">Clinical Differential</h4>
                                 <Database className="w-4 h-4 text-white/30" />
                              </div>
                              
                              <div className="space-y-4 flex-1">
                                {result.diseases.map((disease, idx) => (
                                  <div 
                                    key={idx}
                                    className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group/card active:scale-[0.98]"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest",
                                        idx === 0 ? "bg-blue-500 text-white" : "bg-white/10 text-slate-400"
                                      )}>
                                        {(disease.confidence * 100).toFixed(0)}% MATCH
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-white/20 group-hover/card:translate-x-1 transition-transform" />
                                    </div>
                                    <h5 className="text-lg font-black uppercase tracking-tight mb-2 leading-tight">
                                      {disease.name}
                                    </h5>
                                    <div className="flex gap-1.5 mt-4">
                                       {[1,2,3,4,5].map(dot => (
                                          <div key={dot} className={cn(
                                            "h-1 px-3 rounded-full transition-all duration-700",
                                            dot <= disease.confidence * 5 ? (idx === 0 ? "bg-blue-400 w-full" : "bg-white/40 w-full") : "bg-white/5 w-4"
                                          )} />
                                       ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-8 pt-8 border-t border-white/5">
                                 <div className="flex items-center gap-4 group/btn">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/btn:bg-blue-600 transition-colors">
                                       <Share2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                       <button className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors block text-left">Internal Case Share</button>
                                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Secure Node Transfer</span>
                                    </div>
                                 </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center p-12 bg-white border border-slate-200 border-dashed rounded-[40px] text-center">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-inner group transition-all hover:scale-110">
                  <BrainCircuit className="w-10 h-10 text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4">Engine Standby</h3>
                <p className="text-[10px] text-slate-400 max-w-[240px] uppercase font-black leading-relaxed tracking-widest">
                  Await clinical input mapping to trigger automated differential synthesis
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
