import { useState } from 'react';
import { Search, Loader2, Database, Copy, ExternalLink, Dna, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { queryBiomedicalRegistry } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const REGISTRIES_METADATA = [
  {
    id: 'ClinVar' as const,
    name: 'ClinVar',
    fullName: 'NCBI ClinVar Genomic Variant Registry',
    desc: 'Public archive of reports of the relationships among human variations and phenotypes with supporting evidence.',
    colorClass: 'border-indigo-200 bg-indigo-50/20 text-indigo-700',
    activeColorClass: 'ring-2 ring-indigo-600 border-indigo-200 bg-indigo-50/40',
    icon: <Dna className="w-5 h-5 text-indigo-600" />,
    placeholder: "e.g., MT-TL1 m.3243A>G, DMD c.583G>T, or ClinVar ID 9721",
    shortcuts: [
      { label: 'm.3243A>G (MT-TL1)', query: 'MT-TL1 m.3243A>G' },
      { label: 'ClinVar ID: 9721', query: '9721' },
      { label: 'DMD c.583G>T', query: 'DMD c.583G>T' },
      { label: 'GLA c.901C>T', query: 'GLA c.901C>T' }
    ]
  },
  {
    id: 'OMIM' as const,
    name: 'OMIM',
    fullName: 'Online Mendelian Inheritance in Man',
    desc: 'Comprehensive, authoritative compendium of human genes and genetic phenotypes.',
    colorClass: 'border-emerald-200 bg-emerald-50/20 text-emerald-700',
    activeColorClass: 'ring-2 ring-emerald-600 border-emerald-200 bg-emerald-50/40',
    icon: <Layers className="w-5 h-5 text-emerald-600" />,
    placeholder: "e.g., 540000 (MELAS), 310200 (DMD), or disease name",
    shortcuts: [
      { label: '540000 (MELAS)', query: '540000' },
      { label: '310200 (DMD)', query: '310200' },
      { label: '301500 (Fabry)', query: '301500' },
      { label: '100600 (Acanthosis)', query: '100600' }
    ]
  },
  {
    id: 'Orphanet' as const,
    name: 'Orphanet',
    fullName: 'Orphanet Rare Diseases & Orphan Drugs',
    desc: 'The portal for rare diseases and orphan drugs, offering high-quality classifications and epidemiology.',
    colorClass: 'border-amber-200 bg-amber-50/20 text-amber-700',
    activeColorClass: 'ring-2 ring-amber-600 border-amber-200 bg-amber-50/40',
    icon: <Sparkles className="w-5 h-5 text-amber-600" />,
    placeholder: "e.g., ORPHA550, ORPHA261, or rare disease name",
    shortcuts: [
      { label: 'ORPHA550 (MELAS)', query: 'ORPHA550' },
      { label: 'ORPHA261 (DMD)', query: 'ORPHA261' },
      { label: 'ORPHA324 (Fabry)', query: 'ORPHA324' },
      { label: 'ORPHA314 (Leigh)', query: 'ORPHA314' }
    ]
  }
];

export default function BiomedicalRegistries() {
  const [selectedRegistry, setSelectedRegistry] = useState<'ClinVar' | 'OMIM' | 'Orphanet'>('ClinVar');
  const [registryQuery, setRegistryQuery] = useState('');
  const [isRegistryLoading, setIsRegistryLoading] = useState(false);
  const [registryResult, setRegistryResult] = useState<string | null>(null);
  const [registryLoadingStep, setRegistryLoadingStep] = useState(0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', { description: `${label} ("${text}") copied successfully.` });
  };

  const handleRegistrySearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || registryQuery;
    if (!queryToUse) return;
    
    setRegistryQuery(queryToUse);
    setIsRegistryLoading(true);
    setRegistryResult(null);
    setRegistryLoadingStep(0);

    const stepsTimer = setInterval(() => {
      setRegistryLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const res = await queryBiomedicalRegistry(selectedRegistry, queryToUse);
      setRegistryResult(res);
    } catch (error) {
      console.error(error);
      toast.error('Registry query failed', { description: 'Could not connect to database indices.' });
    } finally {
      clearInterval(stepsTimer);
      setIsRegistryLoading(false);
    }
  };

  const currentReg = REGISTRIES_METADATA.find(r => r.id === selectedRegistry)!;

  return (
    <div className="space-y-8">
      {/* Registry Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REGISTRIES_METADATA.map(reg => {
          const isActive = selectedRegistry === reg.id;
          return (
            <motion.div
              key={reg.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedRegistry(reg.id);
                setRegistryQuery('');
                setRegistryResult(null);
              }}
              className={cn(
                "p-6 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4",
                isActive ? reg.activeColorClass : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  {reg.icon}
                </div>
                {isActive && (
                  <span className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                    Active Database
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{reg.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono font-black uppercase mt-0.5">{reg.fullName}</p>
                <p className="text-[10px] text-slate-500 font-bold leading-normal mt-2">{reg.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Registry Search Form */}
      <div className="space-y-6">
        <form onSubmit={handleRegistrySearch} className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            value={registryQuery}
            onChange={(e) => setRegistryQuery(e.target.value)}
            placeholder={currentReg.placeholder}
            className="w-full bg-white border border-slate-200 rounded-2xl py-5 pl-16 pr-40 text-sm font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-950 shadow-xl shadow-slate-200/40 transition-all font-bold"
          />
          <button
            type="submit"
            disabled={isRegistryLoading || !registryQuery}
            className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 shadow-lg cursor-pointer"
          >
            {isRegistryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Query Registry
          </button>
        </form>

        {/* Registry Query Shortcuts */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto -mt-2">
          <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-widest self-center mr-1">Pre-indexed lookup:</span>
          {currentReg.shortcuts.map(sc => (
            <button
              key={sc.label}
              onClick={() => handleRegistrySearch(undefined, sc.query)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:border-slate-400 hover:text-slate-950 transition-all shadow-sm active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Registry Search Results / Loading / Zero State */}
        <AnimatePresence mode="wait">
          {isRegistryLoading ? (
            <motion.div
              key="registry-loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[32px] p-12 text-center space-y-6 shadow-sm"
            >
              <Loader2 className="w-10 h-10 text-slate-900 animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-xs font-mono font-black text-slate-900 uppercase tracking-widest animate-pulse">
                  {registryLoadingStep === 0 && "Connecting to global biomedical knowledge servers..."}
                  {registryLoadingStep === 1 && `Indexing ${selectedRegistry} databases and taxonomy chains...`}
                  {registryLoadingStep === 2 && "Querying molecular pathophysiology and inheritance lineages..."}
                  {registryLoadingStep === 3 && "Synthesizing real-time medical registry report..."}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Establishing secure clinical connection (Grounded with real Google Searches)
                </p>
              </div>
            </motion.div>
          ) : registryResult ? (
            <motion.div
              key="registry-result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl"
            >
              {/* Result Header */}
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      Registry Lookup Success
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      Grounded Live Report
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-700" />
                    {selectedRegistry} Reference: <span className="text-blue-600 font-mono">{registryQuery}</span>
                  </h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(registryQuery, `${selectedRegistry} Query`)}
                    className="p-2.5 hover:bg-white border border-slate-200 bg-white rounded-xl text-slate-500 hover:text-slate-900 transition-all active:scale-95 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Entry</span>
                  </button>
                  <a
                    href={
                      selectedRegistry === 'ClinVar'
                        ? `https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(registryQuery)}`
                        : selectedRegistry === 'OMIM'
                          ? `https://www.omim.org/search?search=${encodeURIComponent(registryQuery)}`
                          : `https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=EN&search_type=Pat&search_value=${encodeURIComponent(registryQuery)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all active:scale-95 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open {selectedRegistry}</span>
                  </a>
                </div>
              </div>

              {/* Result Body */}
              <div className="p-8 lg:p-12 max-w-none">
                <div className="markdown-body">
                  <ReactMarkdown>{registryResult}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="registry-zero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50/10 via-slate-50 to-indigo-50/10 border border-slate-200 rounded-[32px] p-12 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mx-auto">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Clinical Registry Query Engine</h4>
                <p className="text-[10px] text-slate-400 font-bold max-w-lg mx-auto uppercase leading-relaxed tracking-wider">
                  Select one of the three reference portals (ClinVar, OMIM, or Orphanet) and search for variants, OMIM catalog IDs, or Orphanet codes. Gemini leverages real-time live grounding searches to populate exact details.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
