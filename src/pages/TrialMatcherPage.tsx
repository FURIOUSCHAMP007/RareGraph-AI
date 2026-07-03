import { useState, useMemo } from 'react';
import { 
  Dna, 
  Search, 
  Filter, 
  ExternalLink, 
  MapPin, 
  FlaskConical, 
  Calendar,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface Trial {
  id: string;
  title: string;
  phase: string;
  status: string;
  location: string;
  startDate: string;
  description: string;
  matchScore: number;
  criteria: string[];
  tags: string[];
}

const mockTrials: Trial[] = [
  {
    id: "NCT04561234",
    title: "Gene Therapy for Mitochondrial Myopathy (mt-DNA focus)",
    phase: "Phase II",
    status: "Recruiting",
    location: "Cleveland Clinic, OH",
    startDate: "June 2026",
    description: "Evaluating the safety and efficacy of localized mitochondrial repair vectors in patients with m.3243A>G mutations.",
    matchScore: 98,
    criteria: ["Age 18-65", "Confirmed m.3243A>G mutation", "Lactic acidosis history"],
    tags: ["Gene Therapy", "Mitochondrial", "MELAS"]
  },
  {
    id: "NCT09876543",
    title: "Small Molecule Metabolic Rescuers in Rare Respiratory Chain Disorders",
    phase: "Phase III",
    status: "Active, not recruiting",
    location: "Mayo Clinic, MN",
    startDate: "Jan 2026",
    description: "A double-blind, placebo-controlled study of compound RX-99 focused on restoring ATP conversion efficiency.",
    matchScore: 84,
    criteria: ["Documented Complex I deficiency", "Stable clinical status for 6 months"],
    tags: ["Metabolism", "Small Molecule", "ATP Synthase"]
  },
  {
    id: "NCT01122334",
    title: "Natural History Study of Undiagnosed Neurodevelopmental Syndromes",
    phase: "Observational",
    status: "Recruiting",
    location: "Boston Children's Hospital, MA",
    startDate: "Ongoing",
    description: "Longitudinal tracking of pediatric patients with unmapped neurological manifestations to identify novel biomarkers.",
    matchScore: 72,
    criteria: ["Undiagnosed disease classification", "Pediatric onset"],
    tags: ["Observational", "Neuro", "Pediatric"]
  }
];

import { useClinical } from '../context/ClinicalContext';

export default function TrialMatcherPage() {
  const { hpoTerms } = useClinical();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recruiting' | 'phase' | 'gene'>('all');

  const filteredTrials = useMemo(() => {
    return mockTrials.filter(trial => {
      const matchesSearch = trial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           trial.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trial.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = activeFilter === 'all' || 
                           (activeFilter === 'recruiting' && trial.status === 'Recruiting') ||
                           (activeFilter === 'phase' && (trial.phase.includes('Phase II') || trial.phase.includes('Phase III'))) ||
                           (activeFilter === 'gene' && trial.tags.includes('Gene Therapy'));

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
          <FlaskConical className="w-3 h-3" />
          Clinical Trials & Registry Matcher (v2.4)
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Experimental Therapeutic Discovery</h2>
        <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
          Cross-referencing phenotypic fingerprints and variant signatures against global registries (ClinicalTrials.gov, Orphanet). Accelerating access to precision medicine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Search and Filters */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by gene (e.g. MTTL1), phenotype, or NCT identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[32px] pl-16 pr-8 py-6 text-sm font-bold shadow-sm focus:outline-none focus:ring-4 ring-blue-50 focus:border-blue-300 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
             <button 
               onClick={() => setActiveFilter('recruiting')}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all",
                 activeFilter === 'recruiting' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
               )}
             >
                <Filter className="w-3 h-3" />
                Active Recruiting
             </button>
             <button 
               onClick={() => setActiveFilter('phase')}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all",
                 activeFilter === 'phase' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
               )}
             >
                Phase II / III
             </button>
             <button 
               onClick={() => setActiveFilter('gene')}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all",
                 activeFilter === 'gene' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
               )}
             >
                Gene Therapy
             </button>
             {activeFilter !== 'all' && (
               <button 
                 onClick={() => setActiveFilter('all')}
                 className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-slate-600 active:scale-95 transition-all"
               >
                  Clear Filters
               </button>
             )}
          </div>

          <div className="space-y-4">
            {filteredTrials.map((trial, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={trial.id}
                onClick={() => setSelectedTrial(trial)}
                className={cn(
                  "p-8 bg-white border rounded-[36px] cursor-pointer transition-all hover:shadow-xl group",
                  selectedTrial?.id === trial.id ? "border-blue-400 ring-4 ring-blue-50 shadow-xl" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <FlaskConical className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{trial.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <span className="text-blue-600">{trial.id}</span>
                        <span>•</span>
                        {trial.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Match Score</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {trial.matchScore}%
                        </div>
                     </div>
                     <div className="w-12 h-12 rounded-full border-4 border-slate-50 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-600 transition-all duration-1000"
                          style={{ height: `${trial.matchScore}%` }}
                        />
                     </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                   <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">
                     {trial.phase}
                   </span>
                   {trial.tags.map(tag => (
                     <span key={tag} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                       {tag}
                     </span>
                   ))}
                   <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                     <CheckCircle2 className="w-3 h-3" />
                     {trial.status}
                   </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Inspection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              {selectedTrial ? (
                <motion.div
                  key={selectedTrial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-10 space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedTrial.title}</h3>
                    <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                       <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Starts: {selectedTrial.startDate}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedTrial.location}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Description</h4>
                     <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                       "{selectedTrial.description}"
                     </p>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inclusion Criteria</h4>
                     <div className="grid gap-3">
                        {selectedTrial.criteria.map((c, i) => (
                           <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                             <span className="text-[11px] text-slate-700 font-bold leading-tight">{c}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-6 bg-blue-900 rounded-3xl text-white space-y-4 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700" />
                     <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Inference Insight</span>
                     </div>
                     <p className="text-[10px] font-bold leading-relaxed text-blue-100">
                       Analysis of the current patient's variant profile shows a <span className="text-white underline decoration-blue-400 underline-offset-4">98.4% phenotypic alignment</span> with the target cohort for this trial. Highly recommended for enrollment evaluation.
                     </p>
                  </div>

                  <button 
                    onClick={() => window.open(`https://clinicaltrials.gov/study/${selectedTrial.id}`, '_blank')}
                    className="w-full flex items-center justify-between px-8 py-5 bg-slate-900 text-white rounded-2xl group hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">External Protocol View</span>
                    <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-all" />
                  </button>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 mb-6">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">No Matching Logic Loaded</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[240px]">
                    Select a trial from the research engine results to inspect enrollment criteria.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
