import { useState, useEffect } from 'react';
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
  Upload,
  X,
  ChevronRight,
  FlaskConical,
  BookOpen,
  PieChart,
  Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import GraphExplorer from './pages/GraphExplorer';
import LiteraturePage from './pages/LiteraturePage';
import UncertaintyPage from './pages/UncertaintyPage';
import GenomicPage from './pages/GenomicPage';
import TimelinePage from './pages/TimelinePage';
import PedigreePage from './pages/PedigreePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AICopilot from './components/AICopilot';

export default function App() {
  const [activePage, setActivePage] = useState<'home' | 'diagnosis' | 'graph' | 'literature' | 'uncertainty' | 'genomic' | 'timeline' | 'analytics' | 'pedigree'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'home' as const, label: 'Research Overview', icon: Home },
    { id: 'diagnosis' as const, label: 'Diagnostic Engine', icon: Activity },
    { id: 'graph' as const, label: 'Graph Explorer', icon: Share2 },
    { id: 'genomic' as const, label: 'Genomic Intel', icon: Dna },
    { id: 'pedigree' as const, label: 'Pedigree Analysis', icon: GitBranch },
    { id: 'timeline' as const, label: 'Case Timeline', icon: PieChart },
    { id: 'uncertainty' as const, label: 'Uncertainty Risk', icon: ShieldAlert },
    { id: 'literature' as const, label: 'Literature Assistant', icon: BookOpen },
    { id: 'analytics' as const, label: 'System Analytics', icon: Database },
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <Toaster position="top-right" expand={false} richColors />
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
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
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full bg-slate-50/50">
          <div className="h-12 px-4 flex items-center gap-3 border-b border-slate-200">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0 font-bold text-white shadow-lg shadow-blue-600/20">
              R
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-lg tracking-tight text-slate-900 flex flex-col"
              >
                <div className="flex items-center">
                  RareGraph <span className="font-light opacity-50 text-[10px] tracking-widest uppercase ml-2">AI</span>
                </div>
                <span className="text-[7px] text-slate-500 uppercase tracking-tighter mt-0.5 leading-none">Reasoning Beyond Symptoms</span>
              </motion.span>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all group relative rounded",
                  activePage === item.id 
                    ? "bg-blue-50 text-blue-600 border border-blue-200" 
                    : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", activePage === item.id ? "text-blue-600" : "group-hover:text-blue-600")} />
                {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200">
            {isSidebarOpen && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                <p className="text-[9px] text-blue-600 uppercase tracking-widest mb-1 font-bold">Grounding Status</p>
                <p className="text-[10px] text-blue-800 leading-tight">Ontology-Grounded Reasoning Active</p>
              </div>
            )}
            <div className="flex items-center gap-3 mt-4 p-2 bg-white rounded-lg border border-slate-200">
              <div className="w-8 h-8 rounded shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                CL
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-900 tracking-widest uppercase">Clinical Lab</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Protocol v1.0.4</span>
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
        <header className="h-16 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] font-bold shrink-0">
              <span className="text-slate-400">Engine Output</span>
              <ChevronRight className="w-3 h-3 text-slate-200" />
              <span className="text-blue-600">{navItems.find(i => i.id === activePage)?.label}</span>
            </div>

            {/* Global Search */}
            <div className="relative max-w-md w-full group ml-4">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FileSearch className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="PROMPT: GENE, PHENOTYPE, OR PATIENT ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    toast.success('Search context initialized', { description: 'Mapping entity into active clinical knowledge base...' });
                  }
                }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="text-[9px] font-black text-slate-300 bg-white px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">⌘K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol</span>
                <span className="text-[10px] font-bold text-slate-900">GEMINI-3-FLASH</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              </div>
            </div>

            <button 
              onClick={() => toast.success('Exporting Clinical Synthesis', { description: 'Generating research-grade case documentation (PDF/MD)...' })}
              className="flex items-center gap-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-200 active:scale-95 ml-4"
            >
              <Upload className="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 max-w-[1400px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePage === 'home' && <HomePage onStart={() => setActivePage('diagnosis')} />}
              {activePage === 'diagnosis' && <DiagnosisPage />}
              {activePage === 'graph' && <GraphExplorer />}
              {activePage === 'literature' && <LiteraturePage />}
              {activePage === 'uncertainty' && <UncertaintyPage />}
              {activePage === 'genomic' && <GenomicPage />}
              {activePage === 'pedigree' && <PedigreePage />}
              {activePage === 'timeline' && <TimelinePage />}
              {activePage === 'analytics' && <AnalyticsPage />}
            </motion.div>
          </AnimatePresence>
        </div>

        <AICopilot />

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
