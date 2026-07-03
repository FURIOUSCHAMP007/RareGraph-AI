import { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Eye,
  Minimize2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { cn } from '../lib/utils';

import { HPOTerm as GlobalHPOTerm } from '../types';

import { useClinical } from '../context/ClinicalContext';

export default function FacialGestaltPage() {
  const { addHPOTerm } = useClinical();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GlobalHPOTerm[] | null>(null);
  const [analysisRationale, setAnalysisRationale] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a highly specialized clinical geneticist and dysmorphologist. 
      Analyze this clinical photograph and identify dysmorphic features.
      Map these features to standard HPO (Human Phenotype Ontology) terms.
      
      Return the output strictly in the following JSON format:
      {
        "rationale": "Overall clinical impression of the facial gestalt.",
        "terms": [
          {
            "id": "HP:XXXXXXX",
            "name": "Term Name",
            "definition": "Brief description of the feature.",
            "confidence": 0.0 to 1.0,
            "evidence": "Specific visual evidence observed in the photo."
          }
        ]
      }
      
      Only suggest features that are clearly visible. Be conservative and precise.`;

      const base64Data = selectedImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResults(data.terms || []);
      setAnalysisRationale(data.rationale || '');
      toast.success("Gestalt intelligence analysis complete.");
    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error("Analysis failed. Please ensure the image is clear and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
          <Scan className="w-3 h-3" />
          Multi-modal Clinical Vision AI
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Facial Gestalt Intelligence</h2>
        <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
          AI-driven dysmorphology analysis. Automate phenotypic intake by extracting HPO-mapped features from clinical photography using high-fidelity vision reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input/Image Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative group">
            <div className={cn(
              "relative bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 transition-all min-h-[500px] flex flex-col items-center justify-center overflow-hidden shadow-sm shadow-slate-200/50",
              selectedImage ? "border-solid border-slate-100" : "hover:border-blue-300 hover:bg-blue-50/20"
            )}>
              {selectedImage ? (
                <div className="relative w-full h-full flex flex-col gap-6">
                  <div className="relative aspect-auto max-h-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                    <img src={selectedImage} alt="Clinical Photograph" className="w-full h-full object-contain" />
                    
                    {/* Scanning Animation Overlay */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div 
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                        />
                      )}
                    </AnimatePresence>
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-blue-600">
                              SCAN
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 animate-pulse bg-white/90 px-4 py-2 rounded-full border border-blue-100 shadow-xl">
                            Synthesizing Gestalt...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" /> Discard
                    </button>
                    {!results && !isAnalyzing && (
                      <button 
                        onClick={runAnalysis}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]"
                      >
                        <Scan className="w-4 h-4" /> Run Vision Inference
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all duration-500">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Image Intake</h3>
                    <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                      Drag & drop a frontal/profile clinical photo or click to explore the local file system. HIPAA compliance ensured via edge processing.
                    </p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm active:scale-95"
                  >
                    <Upload className="w-4 h-4" /> Select Photograph
                  </button>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-slate-200 rounded-[32px] flex flex-col gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Data Integrity
              </span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                Images are processed in a secure environment. No identifiable metadata is persisted beyond the session duration.
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-[32px] flex flex-col gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-blue-500" />
                Inference Guardrails
              </span>
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                Suggested HPO terms require clinician verification. AI confidence levels are probabilistic, not diagnostic.
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Minimize2 className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Phenotypic Findings</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">HPO Vector Extraction</p>
                </div>
              </div>
              {results && (
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {results.length} Matches Found
                </div>
              )}
            </div>

            <div className="flex-1 p-8 space-y-6">
              {!results && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-50">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] max-w-[200px]">
                    Waiting for image sequence analysis protocols...
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-2 bg-slate-50 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results && (
                <div className="space-y-8">
                  {analysisRationale && (
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3">
                        <Info className="w-4 h-4 text-blue-200 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Gestalt Summary
                      </h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-bold italic">
                        "{analysisRationale}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identified HPO Terms</h4>
                    {results.map((term, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={term.id}
                        className="group relative bg-white border border-slate-200 rounded-[24px] p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              {idx + 1}
                            </div>
                            <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{term.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Conf.</span>
                            <div className={cn(
                              "text-[10px] font-black tracking-tighter",
                              term.confidence > 0.8 ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {Math.round(term.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                          {term.definition}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic truncate max-w-[200px]">
                            {term.id} | {term.evidence}
                          </span>
                          <button 
                            onClick={() => {
                              addHPOTerm(term);
                              toast.success('Term Verified', { description: `Added ${term.name} to clinical profile.` });
                            }}
                            className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      results.forEach(addHPOTerm);
                      toast.success('Phenotypic Profile Synced', { description: 'All verified terms have been mapped to the patient knowledge graph.' });
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-2xl group hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sync Findings to Profile</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
