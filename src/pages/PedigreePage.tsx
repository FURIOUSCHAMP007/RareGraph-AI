import { GitBranch, ShieldCheck, Info, User, UserPlus, Trash2, Heart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  sex: 'M' | 'F';
  affected: boolean;
  maternal: boolean;
  generation: number;
  notes?: string;
}

export default function PedigreePage() {
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: 'm1', name: 'GL-092 (Index)', relation: 'PROBAND', sex: 'M', affected: true, maternal: true, generation: 0, notes: 'm.3243A>G Heteroplasmy: 95%' },
    { id: 'm2', name: 'Mother', relation: 'MOTHER', sex: 'F', affected: true, maternal: true, generation: 1, notes: 'Intermittent muscle fatigue.' },
    { id: 'm3', name: 'Maternal Grandmother', relation: 'GRANDMOTHER', sex: 'F', affected: true, maternal: true, generation: 2, notes: 'Deceased. Reported hearing loss.' },
    { id: 'm4', name: 'Maternal Aunt', relation: 'AUNT', sex: 'F', affected: false, maternal: true, generation: 1 },
    { id: 'm5', name: 'Brother', relation: 'SIBLING', sex: 'M', affected: false, maternal: true, generation: 0 },
  ]);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const getPos = (member: FamilyMember) => {
    const genIndex = members.filter(m => m.generation === member.generation).indexOf(member);
    const totalInGen = members.filter(m => m.generation === member.generation).length;
    const spacing = 120;
    const startX = (totalInGen - 1) * spacing * -0.5;
    return {
      x: startX + genIndex * spacing,
      y: member.generation * -150
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-600 rounded-lg shadow-lg shadow-rose-500/20">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Pedigree Analysis</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Multigenerational Inheritance Mapping</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maternal Lineage Detected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Interactive Pedigree Canvas */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm h-[600px] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          
          <div className="absolute top-8 left-8 flex flex-col gap-4 z-10">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
                <div className="w-3 h-3 bg-rose-600 rounded-full" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Phenotype Present</span>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
                <div className="w-3 h-3 bg-slate-200 rounded-full" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Unaffected</span>
             </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pt-24">
            <div className="relative">
              {/* Simple connections svg */}
              <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ transform: 'translate(50%, 50%)' }}>
                 {/* Connection logic would go here in a full D3 implementation, simplified for React layout */}
              </svg>

              {members.map((member) => {
                const pos = getPos(member);
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute cursor-pointer group"
                    style={{ left: pos.x, top: pos.y }}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center border-4 transition-all group-hover:scale-110 shadow-lg",
                      member.sex === 'M' ? "rounded-none" : "rounded-full",
                      member.affected ? "bg-rose-600 border-rose-200" : "bg-white border-slate-100",
                      selectedMember?.id === member.id && "ring-4 ring-rose-200 ring-offset-4"
                    )}>
                       {member.relation === 'PROBAND' && (
                         <div className="absolute -bottom-4 right-0">
                           <ShieldCheck className="w-4 h-4 text-rose-600" />
                         </div>
                       )}
                    </div>
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                       <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{member.name}</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{member.relation}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-3">
             <button onClick={() => toast.info('Expanding pedigree model...')} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all">
                <UserPlus className="w-5 h-5 text-slate-400" />
             </button>
             <button onClick={() => setMembers(members.slice(0, 1))} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all group">
                <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
             </button>
          </div>
        </div>

        {/* Member Details */}
        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-2">Genetic Profile Context</h3>
             {selectedMember ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-8"
               >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black",
                      selectedMember.affected ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
                    )}>
                      {selectedMember.sex}
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedMember.name}</h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedMember.relation}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic">
                       <p className="text-xs text-slate-600 font-bold leading-relaxed">
                         "{selectedMember.notes || 'No significant clinical notes recorded for this individual.'}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className={cn("text-xs font-black uppercase tracking-tight", selectedMember.affected ? "text-rose-600" : "text-emerald-600")}>
                            {selectedMember.affected ? 'Affected' : 'Carrier/Normal'}
                          </p>
                       </div>
                       <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Heteroplasmy</p>
                          <p className="text-xs font-black text-slate-900 tracking-tight">{selectedMember.affected ? 'HIGH' : 'LOW/UNK'}</p>
                       </div>
                    </div>
                 </div>

                 <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10">
                    <Activity className="w-4 h-4 text-rose-400" />
                    Deep Logic Verification
                 </button>
               </motion.div>
             ) : (
               <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <User className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Select a node to inspect</p>
               </div>
             )}
          </section>

          <section className="bg-rose-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-rose-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400">Inference Alert</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed mb-6 italic opacity-80">
                Pattern consistent with <span className="text-white underline decoration-rose-400 underline-offset-4">maternal inheritance</span>. 100% of the index case's maternal ancestors show related phenotypic clusters (hearing loss, myopathy).
              </p>
              <div className="p-3 bg-white/10 rounded-xl border border-white/5">
                 <p className="text-[9px] font-mono uppercase tracking-widest text-rose-200">Confidence Shift: +18.4%</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
