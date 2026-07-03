import { motion } from 'motion/react';
import { Download, FileText, Share2, Printer, Mail, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportHub() {
  const exportBasic = () => {
    toast.success('Clinical Summary Exported', { description: 'RareGraph summary PDF generated and downloaded.' });
  };

  const exportAdvanced = () => {
    toast.success('Research Dataset Exported', { description: 'JSON structure with phenotype-variant grounding completed.' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl -mr-32 -mt-32" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            Export Synthesis Lab
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
            SYNTESIZE & SECURELY <br/> SHARE CLINICAL INSIGHTS
          </h3>
          <p className="text-slate-400 text-sm font-bold max-w-md">
            Generate research-grade reports, anonymized datasets, or collaborative peer-review documentation in seconds.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={exportBasic} className="p-6 bg-slate-800/50 border border-white/5 rounded-2xl flex flex-col gap-4 text-left hover:bg-slate-800 transition-all group/btn active:scale-95">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover/btn:scale-110 transition-transform">
               <FileText className="w-5 h-5" />
             </div>
             <div>
               <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Clinical Report</span>
               <span className="text-[9px] text-slate-500 uppercase tracking-tighter">MD-READY PDF</span>
             </div>
          </button>

          <button onClick={exportAdvanced} className="p-6 bg-slate-800/50 border border-white/5 rounded-2xl flex flex-col gap-4 text-left hover:bg-slate-800 transition-all group/btn active:scale-95">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover/btn:scale-110 transition-transform">
               <Download className="w-5 h-5" />
             </div>
             <div>
               <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Research Hub</span>
               <span className="text-[9px] text-slate-500 uppercase tracking-tighter">COMPUTE JSON</span>
             </div>
          </button>

          <button onClick={() => toast.success('Link Generated', { description: 'Secure collaboration token active for 24 hours.' })} className="p-6 bg-slate-800/50 border border-white/5 rounded-2xl flex flex-col gap-4 text-left hover:bg-slate-800 transition-all group/btn active:scale-95">
             <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover/btn:scale-110 transition-transform">
               <Share2 className="w-5 h-5" />
             </div>
             <div>
               <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Portal Share</span>
               <span className="text-[9px] text-slate-500 uppercase tracking-tighter">SECURE TOKEN</span>
             </div>
          </button>
        </div>
      </div>
    </div>
  );
}
