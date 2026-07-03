import { useState } from 'react';
import { Search, BookOpen, Loader2, FileText, ExternalLink, Bookmark, Brain, Heart, Eye, Activity, Zap, Layers, Sparkles, Dna, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { summarizeLiterature } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function LiteraturePage() {
  const [topic, setTopic] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setIsSearching(true);
    try {
      const res = await summarizeLiterature(topic);
      setSummary(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">Biomedical Literature Assistant</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed font-bold">
          Search across clinical literature and rare disease databases. Gemini synthesizes recent findings, phenotype patterns, and gene associations.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group max-w-4xl mx-auto">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          {topic.match(/HP:\d{7}/i) ? (
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1 rounded">HPO</span>
            </div>
          ) : topic.match(/(OMIM:)?\d{6}/i) ? (
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-1 rounded">OMIM</span>
            </div>
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          )}
        </div>
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter Gene, HPO (HP:0001234), OMIM (#123456), or condition..."
          className="w-full bg-white border border-slate-200 rounded-lg py-6 pl-20 pr-40 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-600 shadow-xl shadow-slate-200/50 transition-all font-bold"
        />
        <button 
          type="submit"
          disabled={isSearching || !topic}
          className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-all flex items-center gap-3 shadow-lg shadow-blue-600/20"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          Run Synthesis
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto -mt-6">
        {[
          { label: 'HP:0001324', type: 'HPO' },
          { label: 'HP:0000407', type: 'HPO' },
          { label: '520000', type: 'OMIM' },
          { label: '300377', type: 'OMIM' },
        ].map(id => (
          <button
            key={id.label}
            onClick={() => setTopic(id.label)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
          >
            {id.type}: {id.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {summary ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 max-w-4xl mx-auto"
          >
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Literature Synthesis v1.0</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toast.success('Citation Saved', { description: 'Added to your personal research library.' })}
                  className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors active:scale-90"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (topic) {
                      toast.info('Opening source document', { description: 'Redirecting to PubMed Central...' });
                      setTimeout(() => {
                        window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic)}`, '_blank');
                      }, 1000);
                    } else {
                      toast.error('No topic selected');
                    }
                  }}
                  className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors active:scale-90"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-8 lg:p-12 max-w-none">
              <div className="markdown-body">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ) : (
          !isSearching && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "MELAS Syndrome", icon: <Zap className="w-5 h-5 text-amber-500" />, desc: "Mitochondrial Encephalopathy, Lactic Acidosis, and Stroke-like episodes.", tags: ["Mitochondria", "MT-TL1"] },
                { title: "KCNQ2 Seizures", icon: <Brain className="w-5 h-5 text-purple-500" />, desc: "Early infantile epileptic encephalopathy related to potassium channel variants.", tags: ["Epileptic", "KCNQ2"] },
                { title: "RPE65 Therapy", icon: <Eye className="w-5 h-5 text-emerald-500" />, desc: "Gene augmentation therapy for Leber Congenital Amaurosis (LCA).", tags: ["Ocular", "RPE65", "CRISPR"] },
                { title: "Brugada Syndrome", icon: <Heart className="w-5 h-5 text-red-500" />, desc: "Genetic arrhythmia characterized by right precordial ST-segment elevation.", tags: ["Cardiac", "SCN5A"] },
                { title: "Angelman Syndrome", icon: <Activity className="w-5 h-5 text-indigo-500" />, desc: "Severe developmental delay and happy demeanor linked to UBE3A.", tags: ["Neuro", "UBE3A"] },
                { title: "SMA Spinraza", icon: <Layers className="w-5 h-5 text-blue-500" />, desc: "Nusinersen-based treatment for Spinal Muscular Atrophy types.", tags: ["Muscular", "SMN1", "SMN2"] },
                { title: "Fabry ERT", icon: <Sparkles className="w-5 h-5 text-pink-500" />, desc: "Enzyme replacement therapy and chaperone protocols for GLA variants.", tags: ["Metabolic", "GLA"] },
                { title: "Huntington ASO", icon: <Dna className="w-5 h-5 text-orange-500" />, desc: "Antisense oligonucleotide (ASO) strategies for HTT gene silencing.", tags: ["Neuro", "HTT"] },
                { title: "hEDS Guidelines", icon: <ShieldCheck className="w-5 h-5 text-cyan-500" />, desc: "Clinical management of POTS and chronic pain in hypermobile patients.", tags: ["Connective", "POTS"] },
              ].map((rec, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-600 cursor-pointer transition-all flex flex-col group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  onClick={() => { setTopic(rec.title); }}
                >
                  <div className="mb-4 bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {rec.icon}
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{rec.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4 font-bold">{rec.desc}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {rec.tags.map(t => (
                      <span key={t} className="text-[8px] font-mono text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded leading-none font-bold uppercase tracking-widest bg-slate-50/50 group-hover:bg-blue-50/50 group-hover:text-blue-500 transition-colors">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
