export interface HPOTerm {
  id: string; // e.g., HP:0003323
  name: string;
  category: string;
}

export interface Disease {
  id: string;
  name: string;
  confidence: number; // 0 to 1
  reasoning: string;
  genes?: string[];
  omim?: string;
}

export interface DiagnosisResult {
  hpo_terms: HPOTerm[];
  diseases: Disease[];
  reasoning_chain: string;
  missing_evidence: string[];
  recommended_tests: string[];
}

export interface PatientData {
  symptoms: string;
  history: string;
  genetics: string;
  files: Array<{ name: string; type: string; data: string }>; // base64
}

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'symptom' | 'gene' | 'disease' | 'patient';
  name: string;
  definition?: string;
  associatedDiseases?: string[];
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export interface PGxResult {
  variants: Array<{
    gene: string;
    variant: string;
    phenotype: string;
    impact: 'Increased' | 'Decreased' | 'Normal' | 'Unknown';
    drugs: Array<{
      name: string;
      recommendation: string;
      level: 'Strong' | 'Moderate' | 'Weak';
    }>;
  }>;
  contraindications: Array<{
    drug: string;
    reason: string;
    severity: 'High' | 'Moderate';
  }>;
}

export interface SharedCase {
  id: string;
  patientAlias: string;
  topPhenotypes: string[];
  lastUpdate: string;
  reviewCount: number;
  urgency: 'Routine' | 'Emergent' | 'Critical';
  anonymizationScore: number;
}

export interface Collaborator {
  id: string;
  name: string;
  institution: string;
  specialty: string;
}
