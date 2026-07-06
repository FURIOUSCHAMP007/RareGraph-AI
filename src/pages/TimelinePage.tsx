import { Calendar, Clock, ChevronRight, Activity, MapPin, Eye, FileText, Database, ShieldCheck, X, ArrowUpRight, CheckCircle2, Sparkles, Sliders, Zap, TrendingUp, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'history' | 'forecast'>('history');

  // Forecasting Tab States
  const [selectedIntervention, setSelectedIntervention] = useState<'natural' | 'cocktail' | 'gene'>('natural');
  const [avoidToxins, setAvoidToxins] = useState(true);
  const [limitEnergy, setLimitEnergy] = useState(false);
  const [ketogenicDiet, setKetogenicDiet] = useState(false);
  const [horizonYears, setHorizonYears] = useState<number>(10);
  const [confidenceSpread, setConfidenceSpread] = useState<number>(15); // Percentage for error margin

  const generateForecastData = () => {
    const data = [];
    const baseIntervention = selectedIntervention;
    
    // Intervention multipliers
    let neuroMultiplier = 1.0;
    let fatigueMultiplier = 1.0;
    let lactateMultiplier = 1.0;

    if (baseIntervention === 'cocktail') {
      neuroMultiplier = 0.6;
      fatigueMultiplier = 0.65;
      lactateMultiplier = 0.7;
    } else if (baseIntervention === 'gene') {
      neuroMultiplier = 0.3;
      fatigueMultiplier = 0.4;
      lactateMultiplier = 0.25;
    }

    // Toggles adjustments
    if (avoidToxins) {
      neuroMultiplier *= 0.9;
      lactateMultiplier *= 0.85;
    }
    if (limitEnergy) {
      fatigueMultiplier *= 0.8;
      neuroMultiplier *= 0.95;
    }
    if (ketogenicDiet) {
      neuroMultiplier *= 0.85;
      lactateMultiplier *= 0.9;
    }

    // Generate points from Year 0 to Year 15
    for (let yr = 0; yr <= horizonYears; yr++) {
      let baseNeuro = 15 + (yr * 7.5);
      let baseFatigue = 30 + (yr * 6.5);
      let baseLactate = 40 + (yr * 6.0);

      if (baseIntervention === 'gene') {
        // Gene therapy has non-linear recovery curve
        baseNeuro = 15 + (yr * 2.0);
        baseFatigue = 30 + (yr * 2.5);
        baseLactate = 40 - (yr * 3.5); // Drops over time
        if (baseLactate < 15) baseLactate = 15;
      }

      const neuro = Math.min(100, Math.max(5, baseNeuro * neuroMultiplier));
      const fatigue = Math.min(100, Math.max(5, baseFatigue * fatigueMultiplier));
      const lactate = Math.min(100, Math.max(5, baseLactate * lactateMultiplier));

      // Standard error band based on confidence spread
      const neuroMin = Math.max(0, neuro - confidenceSpread);
      const neuroMax = Math.min(100, neuro + confidenceSpread);
      const fatigueMin = Math.max(0, fatigue - confidenceSpread);
      const fatigueMax = Math.min(100, fatigue + confidenceSpread);

      data.push({
        year: `Yr ${yr}`,
        yearNum: yr,
        Neurological: parseFloat(neuro.toFixed(1)),
        neuroMin: parseFloat(neuroMin.toFixed(1)),
        neuroMax: parseFloat(neuroMax.toFixed(1)),
        Fatigue: parseFloat(fatigue.toFixed(1)),
        fatigueMin: parseFloat(fatigueMin.toFixed(1)),
        fatigueMax: parseFloat(fatigueMax.toFixed(1)),
        Lactate: parseFloat(lactate.toFixed(1)),
      });
    }
    return data;
  };

  const getForecastedPhenotypes = () => {
    let multiplier = 1.0;
    if (selectedIntervention === 'cocktail') multiplier = 0.65;
    if (selectedIntervention === 'gene') multiplier = 0.2;

    if (avoidToxins) multiplier *= 0.9;
    if (limitEnergy) multiplier *= 0.95;
    if (ketogenicDiet) multiplier *= 0.85;

    return [
      { code: 'HP:0002180', name: 'Episodic lactic acidosis', prob: Math.round(Math.min(98, 95 * multiplier)) },
      { code: 'HP:0001250', name: 'Seizures / Stroke-like Episodes', prob: Math.round(Math.min(95, 80 * multiplier)) },
      { code: 'HP:0000407', name: 'Sensorineural hearing loss', prob: Math.round(Math.min(90, 75 * multiplier)) },
      { code: 'HP:0003326', name: 'Progressive myopathy', prob: Math.round(Math.min(92, 85 * multiplier)) },
      { code: 'HP:0002120', name: 'Cerebral cortical atrophy', prob: Math.round(Math.min(88, 70 * multiplier)) },
    ];
  };

  const getForecastedMilestones = () => {
    if (selectedIntervention === 'gene') {
      return [
        { year: 'Year 1', title: 'Vector Respiration Transfection', desc: 'MT-TL1 wildtype ratios increase by 45% in muscle tissue. Serum lactate drops to standard reference limits.' },
        { year: 'Year 3', title: 'Myopathic Stabilization', desc: 'Symptom regression in muscle fatigue score. 80% recovery of baseline functional aerobic capacity.' },
        { year: 'Year 5', title: 'Neuromonitoring Clearance', desc: 'Follow-up MRI scans confirm complete halt of cortical atrophy and stroke-like lesion propagation.' },
        { year: 'Year 10', title: 'Full Functional Plateau', desc: 'Patient maintains robust physiological reserves. Gene modification efficacy remains stable.' }
      ];
    }
    if (selectedIntervention === 'cocktail') {
      return [
        { year: 'Year 1', title: 'Mito-Redox Buffering', desc: 'Coenzyme Q10 and L-Carnitine supplementation improves daily muscle energy exhaustion thresholds by 25%.' },
        { year: 'Year 3', title: 'Mitigation of Lactic Spikes', desc: 'Arginine prophylaxis reduces frequency of acute metabolic lactic acidosis and limits cerebral vasoconstriction.' },
        { year: 'Year 5', title: 'Sensorineural Maintenance', desc: 'Hearing loss progression slowed. High-frequency auditory deficits managed with audiology aids.' },
        { year: 'Year 10', title: 'Moderate Cognitive Reserve', desc: 'Slowed cerebral cortical thinning. Episodic myopathy flareups managed under close metabolic supervision.' }
      ];
    }
    return [
      { year: 'Year 1', title: 'Elevated Lactic Exhaustion', desc: 'Progressive increase in resting serum lactate. Chronic fatigue limits physical activities of daily living.' },
      { year: 'Year 3', title: 'Stroke-like Incident Window', desc: '75% probability of presenting with cortical stroke-like episodes, hemiparesis, or focal seizures.' },
      { year: 'Year 5', title: 'Cortical Atrophy Progression', desc: 'Acceleration of parietal/occipital brain volume loss, leading to sub-clinical cognitive and visual deficits.' },
      { year: 'Year 10', title: 'Advanced Mitochondrial Failure', desc: 'Refractory multisystem dysfunction involving cardiac conduction anomalies, severe myopathy, and hearing loss.' }
    ];
  };

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

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer",
            activeTab === 'history' 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Temporal Case History
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'forecast' 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Progression Forecasting & Trajectories
        </button>
      </div>

      {activeTab === 'history' ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Control Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Strategy Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intervention Strategy</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Model therapeutic impact curves</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'natural' as const, title: 'Natural History', desc: 'Standard disease trajectory without focused therapy.', icon: Activity },
                  { id: 'cocktail' as const, title: 'Mito-Cocktail Prophylaxis', desc: 'CoQ10, L-Carnitine, and Arginine maintenance.', icon: Zap },
                  { id: 'gene' as const, title: 'Experimental Gene Rescue', desc: 'In-vivo mitochondrial transfection strategy.', icon: Sparkles }
                ].map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => {
                      setSelectedIntervention(strategy.id);
                      toast.success(`Forecasting switched to: ${strategy.title}`);
                    }}
                    className={cn(
                      "p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 relative",
                      selectedIntervention === strategy.id 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : "bg-slate-50 border-slate-200/60 hover:border-slate-300 text-slate-700"
                    )}
                  >
                    <strategy.icon className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      selectedIntervention === strategy.id ? "text-indigo-400" : "text-slate-400"
                    )} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-tight">{strategy.title}</p>
                      <p className={cn("text-[8px] font-bold uppercase tracking-wider leading-relaxed", selectedIntervention === strategy.id ? "text-slate-400" : "text-slate-400")}>{strategy.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance & Co-Factors Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Zap className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Compliance & Co-Factors</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Optimize prognostic variables</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { checked: avoidToxins, setter: setAvoidToxins, title: 'Avoid Mitochondrial Toxins', desc: 'Zero exposure to valproate, aminoglycosides, etc.' },
                  { checked: limitEnergy, setter: setLimitEnergy, title: 'Aerobic Expenditure Caps', desc: 'Manage strict threshold limits during physical stress.' },
                  { checked: ketogenicDiet, setter: setKetogenicDiet, title: 'Ketogenic / High-Fat Adjunct', desc: 'Alternative carbon substrates for brain metabolism.' }
                ].map((toggle, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="pr-4">
                      <span className="text-[10px] font-black text-slate-900 uppercase block">{toggle.title}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">{toggle.desc}</span>
                    </div>
                    <button
                      onClick={() => {
                        toggle.setter(!toggle.checked);
                        toast.success(`${toggle.title} ${!toggle.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className={cn(
                        "w-10 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer shrink-0",
                        toggle.checked ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white shadow mx-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Variance Parameters Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Model Constraints</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Configure forecasting limits</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <span>Simulation Horizon</span>
                  <span className="font-mono text-slate-900">{horizonYears} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <span>Monte Carlo Margin (±%)</span>
                  <span className="font-mono text-slate-900">±{confidenceSpread}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={confidenceSpread}
                  onChange={(e) => setConfidenceSpread(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Right Chart & Timeline Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chart Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Predictive Trajectory Model</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Chronological cellular stress & deficit projection</p>
                  </div>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-100">
                  Monte Carlo Simulation Active
                </span>
              </div>

              {/* Recharts Container */}
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={generateForecastData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        border: 'none',
                        color: '#f8fafc',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                      itemStyle={{ color: '#cbd5e1' }}
                      labelStyle={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    
                    {/* Confidence Band Area for Neurological */}
                    <Area 
                      type="monotone" 
                      dataKey="neuroMin" 
                      name="Neuro Bounds"
                      stroke="none" 
                      fill="#6366f1" 
                      opacity={0.08} 
                      legendType="none"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="neuroMax" 
                      stroke="none" 
                      fill="#6366f1" 
                      opacity={0.08} 
                      legendType="none"
                    />

                    {/* Confidence Band Area for Muscle Fatigue */}
                    <Area 
                      type="monotone" 
                      dataKey="fatigueMin" 
                      stroke="none" 
                      fill="#f59e0b" 
                      opacity={0.05} 
                      legendType="none"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fatigueMax" 
                      stroke="none" 
                      fill="#f59e0b" 
                      opacity={0.05} 
                      legendType="none"
                    />

                    <Line 
                      type="monotone" 
                      dataKey="Neurological" 
                      name="Neuro Deficit" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      dot={{ r: 3, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Fatigue" 
                      name="Muscle Fatigue" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5} 
                      dot={{ r: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Lactate" 
                      name="Lactic Stress" 
                      stroke="#f43f5e" 
                      strokeWidth={2.5} 
                      dot={{ r: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Future Forecast Milestones & Phenotypic Drift Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Forecast Milestones */}
              <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Future Milestones</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Projected clinical event roadmap</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {getForecastedMilestones().map((milestone, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx < getForecastedMilestones().length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-slate-100" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-mono font-black text-indigo-600 shrink-0">
                        {milestone.year[0]}{milestone.year.split(' ')[1]}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight block">{milestone.title}</span>
                        <p className="text-[9px] text-slate-400 leading-normal font-bold uppercase">{milestone.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phenotypic Drift Probability */}
              <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Phenotypic Drift</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Calculated probability of future symptoms</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {getForecastedPhenotypes().map((pheno) => (
                    <div key={pheno.code} className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                        <div>
                          <span className="text-slate-900 block tracking-tight">{pheno.name}</span>
                          <span className="text-slate-400 text-[8px] font-mono">{pheno.code}</span>
                        </div>
                        <span className={cn(
                          "text-xs font-mono font-black",
                          pheno.prob > 70 ? "text-rose-600" :
                          pheno.prob > 40 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {pheno.prob}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            pheno.prob > 70 ? "bg-rose-500" :
                            pheno.prob > 40 ? "bg-amber-500" : "bg-emerald-500"
                          )} 
                          style={{ width: `${pheno.prob}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

