import { useState } from 'react';
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
  Search
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
  },
  {
    id: 'CASE-9923',
    patientAlias: 'Blue-Echo',
    topPhenotypes: ['Intellectual disability', 'Ataxia', 'Microcephaly'],
    lastUpdate: '2 days ago',
    reviewCount: 5,
    urgency: 'Routine',
    anonymizationScore: 99
  },
  {
    id: 'CASE-5561',
    patientAlias: 'Delta-Nine',
    topPhenotypes: ['Corneal verticillata', 'Angiokeratoma', 'Hypohidrosis'],
    lastUpdate: '3 days ago',
    reviewCount: 15,
    urgency: 'Critical',
    anonymizationScore: 100
  }
];

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'mine'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const handleShare = () => {
    toast.success('Privacy audit complete. Case encrypted and shared to the Global Node.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Collaboration Portal</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Secure Global Rare Disease Network</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('feed')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              activeTab === 'feed' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Global Feed
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'mine' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            My Shared
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by HPO Terms, Genomic Loci, or Clinical Phenotypes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-3xl pl-14 pr-8 py-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm group-hover:border-indigo-100"
            />
          </div>

          <div className="space-y-4">
            {MOCK_CASES.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden active:scale-[0.99]"
              >
                <div className="absolute top-0 right-0 p-5">
                   <div className={cn(
                     "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                     item.urgency === 'Critical' ? "bg-rose-50 text-rose-600" : 
                     item.urgency === 'Emergent' ? "bg-amber-50 text-amber-600" : 
                     "bg-slate-100 text-slate-500"
                   )}>
                     {item.urgency}
                   </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-6">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100 shadow-inner">
                      <FileSearch className="w-7 h-7" />
                   </div>

                   <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 transition-colors group-hover:translate-x-1 duration-300">{item.patientAlias}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                           <span className="font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{item.id}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-300" /> {item.lastUpdate}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.topPhenotypes.map(p => (
                          <span key={p} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wide group-hover:bg-white group-hover:border-indigo-100 transition-all">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-6">
                         <div className="flex -space-x-1.5">
                            {[1,2,3].map(n => (
                              <div key={n} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                 <Users className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[9px] font-black text-white">
                               +{item.reviewCount}
                            </div>
                         </div>
                         
                         <button className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:gap-3 transition-all">
                            Contribute Review <ChevronRight className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full -mr-24 -mt-24 blur-[80px] opacity-40 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Broadcast Case</h3>
                 </div>

                 <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
                   Request peer review from our validated network of 14,000+ certified specialists.
                 </p>

                 <div className="space-y-2">
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Anonymization Engine</span>
                       </div>
                       <div className="w-8 h-4 bg-emerald-500/20 rounded-full flex items-center px-1">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ml-auto" />
                       </div>
                    </div>
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                       </div>
                       <div className="w-8 h-4 bg-indigo-500/20 rounded-full flex items-center px-1">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] ml-auto" />
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={handleShare}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 group/btn"
                 >
                    <Zap className="w-4 h-4 text-white fill-white group-hover/btn:animate-bounce" /> Secure Pulse Share
                 </button>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Network Metrics</h3>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-all">
                    <div className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">14.2k</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Specialists</div>
                 </div>
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-emerald-100 transition-all">
                    <div className="text-2xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">89%</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Resolution Rate</div>
                 </div>
              </div>

              <div className="mt-8 space-y-3">
                 <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                       <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                       <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Open Consults</h5>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">24 Active Clinical Dialogues</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                       <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                       <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Nodes</h5>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">84 Global Rare Disease Centers</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
