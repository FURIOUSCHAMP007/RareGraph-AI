import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, Eye, Layers, ZoomIn, ZoomOut, Maximize2, ShieldAlert, CheckCircle2, 
  Sparkles, RefreshCw, AlertCircle, FileText, Upload, Sliders
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ImagingAIPage() {
  const [activeTab, setActiveTab] = useState<'radiology' | 'histopathology'>('radiology');

  // Radiology states
  const [selectedScan, setSelectedScan] = useState<'mri_brain' | 'chest_xray' | 'ct_abdomen'>('mri_brain');
  const [mriLayer, setMriLayer] = useState<number>(3); // 1-5 sliders
  const [isRadiologyAnalyzing, setIsRadiologyAnalyzing] = useState(false);
  const [radiologyAnnotations, setRadiologyAnnotations] = useState<boolean>(true);
  const [mriZoom, setMriZoom] = useState<number>(1);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // MONAI Deploy Engine States
  const [monaiModel, setMonaiModel] = useState<'segresnet' | 'unetr' | 'clara'>('segresnet');
  const [segmentationConfidence, setSegmentationConfidence] = useState<number>(0.75);
  const [isMonaiRunning, setIsMonaiRunning] = useState<boolean>(false);
  const [monaiLogs, setMonaiLogs] = useState<string[]>([
    "[MONAI PIPELINE READY] Loaded SegResNet neural weights on Triton",
    "[CUDA:0] Active memory usage: 12.4 GB / 48 GB (RTX A6000)",
    "[DICOM PARSER] Extracted voxel resolution: [0.5, 0.5, 1.2] mm",
    "[VOXEL ENGINE] Initialized safe inference boundary constraints"
  ]);

  const addMonaiLog = (line: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMonaiLogs(prev => [`[${timestamp}] ${line}`, ...prev.slice(0, 7)]);
  };

  // Histopathology states
  const [magnification, setMagnification] = useState<'4x' | '10x' | '40x'>('10x');
  const [isHistoAnalyzing, setIsHistoAnalyzing] = useState(false);
  const [histoType, setHistoType] = useState<'muscle_biopsy' | 'skin_biopsy'>('muscle_biopsy');
  const [detectedStructures, setDetectedStructures] = useState<boolean>(true);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    toast.success("Medical image uploaded successfully. Scanning DICOM metadata...");
  };

  const runRadiologyAI = () => {
    setIsRadiologyAnalyzing(true);
    addMonaiLog("Requesting full-volume CNN image scan...");
    setTimeout(() => {
      setIsRadiologyAnalyzing(false);
      addMonaiLog("CNN image classification finished with 92.4% confidence");
      toast.success("Radiology AI diagnostic synthesis complete.");
    }, 1200);
  };

  const runMonaiSegmentation = () => {
    setIsMonaiRunning(true);
    addMonaiLog(`Starting voxel segmentation with MONAI ${monaiModel.toUpperCase()} pipeline...`);
    
    setTimeout(() => {
      addMonaiLog("Allocating dedicated H100 MIG slice tensors.");
    }, 400);

    setTimeout(() => {
      addMonaiLog(`3D Segmentation finished. Mean Dice Coefficient: ${(0.89 + Math.random() * 0.08).toFixed(3)}`);
      setIsMonaiRunning(false);
      toast.success(`MONAI ${monaiModel.toUpperCase()} voxel segmentation updated.`);
    }, 1200);
  };

  const runHistoAI = () => {
    setIsHistoAnalyzing(true);
    setTimeout(() => {
      setIsHistoAnalyzing(false);
      toast.success("Histopathology digital slide profiling complete.");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Multi-Modal Imaging AI</h2>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] ml-1">Deep Learning Radiology & Histopathology Suite</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('radiology')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              activeTab === 'radiology' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Radiology AI (DICOM/MRI)
          </button>
          <button 
            onClick={() => setActiveTab('histopathology')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              activeTab === 'histopathology' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Histopathology (H&E Tissue Slide)
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'radiology' ? (
          <motion.div 
            key="radiology-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Viewport Column */}
            <div className="lg:col-span-8 bg-slate-950 rounded-[40px] p-8 shadow-inner border border-slate-900 flex flex-col justify-between min-h-[550px] relative overflow-hidden">
              {/* Scan Overlay Header */}
              <div className="flex items-center justify-between text-white z-10">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DICOM VIEWPORT</span>
                  <h3 className="text-base font-black uppercase tracking-tight">{selectedScan === 'mri_brain' ? 'Axial Brain MRI (T2-weighted)' : selectedScan === 'chest_xray' ? 'Chest Radiograph (PA View)' : 'Abdominal CT Scan'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setMriZoom(prev => Math.min(prev + 0.2, 2))}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setMriZoom(prev => Math.max(prev - 0.2, 0.8))}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">{Math.round(mriZoom * 100)}%</span>
                </div>
              </div>

              {/* MRI Viewport Screen */}
              <div className="flex-1 flex items-center justify-center relative py-12">
                {/* SVG Mockup representing MRI scan slice / image */}
                <motion.div 
                  style={{ scale: mriZoom }}
                  className="w-80 h-80 relative flex items-center justify-center transition-all duration-300"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full text-slate-800">
                    <defs>
                      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#brainGlow)" stroke="#1e293b" strokeWidth="2" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                    
                    {/* MRI Brain Structure Outline */}
                    <path 
                      d="M100,30 C70,30 50,50 50,90 C50,130 65,170 100,170 C135,170 150,130 150,90 C150,50 130,30 100,30 Z" 
                      fill="none" 
                      stroke="#475569" 
                      strokeWidth="3" 
                    />

                    {/* Ventricles / Slices mapping dynamically based on Slider Layer */}
                    <path 
                      d={`M100,70 C${80 - mriLayer*2},70 ${70 - mriLayer*3},80 ${80 - mriLayer*2},100 C${90 - mriLayer*2},120 100,130 100,130 C100,130 ${110 + mriLayer*2},120 ${120 + mriLayer*2},100 C${120 + mriLayer*2},80 ${120 + mriLayer*2},70 100,70 Z`} 
                      fill="none" 
                      stroke="#64748b" 
                      strokeWidth="2.5" 
                    />

                    {/* AI Annotation Bounding Box & Hotspot */}
                    {radiologyAnnotations && (
                      <>
                        {/* Basal Ganglia Hyperintensity Indicator (Typical in Leigh Syndrome) */}
                        <motion.circle 
                          cx="85" cy="95" r={8 + segmentationConfidence * 12} 
                          fill="#f43f5e" fillOpacity="0.15"
                          stroke="#f43f5e" strokeWidth="1.5"
                          strokeDasharray="3,3"
                          animate={{ scale: [0.98, 1.02, 0.98] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle 
                          cx="115" cy="95" r={8 + segmentationConfidence * 12} 
                          fill="#f43f5e" fillOpacity="0.15"
                          stroke="#f43f5e" strokeWidth="1.5"
                          strokeDasharray="3,3"
                          animate={{ scale: [1.02, 0.98, 1.02] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* MONAI Model Specific Overlays */}
                        {monaiModel === 'segresnet' && (
                          <g>
                            {/* Fuchsia active SegResNet lesion contours */}
                            <path 
                              d={`M70,95 C75,${95 - segmentationConfidence * 20} 95,${95 - segmentationConfidence * 20} 100,95 C105,95 125,${95 + segmentationConfidence * 20} 130,95`}
                              fill="none"
                              stroke="#d946ef"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              className="animate-pulse"
                            />
                            <circle cx="85" cy="95" r={segmentationConfidence * 6} fill="#d946ef" fillOpacity="0.4" />
                            <circle cx="115" cy="95" r={segmentationConfidence * 6} fill="#d946ef" fillOpacity="0.4" />
                            <text x="45" y="162" fill="#d946ef" fontSize="6.5" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">
                              MONAI SEGRESNET ACTIVE MASK: {(segmentationConfidence * 100).toFixed(0)}% THRESHOLD
                            </text>
                          </g>
                        )}

                        {monaiModel === 'unetr' && (
                          <g>
                            {/* Neon-green UNETR grid voxel cells */}
                            <rect x="75" y="85" width={segmentationConfidence * 15} height={segmentationConfidence * 15} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="1,1" />
                            <rect x="110" y="85" width={segmentationConfidence * 15} height={segmentationConfidence * 15} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="1,1" />
                            <text x="45" y="162" fill="#10b981" fontSize="6.5" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">
                              MONAI UNETR 3D TRANSFORMER CELLS ACTIVE
                            </text>
                          </g>
                        )}

                        {monaiModel === 'clara' && (
                          <g>
                            {/* Blue targeting lines */}
                            <line x1="85" y1="60" x2="85" y2="130" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="115" y1="60" x2="115" y2="130" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" />
                            <circle cx="85" cy="95" r={segmentationConfidence * 10} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                            <circle cx="115" cy="95" r={segmentationConfidence * 10} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                            <text x="45" y="162" fill="#3b82f6" fontSize="6.5" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">
                              NVIDIA CLARA™ PARALLEL LESION LOCALIZER COORDS
                            </text>
                          </g>
                        )}

                        <text x="50" y="152" fill="#f43f5e" fontSize="7" fontWeight="bold" letterSpacing="1">BILATERAL BASAL GANGLIA HYPERINTENSITY</text>
                      </>
                    )}
                  </svg>

                  {/* Absolute heat map values */}
                  <div className="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-slate-300 border border-slate-800 text-[8px] font-mono leading-none">
                    <p className="text-white font-bold mb-1">COORDINATES</p>
                    <p>Z-AXIS SLICE: {mriLayer} / 5</p>
                    <p className="mt-1 text-emerald-400">DICOM COMPLIANT</p>
                  </div>
                </motion.div>
              </div>

              {/* Viewport controls footer */}
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-t border-slate-900 pt-6">
                <div className="w-full md:w-72 space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    <span>Axial Slice depth</span>
                    <span>Slice {mriLayer} of 5</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={mriLayer} 
                    onChange={(e) => setMriLayer(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={radiologyAnnotations} 
                      onChange={(e) => setRadiologyAnnotations(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-indigo-500/10 w-4 h-4" 
                    />
                    AI Annotation Layers
                  </label>
                </div>
              </div>
            </div>

            {/* Sidebar Controls Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Scan Selectors */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scan Selection</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'mri_brain' as const, label: 'Brain MRI (T2 FLAIR)', detail: 'Mitochondrial Encephalomyopathy' },
                    { id: 'chest_xray' as const, label: 'Chest Radiography', detail: 'Respiratory Insufficiency' },
                    { id: 'ct_abdomen' as const, label: 'CT Abdomen/Pelvis', detail: 'Organic Acidosis Mapping' }
                  ].map(scan => (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setSelectedScan(scan.id);
                        toast.success(`DICOM scan loaded: ${scan.label}`);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all relative overflow-hidden cursor-pointer",
                        selectedScan === scan.id 
                          ? "bg-slate-900 text-white border-transparent shadow-lg" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/60"
                      )}
                    >
                      <p className="font-black uppercase">{scan.label}</p>
                      <p className={cn("text-[9px] font-medium leading-none mt-1", selectedScan === scan.id ? "text-slate-400" : "text-slate-400")}>{scan.detail}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Panel */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-[32px] p-8 text-center transition-all cursor-pointer",
                  isDraggingFile 
                    ? "border-indigo-500 bg-indigo-50/50" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-black text-slate-900 uppercase">Upload DICOM Study</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drag and drop or select files</p>
              </div>

              {/* Diagnostic Synthesis Result */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Radiology AI Findings</h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-rose-900 uppercase">Leigh Syndrome Symmetrical Lesions</p>
                      <p className="text-[10px] text-rose-700 leading-normal mt-1 font-medium">
                        Bilateral symmetrical hyperintensities detected in basal ganglia, thalami, and brainstem—characteristic of Leigh disease and mitochondrial RC Complex I deficiencies.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">AI Diagnosis Confidence</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest leading-none">
                        Confidence Index: 92.4% (DeepCNN-9)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={runRadiologyAI}
                  disabled={isRadiologyAnalyzing}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRadiologyAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                  {isRadiologyAnalyzing ? "Analyzing Scans..." : "Re-Run Image Classification"}
                </button>
              </div>

              {/* NVIDIA MONAI Deploy Hub */}
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#76B900] animate-pulse" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#76B900]">NVIDIA MONAI™ Deploy Hub</h4>
                  </div>
                  <span className="bg-[#76B900]/10 text-[#76B900] text-[8px] font-mono border border-[#76B900]/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                    ACTIVE PIPELINE
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Model Pipeline Selector</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'segresnet' as const, label: 'SegResNet' },
                        { id: 'unetr' as const, label: 'UNETR 3D' },
                        { id: 'clara' as const, label: 'Clara Local' }
                      ].map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setMonaiModel(model.id);
                            addMonaiLog(`Switched active segmentation weights to: ${model.label}`);
                            toast.info(`Active pipeline switched to ${model.label}`);
                          }}
                          className={cn(
                            "py-2 rounded-xl text-[8px] font-black uppercase border tracking-widest transition-all cursor-pointer",
                            monaiModel === model.id
                              ? "bg-[#76B900] text-black border-transparent shadow-md font-black"
                              : "bg-slate-950 text-slate-400 border-slate-850 hover:text-white"
                          )}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confidence / Threshold Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      <span>Voxel Threshold</span>
                      <span className="text-[#76B900] font-mono font-bold">{(segmentationConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.15" 
                      max="0.95" 
                      step="0.05"
                      value={segmentationConfidence} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSegmentationConfidence(val);
                        if (Math.random() > 0.6) {
                          addMonaiLog(`Adjusted classifier decision boundaries to ${val.toFixed(2)}`);
                        }
                      }}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-[#76B900]" 
                    />
                  </div>

                  {/* Terminal Box */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Live Triton CUDA Stream</span>
                    <div className="bg-black/90 rounded-2xl border border-slate-800 p-3 h-28 font-mono text-[7.5px] text-emerald-400/90 overflow-y-auto space-y-1 leading-normal select-text">
                      {monaiLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <span className="text-slate-600 select-none">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={runMonaiSegmentation}
                  disabled={isMonaiRunning}
                  className="w-full py-3.5 bg-gradient-to-r from-[#76B900] to-emerald-500 disabled:opacity-50 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isMonaiRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  {isMonaiRunning ? "Segmenting voxels..." : "Run MONAI Voxel Segmenter"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="histopathology-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Viewport Column */}
            <div className="lg:col-span-8 bg-slate-950 rounded-[40px] p-8 shadow-inner border border-slate-900 flex flex-col justify-between min-h-[550px] relative overflow-hidden">
              <div className="flex items-center justify-between text-white z-10">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DIGITAL PATHOLOGY VIEWPORT</span>
                  <h3 className="text-base font-black uppercase tracking-tight">{histoType === 'muscle_biopsy' ? 'Gomori Trichrome Muscle Biopsy Slide' : 'H&E Skin Punch Biopsy Slide'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {['4x', '10x', '40x'].map((mag) => (
                    <button
                      key={mag}
                      onClick={() => {
                        setMagnification(mag as any);
                        toast.success(`Magnification toggled to ${mag}`);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all cursor-pointer",
                        magnification === mag 
                          ? "bg-white text-slate-900 border-transparent shadow-lg" 
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      )}
                    >
                      {mag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tissue Slide SVG Visualization */}
              <div className="flex-1 flex items-center justify-center relative py-12">
                <div className="w-80 h-80 relative flex items-center justify-center rounded-full overflow-hidden border border-slate-800 bg-slate-900">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-pink-100">
                    <defs>
                      <radialGradient id="tissueBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#db2777" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#831843" stopOpacity="0.05" />
                      </radialGradient>
                    </defs>
                    
                    {/* Background slide cells */}
                    <circle cx="100" cy="100" r="95" fill="url(#tissueBg)" />
                    
                    {/* Tissue Fibers mapping with varying sizing based on Magnification */}
                    <g className="opacity-80">
                      {/* Normal Muscle Fibers */}
                      <polygon points="40,50 90,40 100,80 50,90" fill="#f472b6" fillOpacity="0.4" stroke="#db2777" strokeWidth="1" />
                      <polygon points="105,40 160,50 150,90 95,80" fill="#f472b6" fillOpacity="0.4" stroke="#db2777" strokeWidth="1" />
                      <polygon points="30,100 85,95 90,140 40,150" fill="#f472b6" fillOpacity="0.4" stroke="#db2777" strokeWidth="1" />
                      
                      {/* Ragged-Red Muscle Fiber (Mitochondrial Disease Key Indicator) */}
                      <polygon 
                        points="100,95 160,95 150,150 95,140" 
                        fill={detectedStructures ? "#dc2626" : "#f472b6"} 
                        fillOpacity="0.6" 
                        stroke="#b91c1c" 
                        strokeWidth="2.5" 
                      />

                      {/* Mitochondrial Accumulation Clusters (Red Dots) */}
                      {detectedStructures && (
                        <>
                          <circle cx="105" cy="105" r="2" fill="#ef4444" />
                          <circle cx="115" cy="100" r="2.5" fill="#ef4444" />
                          <circle cx="120" cy="115" r="1.5" fill="#ef4444" />
                          <circle cx="140" cy="110" r="3" fill="#ef4444" />
                          <circle cx="135" cy="130" r="2" fill="#ef4444" />
                          <circle cx="110" cy="135" r="2.5" fill="#ef4444" />
                          
                          <path d="M125,120 L165,160" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                          <text x="110" y="175" fill="#ef4444" fontSize="7" fontWeight="bold">RAGGED-RED FIBER (MITOCHONDRIAL AGGREGATES)</text>
                        </>
                      )}
                    </g>
                  </svg>
                </div>
              </div>

              {/* Viewport Footer */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Stain Type: Gomori Trichrome (GT)
                </span>
                
                <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={detectedStructures} 
                    onChange={(e) => setDetectedStructures(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-pink-500 w-4 h-4" 
                  />
                  Highlight Mitochondrial Aggregates
                </label>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Slide Selector */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Slide Selection</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'muscle_biopsy' as const, label: 'Muscle Biopsy (Gomori Trichrome)', detail: 'Assess for ragged-red fibers & respiratory chains' },
                    { id: 'skin_biopsy' as const, label: 'Skin punch biopsy (H&E)', detail: 'Fibroblast metabolic screening' }
                  ].map(slide => (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setHistoType(slide.id);
                        toast.success(`Tissue slide loaded: ${slide.label}`);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all relative overflow-hidden cursor-pointer",
                        histoType === slide.id 
                          ? "bg-slate-900 text-white border-transparent shadow-lg" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/60"
                      )}
                    >
                      <p className="font-black uppercase">{slide.label}</p>
                      <p className="text-[9px] font-medium leading-none mt-1 text-slate-400">{slide.detail}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tissue Metrics */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-pink-600 animate-pulse" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Slide Profiling Findings</h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-pink-900 uppercase">Ragged-Red Fibers (RRF)</p>
                      <p className="text-[10px] text-pink-700 leading-normal mt-1 font-medium">
                        Positive for subsarcolemmal mitochondrial accumulations. Estimated RRF density is 4.8% of skeletal muscle tissue, confirming mitochondrial cytopathy.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Subcellular Profiling</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest leading-none">
                        Complex I Deficiency: Highly Probable
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={runHistoAI}
                  disabled={isHistoAnalyzing}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isHistoAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                  {isHistoAnalyzing ? "Profiling Slide..." : "Analyze Slide Histopathology"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
