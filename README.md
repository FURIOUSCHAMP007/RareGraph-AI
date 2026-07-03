# RareGraph AI: Precision Rare Disease Inference Matrix

**RareGraph AI** is a professional-grade clinical decision support platform designed for specialists in rare and undiagnosed diseases. It leverages neuro-symbolic AI to bridge the gap between messy clinical observations and actionable genomic insights.

## 🧬 Intelligence Hub Features

The platform is structured into a logical clinical workflow, allowing specialists to move from initial intake to final reporting within a single unified environment.

### 1. Research Overview
- **Executive Dashboard**: A unified command center providing a high-level view of diagnostic progress, active cases, and recent genomic alerts.
- **Protocol Management**: Rapid access to clinical workflows, standardized intake forms, and system-wide state summaries.
- **Quick Navigation**: Instant indexing into specific functional hubs for targeted analysis.

### 2. Note Entitizer (Clinical NLP)
- **Natural Language Extraction**: High-fidelity transformation of unstructured clinical notes into structured, HPO-mapped phenotype vectors using advanced LLM reasoning.
- **Semantic Mapping**: Automatic categorization of extracted terms (Neurological, Ocular, Renal, etc.) for intuitive clinical review.
- **Data Syncing**: One-click synchronization of extracted phenotypes to the global clinical profile for use in downstream diagnostic modules.

### 3. Facial Gestalt Intelligence (Vision AI)
- **Multimodal Dysmorphology**: Analyzes clinical photographs using Gemini Vision AI to identify subtle dysmorphic features often missed in standard exams.
- **HPO Vectorization**: Automatically suggests standardized HPO terms (e.g., hypertelorism, epicanthal folds) with evidence-backed rationale.
- **Visual Evidence**: Direct mapping of observed physical phenotypes to the patient's differential diagnosis roadmap.

### 4. Case Timeline
- **Temporal Progression**: Visual mapping of clinical milestones, phenotypic onset, and intervention outcomes.
- **Longitudinal Tracking**: Analysis of disease evolution over time to identify progressive syndrome patterns and degenerative trajectories.
- **Event Interpolation**: AI-driven gap identification where clinical data might be missing in the patient's history.

### 5. Pedigree Analysis
- **Dynamic Genograms**: AI-assisted construction of multi-generation pedigrees from clinical narrative or structured family history.
- **Inheritance Pattern Detection**: Statistical identification of Autosomal Dominant, Recessive, X-linked, or Mitochondrial modes based on familial manifestation.
- **Risk Assessment**: Probabilistic calculation of recurrence risk for siblings and future offspring.

### 6. Diagnostic Engine
- **Neuro-Symbolic Reasoning**: Maps phenotypic manifestations to standardized HPO terms and rare disease databases (OMIM, ORPHANET) using deep inference.
- **Multimodal Intake**: Processes clinical history, genetic variant reports, and patient scans simultaneously to converge on a unified diagnosis.
- **Expert Reasoning Chain**: Transparent, step-by-step logic trace that explains *why* the AI is prioritizing specific candidate diseases.

### 7. Graph Explorer
- **Topological Mapping**: Visualizes the multi-dimensional relationships between phenotypic nodes, candidate genes, and established syndromes.
- **Knowledge Graph Interrogation**: Interactive exploration of clinical associations, allowing doctors to "look over the horizon" at secondary symptoms.
- **Sub-network Analysis**: Identification of molecular clusters that explain complex, multi-system rare disease presentations.

### 8. Genomic Intel
- **Variant Prioritization**: Automated ranking of genomic variants (VUS, Pathogenic) based on their specific phenotypic relevance to the current patient.
- **ACMG Annotation**: Real-time annotation of variants against ClinVar, gnomAD, and custom internal variant databases.
- **Secondary Findings**: Intelligent screening for incidental findings according to the latest ACMG clinical guidelines.

### 9. Multi-Omics Integrator
- **Cross-Layer Analysis**: Simultaneous visualization of Transcriptomic (RNA-seq), Proteomic, and Metabolomic data alongside Genomic findings.
- **Signal Correlation**: Identification of functional impacts where DNA variants drive measurable changes in mRNA levels or protein expression.
- **Holistic Profiling**: Moves beyond simple "variant counting" to a functional understanding of cellular dysregulation.

### 10. Pathway Simulator
- **Molecular Dynamics**: Real-time simulation of biological pathways (e.g., Mitochondrial Respiratory Chain) to visualize the impact of specific mutations.
- **Flux Analysis**: Computational modeling of metabolic flux and signaling disruptions caused by identified pathogenic variants.
- **Rescue Simulation**: Virtual testing of "rescue" therapies to predict drug efficacy at the molecular level before clinical trial.

### 11. PGx Hub (Pharmacogenomics)
- **Drug-Response Mapping**: Analyzes patient-specific variants across critical drug-response genes (CYP2C19, CYP2D6, DPYD, etc.).
- **Interactive Panel Selection**: specialized screening for Oncology, Cardiology, Psychiatry, and Pain Management drug sensitivities.
- **Safety Guardrails**: Immediate alerts for medications that are contraindicated based on the patient's genetic metabolizer status.

### 12. Similarity Matcher
- **Cohort Comparison**: Matches the current patient's unique phenotypic and genomic profile against global anonymized rare disease cohorts.
- **Similarity Indexing**: Calculates a high-precision similarity score to identify "patients like mine" for diagnostic confirmation.
- **Rare Disease Networking**: Connects specialists to established phenotypic clusters for collaborative validation of novel syndrome presentations.

### 13. Clinical Trial Matcher
- **Precision Matching**: Scans international clinical trial registries for studies specifically targeting the patient's identified gene or pathway.
- **Eligibility Screening**: Automatically evaluates the patient against complex inclusion/exclusion criteria including age, location, and specific variants.
- **Direct Referral**: Streamlines the path from rare disease diagnosis to potentially life-saving experimental therapies.

### 14. Report Generator (MD-Ready)
- **Professional PDF Synthesis**: Compiles all clinical evidence—including pedigrees, genomic findings, and AI reasoning—into a formal clinical report.
- **Customizable Modules**: Doctors can select specific diagnostic components to include for different audiences (e.g., Insurance, Patient, Research Peer).
- **Audit-Ready Documentation**: Ensures every diagnostic claim is backed by a visible chain of evidence and source citations.

### 15. Uncertainty Risk Analysis
- **Bayesian Posterior Distribution**: Visualizes diagnostic confidence shifts as new evidence (e.g., a new lab result) is introduced.
- **Entropy Source Analysis**: Identifies exactly which clinical areas are contributing most to diagnostic uncertainty, guiding the doctor on where to test next.
- **Conflict Detection**: Flags contradictory evidence within a case (e.g., a phenotype that strongly excludes the primary candidate disease).

### 16. Literature Assistant
- **Real-time Semantic Retrieval**: Direct linking of clinical findings to the latest rare disease publications, pre-prints, and curated case reports.
- **LLM Synthesis**: Dynamic summarization of multi-paper findings regarding rare variants, saving hours of manual research.
- **Evidence Benchmarking**: Ranks medical literature based on clinical relevance and impact factor.

### 17. Collaboration Portal
- **Case Federations**: Anonymized case-sharing protocol for global specialist collaboration on "cold cases."
- **Expert Review Feed**: A secure stream of de-identified cases requiring sub-specialty confirmation (e.g., Pediatric Nephrology).
- **Peer Knowledge Sync**: Allows specialists to contribute local findings back to the global RareGraph knowledge graph.

### 18. System Analytics
- **Intelligence Dashboard**: Real-time performance analytics for the AI inference models and diagnostic velocity metrics.
- **Federated Knowledge Sync**: Monitoring of global data synchronization across research nodes.
- **Molecular Metrics**: High-level statistical views of molecular flux, gene-phenotype proximity, and diagnostic domain overlap.

## 🛠 Tech Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Executive Aesthetic)
- **Animations**: Framer Motion
- **Intelligence**: Gemini Pro & Flash via `@google/genai`
- **Visualization**: D3.js & Recharts
- **Icons**: Lucide React

## 🚀 Vision
To reduce the "Diagnostic Odyssey" for rare disease patients from years to days by providing specialists with an integrated, high-fidelity reasoning environment.
