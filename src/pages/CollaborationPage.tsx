import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ShieldCheck, 
  Lock, 
  Users, 
  MessageSquare, 
  ChevronRight, 
  Share2,
  FileSearch,
  Zap,
  Clock,
  ExternalLink,
  Search,
  Link2,
  StickyNote,
  Edit3,
  Video,
  MonitorPlay,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { SharedCase } from '../types';
import { cn } from '../lib/utils';

const MOCK_CASES: SharedCase[] = [
  {
    id: 'CASE-7721',
    patientAlias: 'Patient Zero-A',
    topPhenotypes: ['Hypertrophic cardiomyopathy', 'Developmental delay', 'Seizures'],
    lastUpdate: '2 hours ago',
    reviewCount: 12,
    urgency: 'Critical',
    anonymizationScore: 100
  },
  {
    id: 'CASE-8840',
    patientAlias: 'Alpha-X-9',
    topPhenotypes: ['Profound hearing loss', 'Retinitis pigmentosa'],
    lastUpdate: '5 hours ago',
    reviewCount: 3,
    urgency: 'Routine',
    anonymizationScore: 98
  },
  {
    id: 'CASE-1102',
    patientAlias: 'Gamma-Ray',
    topPhenotypes: ['Limb-girdle muscle weakness', 'Elevated serum creatine kinase'],
    lastUpdate: '1 day ago',
    reviewCount: 8,
    urgency: 'Emergent',
    anonymizationScore: 100
  }
];

const MOCK_ANNOTATIONS = [
  { user: 'Dr. Sarah Chen', text: 'MT-ATP6 variant looks pathogenic based on ClinVar 2024 update.', time: '10:45 AM' },
  { user: 'Prof. Hans Müller', text: 'Check for metabolic acidosis in blood serum before proceeding.', time: '10:48 AM' },
  { user: 'AI Assistant', text: 'Phenotype matching: MELAS syndrome similarity score increased to 0.94.', time: '10:50 AM' }
];

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'mine' | 'rounds' | 'board'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBoardCase, setActiveBoardCase] = useState<string | null>(null);
  const [livePeers, setLivePeers] = useState(1);

  // Federated Learning States
  const [isFlSyncing, setIsFlSyncing] = useState(false);
  const [flProgress, setFlProgress] = useState(0);
  const [flStep, setFlStep] = useState('');
  const [flNodes, setFlNodes] = useState({
    mayo: true,
    gosh: true,
    boston: true
  });

  useEffect(() => {
    if (activeTab === 'board') {
      const interval = setInterval(() => {
        setLivePeers(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleShare = () => {
    toast.success('Privacy audit complete. Case encrypted and shared to the Global Node.');
  };

  const handleJoinRounds = (caseId: string) => {
    setActiveBoardCase(caseId);
    setActiveTab('board');
    toast.info(`Entering Clinical Board for ${caseId}`, {
      description: "Establishing low-latency sync with available specialists..."
    });
  };

  const generateInviteLink = () => {
    const link = `https://raregraph.ai/consult/${activeBoardCase}?token=secure_${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(link);
    toast.success("Secure link generated", { description: "Peer review invitation copied to clipboard." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg shadow-slate-500/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Collaboration Portal</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Secure Global Peer Review Network</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl backdrop-blur-md border border-slate-200">
          <button 
            onClick={() => setActiveTab('feed')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'feed' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Global Feed
          </button>
          <button 
            onClick={() => setActiveTab('rounds')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'rounds' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Grand Rounds
          </button>
          {activeBoardCase && (
            <button 
              onClick={() => setActiveTab('board')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                activeTab === 'board' ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-600 hover:bg-emerald-50"
              )}
            >
              <div className="flex items-center gap-2">
                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", activeTab === 'board' ? "bg-white" : "bg-emerald-500")} />
                 Clinical Board
              </div>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'board' && activeBoardCase ? (
          <motion.div 
            key="clinical-board"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Live Board Interface */}
            <div className="lg:col-span-9 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/20">
                    <motion.div 
                      className="h-full bg-emerald-500" 
                      animate={{ width: ['0%', '100%'] }} 
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} 
                    />
                 </div>
                 
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                          <MonitorPlay className="w-7 h-7" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Clinical Board: {activeBoardCase}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{livePeers} Specialists Active</span>
                             </div>
                             <span className="w-1 h-1 bg-slate-200 rounded-full" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Node</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={generateInviteLink} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm">
                          <Link2 className="w-4 h-4" /> Invite Peer
                       </button>
                       <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                          <Video className="w-4 h-4" /> Start Video
                       </button>
                    </div>
                 </div>

                 <div className="aspect-video bg-slate-50 rounded-[32px] border border-slate-100 relative group flex items-center justify-center">
                    <div className="text-center space-y-4">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto shadow-inner">
                          <MonitorPlay className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedigree Architecture & Analysis View</p>
                    </div>
                    
                    {/* Simulated Annotation Markers */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      className="absolute top-1/4 left-1/3 group/marker"
                    >
                       <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer animate-bounce">
                          <Edit3 className="w-4 h-4" />
                       </div>
                       <div className="absolute left-10 top-0 w-48 p-4 bg-slate-900 text-white rounded-2xl opacity-0 group-hover/marker:opacity-100 transition-all shadow-2xl pointer-events-none">
                          <p className="text-[10px] font-black uppercase mb-1 text-slate-400">Dr. Sarah Chen</p>
                          <p className="text-xs font-medium leading-relaxed italic">"Potential homozygous variant at this locus - needs confirmation."</p>
                       </div>
                    </motion.div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 bg-white border border-slate-200 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Protocol</h4>
                    <ul className="space-y-4">
                       <li className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-600">Review pedigree inheritance patterns</span>
                       </li>
                       <li className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-600">Validate AI-suggested HPO terms</span>
                       </li>
                    </ul>
                 </div>
                 <div className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Colleague Insights</h4>
                    <div className="flex -space-x-2">
                       {[1,2,3,4].map(n => (
                         <div key={n} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 group relative cursor-pointer hover:scale-110 transition-all">
                            U{n}
                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Live Chat/Annotations Sidebar */}
            <div className="lg:col-span-3 space-y-6 h-full flex flex-col">
               <div className="flex-1 bg-white border border-slate-200 rounded-[40px] shadow-sm flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Board Annotations</h4>
                  </div>
                  <div className="flex-1 overflow-auto p-6 space-y-6">
                     {MOCK_ANNOTATIONS.map((note, i) => (
                       <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="space-y-2"
                       >
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{note.user}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{note.time}</span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600 leading-relaxed">
                             {note.text}
                          </div>
                       </motion.div>
                     ))}
                  </div>
                  <div className="p-6 border-t border-slate-100">
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="Drop annotation..." 
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold pr-12 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                           <Edit3 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Global Feed Implementation (Existing Logic) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by HPO Terms, Genomic Loci, or Clinical Phenotypes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[32px] pl-14 pr-8 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-4">
                {MOCK_CASES.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden active:scale-[0.99] cursor-pointer"
                    onClick={() => handleJoinRounds(item.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                       <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                          <FileSearch className="w-8 h-8" />
                       </div>

                       <div className="flex-1 space-y-6">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter transition-all group-hover:translate-x-1">{item.patientAlias}</h4>
                               <div className={cn(
                                 "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                 item.urgency === 'Critical' ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                               )}>{item.urgency}</div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                               <span className="font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{item.id}</span>
                               <span className="w-1 h-1 bg-slate-200 rounded-full" />
                               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {item.lastUpdate}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {item.topPhenotypes.map(p => (
                              <span key={p} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wide group-hover:bg-white transition-all">
                                {p}
                              </span>
                            ))}
                          </div>

                          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(n => (
                                  <div key={n} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                     <Users className="w-4 h-4 text-slate-400" />
                                  </div>
                                ))}
                                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
                                   +{item.reviewCount}
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:gap-4 transition-all">
                                Open Clinical Board <ChevronRight className="w-4 h-4" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:scale-125 transition-all duration-1000" />
                  
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-all">
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Broadcast Case</h3>
                     </div>

                     <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                       Securely share clinical findings to 14,000+ certified medical specialists for low-latency peer review.
                     </p>

                     <button 
                      onClick={handleShare}
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
                     >
                        <Zap className="w-4 h-4" /> Secure Pulse Share
                     </button>
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <Cpu className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Federated Learning Sync</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Privacy-Preserving Consensus</p>
                     </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold leading-normal uppercase">
                    Sync local model parameter gradients with partner nodes without raw genomic or clinical data exposure.
                  </p>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Consortium Nodes</label>
                     <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={flNodes.mayo} 
                             onChange={(e) => setFlNodes(prev => ({ ...prev, mayo: e.target.checked }))}
                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10"
                           />
                           Mayo Clinic Genomic Center
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={flNodes.gosh} 
                             onChange={(e) => setFlNodes(prev => ({ ...prev, gosh: e.target.checked }))}
                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10"
                           />
                           Great Ormond Street Hospital (GOSH)
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={flNodes.boston} 
                             onChange={(e) => setFlNodes(prev => ({ ...prev, boston: e.target.checked }))}
                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10"
                           />
                           Boston Children's Hospital
                        </label>
                     </div>
                  </div>

                  {isFlSyncing ? (
                     <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse">
                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <span>{flStep}</span>
                           <span>{flProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${flProgress}%` }} />
                        </div>
                     </div>
                  ) : (
                     <button
                        onClick={() => {
                           if (!flNodes.mayo && !flNodes.gosh && !flNodes.boston) {
                              toast.error("Please select at least one consortium node.");
                              return;
                           }
                           setIsFlSyncing(true);
                           setFlProgress(0);
                           
                           const steps = [
                              { text: 'Extracting localized model gradients...', progress: 15 },
                              { text: 'Applying differential privacy noise...', progress: 40 },
                              { text: 'Broadcasting to secure aggregate enclave...', progress: 70 },
                              { text: 'Recalculating global clinical weights...', progress: 95 },
                              { text: 'Consensus complete! Synced global weights.', progress: 100 }
                           ];

                           let stepIdx = 0;
                           const runStep = () => {
                              if (stepIdx < steps.length) {
                                 setFlStep(steps[stepIdx].text);
                                 setFlProgress(steps[stepIdx].progress);
                                 stepIdx++;
                                 setTimeout(runStep, 800);
                              } else {
                                 setIsFlSyncing(false);
                                 toast.success("Federated Weights Integrated", {
                                    description: "Consensus model weights synchronized successfully. Diagnostic accuracy updated by +4.2%."
                                 });
                              }
                           };
                           runStep();
                        }}
                        className="w-full py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                     >
                        <RefreshCw className="w-4 h-4 text-indigo-400" /> Sync Model Parameters
                     </button>
                  )}
               </div>

               <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center bg-slate-50 py-2 rounded-full">Network Metrics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-slate-900 transition-all text-center">
                        <div className="text-3xl font-black text-slate-900 mb-1">14.2k</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Specialists</div>
                     </div>
                     <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-slate-900 transition-all text-center">
                        <div className="text-3xl font-black text-slate-900 mb-1">89%</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Res. Rate</div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

