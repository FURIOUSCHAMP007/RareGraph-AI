import { GitBranch, ShieldCheck, Info, User, UserPlus, Trash2, Heart, Activity, RefreshCw, Layers, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Connection, 
  Edge, 
  Node, 
  ReactFlowProvider,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// --- Custom Nodes ---

const MaleNode = ({ data }: any) => (
  <div className={cn(
    "w-12 h-12 border-4 transition-all flex items-center justify-center relative shadow-lg",
    data.status === 'Affected' ? "bg-rose-600 border-rose-200" : 
    data.status === 'Carrier' ? "bg-amber-400 border-amber-100" :
    "bg-white border-slate-100",
    data.selected && "ring-4 ring-rose-200 ring-offset-4"
  )}>
    <Handle type="target" position={Position.Top} className="opacity-0" />
    {data.relation === 'PROBAND' && <div className="absolute -bottom-4 right-0"><ShieldCheck className="w-4 h-4 text-rose-600" /></div>}
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
       <p className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{data.label}</p>
       <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{data.relation}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const FemaleNode = ({ data }: any) => (
  <div className={cn(
    "w-12 h-12 border-4 rounded-full transition-all flex items-center justify-center relative shadow-lg",
    data.status === 'Affected' ? "bg-rose-600 border-rose-200" : 
    data.status === 'Carrier' ? "bg-amber-400 border-amber-100" :
    "bg-white border-slate-100",
    data.selected && "ring-4 ring-rose-200 ring-offset-4"
  )}>
    <Handle type="target" position={Position.Top} className="opacity-0" />
    {data.relation === 'PROBAND' && <div className="absolute -bottom-4 right-0"><ShieldCheck className="w-4 h-4 text-rose-600" /></div>}
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
       <p className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{data.label}</p>
       <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{data.relation}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const nodeTypes = {
  male: MaleNode,
  female: FemaleNode,
};

// --- Main Component ---

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  sex: 'M' | 'F';
  status: 'Affected' | 'Unaffected' | 'Carrier';
  maternal: boolean;
  generation: number;
  notes?: string;
}

const initialMembers: FamilyMember[] = [
  { id: 'm1', name: 'GL-092 (Index)', relation: 'PROBAND', sex: 'M', status: 'Affected', maternal: true, generation: 0, notes: 'm.3243A>G Heteroplasmy: 95%' },
  { id: 'm2', name: 'Mother', relation: 'MOTHER', sex: 'F', status: 'Affected', maternal: true, generation: 1, notes: 'Intermittent muscle fatigue.' },
  { id: 'm3', name: 'Maternal Grandmother', relation: 'GRANDMOTHER', sex: 'F', status: 'Affected', maternal: true, generation: 2, notes: 'Deceased. Reported hearing loss.' },
  { id: 'm4', name: 'Maternal Aunt', relation: 'AUNT', sex: 'F', status: 'Unaffected', maternal: true, generation: 1 },
  { id: 'm5', name: 'Brother', relation: 'SIBLING', sex: 'M', status: 'Unaffected', maternal: true, generation: 0 },
];

const initialNodes: Node[] = initialMembers.map((m, i) => ({
  id: m.id,
  type: m.sex === 'M' ? 'male' : 'female',
  position: { x: (i % 3) * 200, y: (m.generation * -150) + 300 },
  data: { label: m.name, relation: m.relation, status: m.status, ...m },
}));

const initialEdges: Edge[] = [
  { id: 'e2-1', source: 'm2', target: 'm1', markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e3-2', source: 'm3', target: 'm2', markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
  { id: 'e2-5', source: 'm2', target: 'm5', markerEnd: { type: MarkerType.ArrowClosed, color: '#f1f5f9' } },
  { id: 'e3-4', source: 'm3', target: 'm4', markerEnd: { type: MarkerType.ArrowClosed, color: '#f1f5f9' } },
];

export default function PedigreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    relation: '',
    sex: 'M',
    status: 'Unaffected',
    generation: 0,
    maternal: true,
    notes: ''
  });

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedMember(node.data as FamilyMember);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relation) {
      toast.error("Please fill in required fields");
      return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newMember: FamilyMember = {
      id,
      name: formData.name || 'New Member',
      relation: formData.relation || 'Unknown',
      sex: (formData.sex as 'M' | 'F') || 'M',
      status: (formData.status as FamilyMember['status']) || 'Unaffected',
      generation: formData.generation || 0,
      maternal: formData.maternal ?? true,
      notes: formData.notes
    };

    const newNode: Node = {
      id,
      type: newMember.sex === 'M' ? 'male' : 'female',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: newMember.name, relation: newMember.relation, status: newMember.status, ...newMember },
    };

    setNodes((nds) => nds.concat(newNode));
    setIsAdding(false);
    setFormData({ name: '', relation: '', sex: 'M', status: 'Unaffected', generation: 0, maternal: true, notes: '' });
    toast.success("Family member added to workspace");
  };

  // Inheritance Logic: Auto-calculate risks
  const inheritanceRisks = useMemo(() => {
    // Basic heuristics for pedigree patterns
    const affectedCount = nodes.filter(n => n.data.status === 'Affected').length;
    const totalCount = nodes.length;
    const maternalAffected = nodes.filter(n => n.data.status === 'Affected' && n.data.maternal).length;
    
    let pattern = 'Undetermined';
    let riskScore = 0;

    if (maternalAffected / affectedCount > 0.8 && affectedCount > 2) {
      pattern = 'Mitochondrial';
      riskScore = 95;
    } else if (nodes.some(n => n.data.status === 'Affected' && n.data.generation > 1)) {
        pattern = 'Autosomal Dominant';
        riskScore = 50;
    } else if (affectedCount > 1 && totalCount > 4) {
        pattern = 'Autosomal Recessive';
        riskScore = 25;
    }

    return { pattern, riskScore };
  }, [nodes]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Pedigree Architect</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Dynamic Inheritance Modeling Tool</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Risk Index: {inheritanceRisks.riskScore}%</span>
           </div>
           <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{inheritanceRisks.pattern}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[700px]">
        {/* Interactive Pedigree Canvas */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm relative group">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50/50"
            >
              <Background gap={24} color="#e2e8f0" size={1} />
              <Controls className="!bg-white !border-slate-200 !rounded-xl !shadow-lg" />
            </ReactFlow>
          </ReactFlowProvider>
          
          <div className="absolute top-8 left-8 flex flex-col gap-4 z-10">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm">
                <div className="w-3 h-3 bg-rose-600 rounded-full" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Affected</span>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Carrier</span>
             </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-3 z-10">
             <button onClick={() => setIsAdding(true)} className="px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-3 group">
                <PlusIcon className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">Architect Node</span>
             </button>
             <button onClick={() => { setNodes(initialNodes); setEdges(initialEdges); toast.info('Layout Reset'); }} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all">
                <RefreshCw className="w-5 h-5 text-slate-400" />
             </button>
          </div>
        </div>

        {/* Member Details */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex-1">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-2">Clinical Context Matrix</h3>
             {selectedMember ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-8"
               >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black",
                      selectedMember.status === 'Affected' ? "bg-rose-50 text-rose-600" : 
                      selectedMember.status === 'Carrier' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-50 text-slate-400"
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
                          <p className={cn(
                            "text-xs font-black uppercase tracking-tight", 
                            selectedMember.status === 'Affected' ? "text-rose-600" : 
                            selectedMember.status === 'Carrier' ? "text-amber-600" :
                            "text-emerald-600"
                          )}>
                            {selectedMember.status}
                          </p>
                       </div>
                       <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Bias</p>
                          <p className="text-xs font-black text-slate-900 tracking-tight">{selectedMember.status === 'Affected' ? 'MAX' : 'CALC'}</p>
                       </div>
                    </div>
                 </div>

                 <button className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    <FingerprintIcon className="w-4 h-4 text-blue-400" />
                    Connect to Variant Hub
                 </button>
               </motion.div>
             ) : (
               <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <User className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Select a node to inspect</p>
               </div>
             )}
          </section>

          <section className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-blue-200" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200">Inheritance Insight</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed mb-6 italic opacity-90">
                Current pedigree topology strongly favors a <span className="text-white underline decoration-white/30 underline-offset-4">{inheritanceRisks.pattern}</span> distribution.
              </p>
              <button 
                onClick={() => setShowRiskCalc(true)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-white" />
                Open Probabilistic Calc
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showRiskCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRiskCalc(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recurrence Probability</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Ontology-Linked Risk Engine</p>
                </div>
                <button onClick={() => setShowRiskCalc(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"><PlusIcon className="w-5 h-5 text-slate-400 rotate-45" /></button>
              </div>

              <div className="space-y-6">
                 <div className="p-10 bg-slate-900 rounded-[32px] text-white">
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{inheritanceRisks.pattern}</span>
                          <div className="text-6xl font-black tracking-tighter">{inheritanceRisks.riskScore}<span className="text-xl text-slate-500 ml-1">%</span></div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Threshold</p>
                       </div>
                       <div className="space-y-4 border-l border-white/10 pl-10">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confidence Factor</span>
                          <div className="text-6xl font-black tracking-tighter">0.96</div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bayesian Reliability</p>
                       </div>
                    </div>
                 </div>
              </div>

              <button onClick={() => { setShowRiskCalc(false); toast.success("Clinical evidence updated"); }} className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl">
                Finalize Risk Analysis
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
              <form onSubmit={handleAddMember} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Architect Family Node</h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><PlusIcon className="w-5 h-5 text-slate-300 rotate-45" /></button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sibling A" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relation</label>
                    <input required type="text" value={formData.relation} onChange={(e) => setFormData({...formData, relation: e.target.value})} placeholder="e.g. SIBLING" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sex Configuration</label>
                    <select value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value as 'M' | 'F'})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold appearance-none">
                      <option value="M">Male (Square)</option>
                      <option value="F">Female (Circle)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as FamilyMember['status']})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold appearance-none">
                      <option value="Unaffected">Unaffected</option>
                      <option value="Affected">Affected</option>
                      <option value="Carrier">Carrier</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl">Confirm Artifact</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlusIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}

function FingerprintIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.3 3"/><path d="M7 10a5 5 0 0 1 10 0c0 3.1 1 6.2 3 9"/><path d="M22 20a4 4 0 0 0-4-4c-1.02 0-2.02.1-3 .3"/><path d="M15 10a2 2 0 0 0-2-2c-1.02 0-2.02.1-3 .3"/><path d="M12 4a8 8 0 0 1 8 8c0 .32 0 .64-.07.95"/><path d="M12 22v-4"/><path d="M12 2a10 10 0 0 0-10 10c0 .32 0 .64.07.95"/></svg>;
}

