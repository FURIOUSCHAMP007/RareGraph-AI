import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListOrdered, Download, Clock, Play, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface InferenceJob {
  id: string;
  name: string;
  model: string;
  status: 'COMPLETED' | 'RUNNING' | 'QUEUED' | 'FAILED';
  submittedAt: string;
  elapsedSec: number;
  progress: number;
}

export default function NvidiaInferenceJobsPage() {
  const [jobs, setJobs] = useState<InferenceJob[]>([
    { id: 'JOB-9812', name: 'GFP Variant Library Screening', model: 'ESM-2 Pathogenicity', status: 'COMPLETED', submittedAt: '10:42:15 AM', elapsedSec: 12.4, progress: 100 },
    { id: 'JOB-9813', name: 'FGFR3 Achondroplasia Mutational Map', model: 'ESMFold v2', status: 'COMPLETED', submittedAt: '10:45:32 AM', elapsedSec: 4.8, progress: 100 },
    { id: 'JOB-9814', name: 'PIK3CA Active Site Ligand Docking', model: 'DiffDock Bind', status: 'RUNNING', submittedAt: '10:59:12 AM', elapsedSec: 8.2, progress: 42 },
    { id: 'JOB-9815', name: 'MegaMolBART SMILES Interpolation 40x', model: 'MegaMolBART Gen', status: 'QUEUED', submittedAt: '11:00:05 AM', elapsedSec: 0, progress: 0 }
  ]);

  const handleCancelJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    toast.success(`Job ${id} canceled and purged from GPU task queue.`);
  };

  const handleDownloadPdb = (name: string) => {
    toast.success(`Downloading structure outputs for ${name}`);
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20">
              Inference Tasks
            </span>
            <span className="bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-blue-500/20">
              GPU Cluster Queue
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <ListOrdered className="w-8 h-8 text-[#76B900]" />
            Inference Jobs Workspace
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Track and manage high-throughput computing runs dispatched to your container nodes. Download computed coordinates and inspect pipeline throughput rates.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">Active Tasks</span>
            <h3 className="text-xs font-black text-slate-950 uppercase">Task Scheduler</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {jobs.length} Active Dispatch Runs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-mono font-black text-slate-400 uppercase">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Job Description</th>
                <th className="py-3 px-4">Foundation Model</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Progress</th>
                <th className="py-3 px-4">Execution Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-700">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{job.id}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 uppercase">{job.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-blue-600">{job.model}</td>
                  <td className="py-3.5 px-4">
                    {job.status === 'COMPLETED' && (
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase">
                        COMPLETED
                      </span>
                    )}
                    {job.status === 'RUNNING' && (
                      <span className="bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/20 px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase animate-pulse flex items-center gap-1 w-fit">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        RUNNING
                      </span>
                    )}
                    {job.status === 'QUEUED' && (
                      <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase">
                        QUEUED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#76B900] h-full" style={{ width: `${job.progress}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{job.elapsedSec ? `${job.elapsedSec}s` : '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {job.status === 'COMPLETED' ? (
                        <button 
                          onClick={() => handleDownloadPdb(job.name)}
                          className="p-1.5 border border-slate-200 hover:border-[#76B900]/40 text-slate-600 hover:text-[#76B900] hover:bg-[#76B900]/5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[9px] uppercase font-mono font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDB
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleCancelJob(job.id)}
                          className="p-1.5 border border-slate-200 hover:border-red-500/40 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
