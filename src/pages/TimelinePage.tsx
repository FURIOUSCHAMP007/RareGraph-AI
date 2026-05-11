import { Calendar, Clock, ChevronRight, Activity, MapPin, Eye, FileText, Database, ShieldCheck, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface TimelineEvent {
  date: string;
  title: string;
  desc: string;
  type: 'clinical' | 'consult' | 'imaging' | 'genomic' | 'ai';
  details: {
    files: Array<{ name: string; size: string; type: string }>;
    hpo_codes?: string[];
    confidence?: number;
    protocol_status: 'Compliant' | 'Manual Review Required' | 'Warning';
    clinical_note: string;
  };
}

export default function TimelinePage() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeModal, setActiveModal] = useState<'raw' | 'protocol' | null>(null);

  const events: TimelineEvent[] = [
    { 
      date: '2022-03-15', 
      title: 'Initial Symptom Onset', 
      desc: 'Patient reported episodic muscle weakness (myopathy) following physical exertion.', 
      type: 'clinical',
      details: {
        files: [{ name: 'Clinical_Intake_01.pdf', size: '1.2 MB', type: 'PDF' }],
        hpo_codes: ['HP:0001324', 'HP:0003326'],
        protocol_status: 'Compliant',
        clinical_note: 'Muscle fatigue scores were consistent with exercise-induced exhaustion.'
      }
    },
    { 
      date: '2023-01-10', 
      title: 'Neurological Consultation', 
      desc: 'Referral for sensory-neural hearing loss. Audiogram confirmed bilateral deficit.', 
      type: 'consult',
      details: {
        files: [{ name: 'Audiometry_Report.xml', size: '450 KB', type: 'XML' }],
        hpo_codes: ['HP:0000407'],
        protocol_status: 'Compliant',
        clinical_note: 'Bilateral sensorineural hearing loss detected across high frequencies.'
      }
    },
    { 
      date: '2024-05-02', 
      title: 'MRI Brain Protocol', 
      desc: 'Detection of cortical atrophy and elevated lactate on spectroscopy.', 
      type: 'imaging',
      details: {
        files: [{ name: 'MRI_T1_T2_FLAIR.dcm', size: '840 MB', type: 'DICOM' }, { name: 'Spectroscopy_Lactate.raw', size: '12 MB', type: 'DATA' }],
        hpo_codes: ['HP:0002120'],
        protocol_status: 'Compliant',
        clinical_note: 'Stroke-like lesions identified in posterior regions. MRS peak at 1.3 ppm.'
      }
    },
    { 
      date: '2025-02-18', 
      title: 'WES Data Received', 
      desc: 'Whole Exome Sequencing identifies MT-TL1 pathogenic variant.', 
      type: 'genomic',
      details: {
        files: [{ name: 'HG002_Sample.fastq.gz', size: '45 GB', type: 'FASTQ' }, { name: 'Variants.vcf', size: '1.4 GB', type: 'VCF' }],
        hpo_codes: ['HP:0001427'],
        protocol_status: 'Compliant',
        clinical_note: '95% heteroplasmy detected for m.3243A>G variant in blood sample.'
      }
    },
    { 
      date: '2026-05-07', 
      title: 'AI Synthesis (RareGraph)', 
      desc: 'Diagnosis inferred: MELAS Syndrome with 94.2% confidence score.', 
      type: 'ai',
      details: {
        files: [{ name: 'Reasoning_Trace.json', size: '4.5 MB', type: 'JSON' }],
        confidence: 0.942,
        protocol_status: 'Compliant',
        clinical_note: 'Cross-reference analysis between MRS lactate and Genomic variants confirm mitochondrial syndrome.'
      }
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Case Timeline</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-[0.3em] font-bold">Temporal Disease Progression & Clinical Milestones</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
           <Calendar className="w-3 h-3 text-indigo-600" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">48 Month Span</span>
        </div>
      </div>

      <div className="relative mt-20 pr-4 sm:pr-0">
        <div className="absolute left-[24px] sm:left-[50px] top-0 bottom-0 w-[1px] bg-slate-200" />
        <div className="absolute left-[24px] sm:left-[50px] top-0 w-[1px] h-32 bg-gradient-to-b from-indigo-600 to-slate-200" />

        <div className="space-y-16">
          {events.map((event, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-16 sm:pl-32"
            >
              <div className={cn(
                "absolute left-[8px] sm:left-[34px] top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-4 border-slate-50 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer",
                event.type === 'ai' ? "bg-indigo-600 text-white shadow-indigo-200" :
                event.type === 'imaging' ? "bg-blue-500 text-white shadow-blue-200" :
                event.type === 'genomic' ? "bg-emerald-500 text-white shadow-emerald-200" :
                "bg-white text-slate-400"
              )}>
                {event.type === 'ai' ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                 event.type === 'imaging' ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> :
                 event.type === 'genomic' ? <Activity className="w-4 h-4 sm:w-5 sm:h-5" /> :
                 <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest mb-1 shadow-sm">
                  {event.date}
                </span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {event.title}
                </h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group max-w-3xl">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bold uppercase tracking-wide opacity-80 mb-8 border-l-2 border-indigo-100 pl-4">
                  {event.desc}
                </p>

                <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-slate-50">
                   <button 
                     onClick={() => { setSelectedEvent(event); setActiveModal('raw'); }}
                     className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                   >
                     <Database className="w-3.5 h-3.5 text-blue-400" />
                     View Raw Data
                   </button>
                   <button 
                     onClick={() => { setSelectedEvent(event); setActiveModal('protocol'); }}
                     className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                   >
                     <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                     Compare to Protocol
                   </button>
                   
                   {event.details.hpo_codes && (
                     <div className="hidden sm:flex gap-2 ml-auto">
                        {event.details.hpo_codes.map(code => (
                          <span key={code} className="text-[9px] font-mono font-bold py-1 px-2 border border-slate-100 rounded text-slate-400">
                            {code}
                          </span>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => { setSelectedEvent(null); setActiveModal(null); }}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden mt-8 mb-8"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{activeModal === 'raw' ? 'DATA REPOSITORY' : 'PROTOCOL COMPLIANCE'}</h4>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedEvent.title}</h3>
                </div>
                <button 
                   onClick={() => { setSelectedEvent(null); setActiveModal(null); }}
                   className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto">
                {activeModal === 'raw' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {selectedEvent.details.files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 group hover:border-indigo-100 hover:bg-white transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                 <FileText className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{file.name}</p>
                                 <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{file.size} • {file.type} OBJECT</p>
                              </div>
                           </div>
                           <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                      <div className="flex items-center gap-2 mb-3">
                         <ShieldCheck className="w-4 h-4 text-blue-400" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Traceability</span>
                      </div>
                      <p className="text-[10px] font-mono leading-relaxed opacity-60 break-all uppercase">
                        SHA256: 8f9b2c3d1e4a7f0e9b2c3d1e4a7f0e8f9b2c3d1e4a7f0e9b2c3d1e4a7f0e
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <div>
                             <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Status</p>
                             <p className="text-lg font-black text-emerald-600 uppercase tracking-tight">{selectedEvent.details.protocol_status}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">v1.2.0-STABLE</span>
                    </div>

                    <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ontology Grounding</h5>
                       <div className="flex flex-wrap gap-2">
                          {selectedEvent.details.hpo_codes?.map(code => (
                            <div key={code} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-indigo-500" />
                               <span className="text-[11px] font-mono font-bold text-slate-600">{code}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clincial Reasoning Context</h5>
                       <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 italic">
                         "{selectedEvent.details.clinical_note}"
                       </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                 <button 
                   onClick={() => { setSelectedEvent(null); setActiveModal(null); }}
                   className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98]"
                 >
                   Dismiss Inspector
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

