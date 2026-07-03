import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { HPOTerm, Variant } from '../types';
import { toast } from 'sonner';

interface CaseSnapshot {
  id: string;
  patientName: string;
  hpoTerms: HPOTerm[];
  variants: Variant[];
  timestamp: string;
}

interface ClinicalState {
  hpoTerms: HPOTerm[];
  variants: Variant[];
  patientName: string;
  caseId: string;
  activePage: string;
  mutationLoad: number;
  savedCases: CaseSnapshot[];
  saveCurrentCase: () => void;
  loadCase: (id: string) => void;
  deleteCase: (id: string) => void;
  setActivePage: (page: any) => void;
  addHPOTerm: (term: HPOTerm) => void;
  removeHPOTerm: (id: string) => void;
  addVariant: (variant: Variant) => void;
  removeVariant: (id: string) => void;
  setPatientInfo: (name: string, id: string) => void;
  setMutationLoad: (val: number) => void;
}

const ClinicalContext = createContext<ClinicalState | undefined>(undefined);

export function ClinicalProvider({ 
  children, 
  activePage, 
  setActivePage 
}: { 
  children: ReactNode;
  activePage: string;
  setActivePage: (page: any) => void;
}) {
  const [hpoTerms, setHpoTerms] = useState<HPOTerm[]>(() => {
    const saved = localStorage.getItem('rareGraph_hpo');
    return saved ? JSON.parse(saved) : [];
  });
  const [variants, setVariants] = useState<Variant[]>(() => {
    const saved = localStorage.getItem('rareGraph_variants');
    return saved ? JSON.parse(saved) : [];
  });
  const [patientName, setPatientName] = useState(() => localStorage.getItem('rareGraph_patient') || 'UNIDENTIFIED PATIENT');
  const [caseId, setCaseId] = useState(() => localStorage.getItem('rareGraph_caseId') || 'CAS-992-ARC');
  const [mutationLoad, setMutationLoad] = useState(75);
  const [savedCases, setSavedCases] = useState<CaseSnapshot[]>(() => {
    const saved = localStorage.getItem('rareGraph_saved_cases');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence effects
  useEffect(() => localStorage.setItem('rareGraph_hpo', JSON.stringify(hpoTerms)), [hpoTerms]);
  useEffect(() => localStorage.setItem('rareGraph_variants', JSON.stringify(variants)), [variants]);
  useEffect(() => localStorage.setItem('rareGraph_patient', patientName), [patientName]);
  useEffect(() => localStorage.setItem('rareGraph_caseId', caseId), [caseId]);
  useEffect(() => localStorage.setItem('rareGraph_saved_cases', JSON.stringify(savedCases)), [savedCases]);

  const saveCurrentCase = useCallback(() => {
    const snapshot: CaseSnapshot = {
      id: caseId,
      patientName,
      hpoTerms: [...hpoTerms],
      variants: [...variants],
      timestamp: new Date().toISOString()
    };

    setSavedCases(prev => {
      const filtered = prev.filter(c => c.id !== caseId);
      return [snapshot, ...filtered];
    });
    toast.success('Case Snapshot Saved', { description: `${patientName} (${caseId}) archived to local hub.` });
  }, [caseId, patientName, hpoTerms, variants]);

  const loadCase = useCallback((id: string) => {
    const c = savedCases.find(cs => cs.id === id);
    if (c) {
      setPatientName(c.patientName);
      setCaseId(c.id);
      setHpoTerms(c.hpoTerms);
      setVariants(c.variants);
      toast.success('Case Restored', { description: `Switched to ${c.patientName} (${c.id}).` });
    }
  }, [savedCases]);

  const deleteCase = useCallback((id: string) => {
    setSavedCases(prev => prev.filter(c => c.id !== id));
    toast.info('Case Snapshot Removed');
  }, []);

  const addHPOTerm = useCallback((term: HPOTerm) => {
    setHpoTerms(prev => {
      if (prev.some(t => t.id === term.id)) return prev;
      return [...prev, term];
    });
  }, []);

  const removeHPOTerm = useCallback((id: string) => {
    setHpoTerms(prev => prev.filter(t => t.id !== id));
  }, []);

  const addVariant = useCallback((variant: Variant) => {
    setVariants(prev => {
      if (prev.some(v => v.id === variant.id)) return prev;
      return [...prev, variant];
    });
  }, []);

  const removeVariant = useCallback((id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  }, []);

  const setPatientInfo = useCallback((name: string, id: string) => {
    setPatientName(name);
    setCaseId(id);
  }, []);

  const value = useMemo(() => ({ 
    hpoTerms, 
    variants, 
    patientName, 
    caseId, 
    activePage,
    savedCases,
    saveCurrentCase,
    loadCase,
    deleteCase,
    setActivePage,
    addHPOTerm, 
    removeHPOTerm, 
    addVariant, 
    removeVariant,
    setPatientInfo,
    mutationLoad,
    setMutationLoad
  }), [hpoTerms, variants, patientName, caseId, activePage, savedCases, mutationLoad, saveCurrentCase, loadCase, deleteCase, setActivePage, addHPOTerm, removeHPOTerm, addVariant, removeVariant, setPatientInfo]);

  return (
    <ClinicalContext.Provider value={value}>
      {children}
    </ClinicalContext.Provider>
  );
}

export function useClinical() {
  const context = useContext(ClinicalContext);
  if (context === undefined) {
    throw new Error('useClinical must be used within a ClinicalProvider');
  }
  return context;
}
