import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  Tag as TagIcon, 
  Clipboard, 
  Trash2, 
  CheckCircle2, 
  Activity,
  Info,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { extractHPOTerms } from '../services/geminiService';
import { HPOTerm } from '../types';
import { cn } from '../lib/utils';

import { useClinical } from '../context/ClinicalContext';

export default function EntitizerPage() {
  const { addHPOTerm } = useClinical();
  const [note, setNote] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTerms, setExtractedTerms] = useState<HPOTerm[]>([]);

  const handleSync = () => {
    if (extractedTerms.length === 0) return;
    extractedTerms.forEach(term => addHPOTerm({
      id: term.id,
      name: term.name || '',
      definition: term.definition || '',
      confidence: term.confidence || 0.8,
      evidence: term.evidence || 'System Extraction'
    }));
    toast.success('Phenotypes synced to clinical profile.', {
      description: `${extractedTerms.length} terms added to the global knowledge base.`
    });
  };

  const handleExtract = async () => {
    if (!note.trim()) {
      toast.error('Please enter a clinical note first.');
      return;
    }

    setIsExtracting(true);
    try {
      const terms = await extractHPOTerms(note);
      setExtractedTerms(terms);
      toast.success(`Extracted ${terms.length} phenotypic entities.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to extract phenotypes. Please check your API configuration.');
    } finally {
      setIsExtracting(false);
    }
  };

  const sampleNotes = [
    {
      label: "Mitochondrial",
      text: "Patient is a 12-year-old male presenting with progressive muscle weakness, intermittent exercise intolerance, frequent severe headaches, recent focal seizure, and developmental delay. Clinical examination reveals short stature and bilateral sensorineural hearing loss. Lab results show elevated serum lactate (4.5 mmol/L)."
    },
    {
      label: "Connective",
      text: "24-year-old female with chronic widespread joint pain and recurrent subluxations of both shoulders and hips. Skin is hyperelastic and velvety with poor wound healing. Patient reports frequent postural dizziness and fainting spells. Systemic assessment reveals mild mitral valve prolapse (MVP)."
    },
    {
      label: "Metabolic",
      text: "Infant male presenting with failure to thrive and recurrent metabolic acidosis. Clinical observations include coarse facial features, hepatosplenomegaly, and umbilical hernia. Developmental milestones are significantly delayed. Skeletal survey shows dysostosis multiplex."
    },
    {
      label: "Neurological",
      text: "45-year-old male presenting with choreiform movements and progressive cognitive impairment. Family history reveals a parent with similar early-onset dementia and involuntary movements. Patient exhibits executive dysfunction and significant behavioral changes including apathy."
    },
    {
      label: "Ocular/Renal",
      text: "8-year-old child with progressive night blindness and constricted visual fields. Audiometry confirms moderate sensorineural hearing loss. Additional labs reveal impaired renal function and proteinuria. Suspected Alport or Usher syndrome overlap."
    }
  ];

  const loadSample = (sample: typeof sampleNotes[0]) => {
    setNote(sample.text);
    toast.info(`Sample Loaded: ${sample.label}`);
  };

  const handleClear = () => {
    setNote('');
    setExtractedTerms([]);
  };

  const handleCopy = () => {
    const text = extractedTerms.map(t => `${t.id}: ${t.name}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('HPO terms copied to clipboard.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Note Entitizer</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">AI-Powered HPO Term Extraction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Region */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col h-[520px]">
            <div className="flex flex-col gap-4 mb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical History Input</h3>
                </div>
                <button 
                  onClick={handleClear}
                  className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                 {sampleNotes.map(sn => (
                   <button 
                    key={sn.label}
                    onClick={() => loadSample(sn)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 hover:border-slate-900 text-[9px] font-black uppercase tracking-widest text-slate-600 rounded-lg transition-all active:scale-95"
                   >
                     {sn.label}
                   </button>
                 ))}
              </div>
            </div>
            
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Paste raw clinical notes, patient history, or observation reports here..."
              className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-sm leading-relaxed text-slate-700 font-bold placeholder:text-slate-300 shadow-inner"
            />

            <button
              onClick={handleExtract}
              disabled={isExtracting || !note.trim()}
              className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              <Sparkles className={cn("w-4 h-4 text-blue-200", isExtracting && "animate-spin")} />
              {isExtracting ? 'Synthesizing Knowledge...' : 'Extract Phenotypes'}
            </button>
          </div>
        </div>

        {/* Output Region */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col h-[520px] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
             
             <div className="flex items-center justify-between mb-6 relative z-10 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <TagIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted HPO Entities</h3>
                </div>
                {extractedTerms.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSync}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Sync to Profile
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                      <Clipboard className="w-3 h-3" /> Copy Metadata
                    </button>
                  </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                <AnimatePresence mode="popLayout">
                  {extractedTerms.length > 0 ? (
                    <div className="space-y-3 pb-4">
                      {extractedTerms.map((term, i) => (
                        <motion.div
                          key={term.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-300 hover:bg-white transition-all cursor-pointer shadow-sm hover:translate-x-1"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{term.name}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-mono text-blue-500 font-black bg-blue-50 px-1.5 py-0.5 rounded uppercase">{term.id}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 uppercase font-black tracking-widest">{term.category}</span>
                                 </div>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 transition-all" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                       <Activity className={cn("w-16 h-16 text-slate-200 mb-6", isExtracting && "animate-pulse")} />
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
                         {isExtracting ? 'Synthesizing clinical linguistics...' : 'Awaiting diagnostic input for phenotypic mapping'}
                       </p>
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl flex items-center gap-6 group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-[60px] opacity-20" />
             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-white/10 transition-all shrink-0">
                <Info className="w-7 h-7" />
             </div>
             <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Diagnostic Intelligence</h4>
                <p className="text-[11px] font-bold leading-tight text-slate-300 uppercase tracking-wide">
                  Automated phenotyping reduces data entry friction by <span className="text-white underline decoration-blue-500 underline-offset-4">up to 92%</span>.
                </p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
