import React from 'react';
import { motion } from 'motion/react';
import BioreactorStatus from '../components/BioreactorStatus';
import { FlaskConical } from 'lucide-react';

export default function BioreactorPage() {
  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-emerald-500/20">
              Fermentation Stream
            </span>
            <span className="bg-[#76B900]/15 text-[#76B900] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-[#76B900]/20">
              NIM-Controlled
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-[#76B900]" />
            NIM-Controlled Bioreactor State
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed mt-2">
            Monitor real-time bioreactor metrics for protein expression. Analyze high-fidelity charts for pH, dissolved oxygen, temperature, and cell biomass density regulated by autonomous agents.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BioreactorStatus />
      </motion.div>
    </div>
  );
}
