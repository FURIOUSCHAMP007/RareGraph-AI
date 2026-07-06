import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Activity, 
  Database, 
  FileSearch, 
  Home, 
  Menu, 
  Share2, 
  ShieldAlert, 
  ShieldCheck,
  GitBranch,
  Users,
  Upload,
  Sparkles,
  Eye,
  Pill,
  Globe,
  X,
  ChevronRight,
  FlaskConical,
  BookOpen,
  PieChart,
  Dna,
  Zap,
  FileText,
  Clock,
  History,
  Scan,
  Cpu,
  Download,
  StickyNote,
  Edit3,
  Radio,
  Atom,
  ListOrdered,
  Sliders,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Lazy loaded components for better initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'));
const DiagnosisPage = lazy(() => import('./pages/DiagnosisPage'));
const GraphExplorer = lazy(() => import('./pages/GraphExplorer'));
const GenomicPage = lazy(() => import('./pages/GenomicPage'));
const PedigreePage = lazy(() => import('./pages/PedigreePage'));
const SimilarityPage = lazy(() => import('./pages/SimilarityPage'));
const EntitizerPage = lazy(() => import('./pages/EntitizerPage'));
const TrialMatcherPage = lazy(() => import('./pages/TrialMatcherPage'));
const MultiOmicsPage = lazy(() => import('./pages/MultiOmicsPage'));
const ReportGeneratorPage = lazy(() => import('./pages/ReportGeneratorPage'));
const PharmacogenomicsPage = lazy(() => import('./pages/PharmacogenomicsPage'));
const BioNeMoDashboardPage = lazy(() => import('./pages/BioNeMoDashboardPage'));
const BioNeMoFeaturesPage = lazy(() => import('./pages/BioNeMoFeaturesPage'));
const NvidiaMonitorPage = lazy(() => import('./pages/NvidiaMonitorPage'));
const BioreactorPage = lazy(() => import('./pages/BioreactorPage'));
const NvidiaOverviewPage = lazy(() => import('./pages/NvidiaOverviewPage'));
const NvidiaMolecularViewerPage = lazy(() => import('./pages/NvidiaMolecularViewerPage'));
const NvidiaFoldingPage = lazy(() => import('./pages/NvidiaFoldingPage'));
const NvidiaDiscoveryPage = lazy(() => import('./pages/NvidiaDiscoveryPage'));
const NvidiaInferenceJobsPage = lazy(() => import('./pages/NvidiaInferenceJobsPage'));
const NvidiaSysMonPage = lazy(() => import('./pages/NvidiaSysMonPage'));
const NvidiaDevCenterPage = lazy(() => import('./pages/NvidiaDevCenterPage'));
const NvidiaModelCatalogPage = lazy(() => import('./pages/NvidiaModelCatalogPage'));
const FacialGestaltPage = lazy(() => import('./pages/FacialGestaltPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const LiteraturePage = lazy(() => import('./pages/LiteraturePage'));
const CollaborationPage = lazy(() => import('./pages/CollaborationPage'));
const PathwaySimulatorPage = lazy(() => import('./pages/PathwaySimulatorPage'));
const UncertaintyPage = lazy(() => import('./pages/UncertaintyPage'));
const ComparisonHub = lazy(() => import('./pages/ComparisonHub'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ImagingAIPage = lazy(() => import('./pages/ImagingAIPage'));
const AICopilot = lazy(() => import('./components/AICopilot'));

import PageSkeleton from './components/PageSkeleton';
import CommandCenter from './components/CommandCenter';
import MatchingScore from './components/MatchingScore';
import QuickNotes from './components/QuickNotes';
import { ClinicalProvider, useClinical } from './context/ClinicalContext';

export default function App() {
  const [activePage, setActivePage] = useState<
    'home' | 'diagnosis' | 'graph' | 'genomic' | 'pedigree' | 'entitizer' | 'pharmacogenomics' | 'omics' | 'report' | 'similarity' | 'trials' |
    'facial' | 'timeline' | 'literature' | 'collaboration' | 'pathway' | 'uncertainty' | 'comparison' | 'analytics' | 'imaging' |
    'bionemo-overview' | 'bionemo-features' | 'bionemo-monitor' | 'bionemo-bioreactor' | 'bionemo-hub' | 'bionemo-viewer' | 'bionemo-folding' | 'bionemo-discovery' | 'bionemo-jobs' | 'bionemo-sysmon' | 'bionemo-dev' | 'bionemo-catalog'
  >('home');

  return (
    <ClinicalProvider activePage={activePage} setActivePage={setActivePage}>
      <AppContent activePage={activePage} setActivePage={setActivePage} />
    </ClinicalProvider>
  );
}

function AppContent({ 
  activePage, 
  setActivePage 
}: { 
  activePage: any; 
  setActivePage: any 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const { patientName, caseId, hpoTerms, variants, mutationLoad } = useClinical();

  const handleDownloadSnapshot = () => {
    const snapshot = {
      snapshotId: `snap-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      metadata: {
        system: "RareGraphAI Neuro-Symbolic Framework",
        version: "1.0.4-LITE",
        environment: "Clinical Research Grade"
      },
      patientInfo: {
        name: patientName || "Anonymous Patient",
        caseId: caseId || "CAS-9012"
      },
      clinicalData: {
        mutationLoad,
        hpoTermsCount: hpoTerms.length,
        variantsCount: variants.length,
        hpoTerms: hpoTerms,
        variants: variants
      }
    };

    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `clinical_snapshot_${caseId || 'case'}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Snapshot Saved', {
        description: 'Clinical snapshot downloaded successfully as JSON.'
      });
    } catch (err) {
      toast.error('Failed to save snapshot');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'home' as const, label: 'Research Overview', icon: Home, category: 'Core' },
    { id: 'diagnosis' as const, label: 'Diagnostic Engine', icon: Activity, category: 'Core' },
    { id: 'entitizer' as const, label: 'Clinical Intake', icon: Sparkles, category: 'Core' },

    { id: 'facial' as const, label: 'Facial Gestalt', icon: Eye, category: 'Phenomics' },
    { id: 'imaging' as const, label: 'Imaging AI', icon: Scan, category: 'Phenomics' },
    { id: 'timeline' as const, label: 'Case Timeline', icon: Clock, category: 'Phenomics' },

    { id: 'genomic' as const, label: 'Genomic Intel', icon: Dna, category: 'Genomics' },
    { id: 'pedigree' as const, label: 'Pedigree Analysis', icon: GitBranch, category: 'Genomics' },
    { id: 'pathway' as const, label: 'Molecular Pathways', icon: Zap, category: 'Genomics' },
    { id: 'omics' as const, label: 'Multi-Omics', icon: Database, category: 'Genomics' },
    { id: 'pharmacogenomics' as const, label: 'PGx Studio', icon: Pill, category: 'Genomics' },

    { id: 'bionemo-overview' as const, label: 'NVIDIA Overview', icon: Cpu, category: 'NVIDIA' },
    { id: 'bionemo-hub' as const, label: 'BioNeMo™ Hub', icon: Dna, category: 'NVIDIA' },
    { id: 'bionemo-catalog' as const, label: 'BioNeMo™ Model Catalog', icon: BookOpen, category: 'NVIDIA' },
    { id: 'bionemo-monitor' as const, label: 'NIM™ Gateway Monitor', icon: Radio, category: 'NVIDIA' },
    { id: 'bionemo-viewer' as const, label: 'Molecular Viewer', icon: Eye, category: 'NVIDIA' },
    { id: 'bionemo-folding' as const, label: 'Protein Folding Studio', icon: FlaskConical, category: 'NVIDIA' },
    { id: 'bionemo-discovery' as const, label: 'Drug Discovery Workspace', icon: Atom, category: 'NVIDIA' },
    { id: 'bionemo-bioreactor' as const, label: 'AI Bioreactor Monitor', icon: Activity, category: 'NVIDIA' },
    { id: 'bionemo-jobs' as const, label: 'Inference Jobs', icon: ListOrdered, category: 'NVIDIA' },
    { id: 'bionemo-sysmon' as const, label: 'GPU & System Monitoring', icon: Sliders, category: 'NVIDIA' },
    { id: 'bionemo-dev' as const, label: 'Developer/API Center', icon: Settings, category: 'NVIDIA' },

    { id: 'graph' as const, label: 'Knowledge Graph', icon: Share2, category: 'Exploration' },
    { id: 'similarity' as const, label: 'Similarity Hub', icon: Users, category: 'Exploration' },
    { id: 'uncertainty' as const, label: 'Uncertainty Risk', icon: ShieldAlert, category: 'Exploration' },
    { id: 'comparison' as const, label: 'Comparison Hub', icon: History, category: 'Exploration' },
    { id: 'analytics' as const, label: 'Performance Analytics', icon: PieChart, category: 'Exploration' },

    { id: 'literature' as const, label: 'Literature Assistant', icon: BookOpen, category: 'Tools' },
    { id: 'collaboration' as const, label: 'Peer Consensus', icon: Users, category: 'Tools' },
    { id: 'trials' as const, label: 'Trial Matcher', icon: FlaskConical, category: 'Tools' },
    { id: 'report' as const, label: 'Report Gen', icon: FileText, category: 'Tools' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 grainy">
      <Toaster position="top-right" expand={false} richColors />
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center shrink-0 font-black text-white shadow-lg shadow-blue-500/20 text-sm">
              R
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-base tracking-tight text-white flex flex-col"
              >
                <div className="flex items-center">
                  RareGraphAI <span className="font-light opacity-40 text-[8px] tracking-widest uppercase ml-2">NS</span>
                </div>
                <span className="text-[6px] text-slate-500 uppercase tracking-widest mt-0.5 leading-none font-black">Neuro-Symbolic Framework</span>
              </motion.span>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-6 mt-6 overflow-y-auto custom-scrollbar">
            {['Core', 'Phenomics', 'Genomics', 'Exploration', 'NVIDIA', 'Tools'].map((cat) => (
              <div key={cat} className="space-y-1">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 px-3">{cat}</div>
                {navItems.filter(i => i.category === cat).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all group relative rounded-xl",
                      activePage === item.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", activePage === item.id ? "text-white" : "group-hover:text-blue-400")} />
                    {isSidebarOpen && <span className="whitespace-nowrap transition-opacity duration-300">{item.label}</span>}
                    {activePage === item.id && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            {isSidebarOpen && (
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Grounding Active</p>
                </div>
                <p className="text-[10px] text-slate-300 leading-snug font-medium">Multi-modal knowledge graph reasoning online.</p>
              </div>
            )}
            <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <div className="w-8 h-8 rounded-lg shrink-0 bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">
                CL
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Clinical Lab</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Status: Online</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen flex flex-col bg-slate-50",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shrink-0 active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black shrink-0">
              <span className="text-slate-400">System Path</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900">{navItems.find(i => i.id === activePage)?.label}</span>
            </div>
 
            {/* Global Search */}
            <div 
              className="relative max-w-lg w-full group ml-4 hidden sm:block cursor-pointer flex-1"
              onClick={() => setIsCommandCenterOpen(true)}
            >
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FileSearch className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-bold text-slate-400 flex items-center group-hover:border-blue-600 transition-all">
                Search variants, phenotypes, or commands...
              </div>
              <div className="absolute inset-y-0 right-4 flex items-center">
                <kbd className="text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm leading-none">⌘K</kbd>
              </div>
            </div>

            {/* Phenotype-Genotype Matching Score */}
            <MatchingScore />
          </div>
 
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Model</span>
                <span className="text-[10px] font-black text-slate-900">GEMINI-3-FLASH</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE
                </span>
              </div>
            </div>

            <button 
              onClick={handleDownloadSnapshot}
              className="flex items-center gap-2.5 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-blue-100/80 active:scale-95 cursor-pointer shadow-sm shadow-blue-500/5 select-none"
              title="Download clinical session snapshot (JSON) for debug or compliance archiving"
            >
              <Download className="w-4 h-4 text-blue-600 animate-pulse" />
              Snapshot
            </button>

            <button 
              onClick={() => toast.success('Exporting Clinical Dataset', { description: 'Synthesizing knowledge graph components...' })}
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              Export
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full relative">
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activePage === 'home' && <HomePage onStart={() => setActivePage('entitizer')} onNavigate={(page: any) => setActivePage(page)} />}
                {activePage === 'entitizer' && <EntitizerPage />}
                {activePage === 'diagnosis' && <DiagnosisPage />}
                {activePage === 'facial' && <FacialGestaltPage />}
                {activePage === 'timeline' && <TimelinePage />}
                {activePage === 'literature' && <LiteraturePage />}
                {activePage === 'collaboration' && <CollaborationPage />}
                {activePage === 'genomic' && <GenomicPage />}
                {activePage === 'pedigree' && <PedigreePage />}
                {activePage === 'pathway' && <PathwaySimulatorPage />}
                {activePage === 'omics' && <MultiOmicsPage />}
                {activePage === 'pharmacogenomics' && <PharmacogenomicsPage />}
                {activePage === 'bionemo-overview' && <NvidiaOverviewPage onNavigate={(page: any) => setActivePage(page)} />}
                {activePage === 'bionemo-features' && <BioNeMoFeaturesPage onNavigate={(page: any) => setActivePage(page)} />}
                {activePage === 'bionemo-monitor' && <NvidiaMonitorPage />}
                {activePage === 'bionemo-bioreactor' && <BioreactorPage />}
                {activePage === 'bionemo-hub' && <BioNeMoDashboardPage />}
                {activePage === 'bionemo-catalog' && <NvidiaModelCatalogPage onNavigate={(page: any) => setActivePage(page)} />}
                {activePage === 'bionemo-viewer' && <NvidiaMolecularViewerPage />}
                {activePage === 'bionemo-folding' && <NvidiaFoldingPage />}
                {activePage === 'bionemo-discovery' && <NvidiaDiscoveryPage />}
                {activePage === 'bionemo-jobs' && <NvidiaInferenceJobsPage />}
                {activePage === 'bionemo-sysmon' && <NvidiaSysMonPage />}
                {activePage === 'bionemo-dev' && <NvidiaDevCenterPage />}
                {activePage === 'graph' && <GraphExplorer />}
                {activePage === 'similarity' && <SimilarityPage />}
                {activePage === 'uncertainty' && <UncertaintyPage />}
                {activePage === 'comparison' && <ComparisonHub />}
                {activePage === 'analytics' && <AnalyticsPage />}
                {activePage === 'imaging' && <ImagingAIPage />}
                {activePage === 'trials' && <TrialMatcherPage />}
                {activePage === 'report' && <ReportGeneratorPage />}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>

        <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        
        <QuickNotes />
        
        <Suspense fallback={null}>
          <AICopilot />
        </Suspense>

        <footer className="h-10 border-t border-slate-200 bg-white px-8 flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-[0.25em]">
          <span>Research-Grade Computational Clinical Reasoning System</span>
          <div className="flex gap-8">
            <button onClick={() => toast.info('System Protocol', { description: 'Viewing current AI safety and diagnostic alignment standards.' })} className="hover:text-blue-600 transition-colors uppercase font-bold tracking-widest">Data Protocol</button>
            <button onClick={() => toast.info('Security Layer', { description: 'Verified HIPAA-compliant end-to-end data encryption.' })} className="hover:text-blue-600 transition-colors uppercase font-bold tracking-widest">Security</button>
            <span>v1.0.4-LITE</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
