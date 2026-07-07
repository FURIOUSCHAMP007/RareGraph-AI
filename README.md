# Agentic RareGraphAI: Multi-Agent Orchestration for Predictive Path Analysis and Clinical Consensus over Multi-Omic Graphs

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Framework: React 18](https://img.shields.io/badge/Framework-React%2018-blueviolet.svg)](https://react.dev/)
[![Build: Vite](https://img.shields.io/badge/Build-Vite-646CFF.svg)](https://vitejs.dev/)
[![Engine: Gemini Pro](https://img.shields.io/badge/Engine-Gemini%20Pro-06B6D4.svg)](https://deepmind.google/technologies/gemini/)

**Agentic RareGraphAI** is an advanced, professional-grade clinical decision support platform (CDSS) and multi-agent orchestrating reasoning framework designed for clinical geneticists, dysmorphologists, and medical researchers investigating ultra-rare, complex, and undiagnosed diseases.

By unifying unstructured clinical narratives, structured Human Phenotype Ontology (HPO) lineages, multi-generational pedigrees, multi-omic expression profiles, and genomic variant annotations, the system charts and interrogates complex biological logic pathways. Through its state-of-the-art **Predictive Path Analysis (PPA)** engine and multi-agent consensus protocols, the framework collapses the rare disease diagnostic odyssey from years to minutes via transparent, trace-backed clinical inference.

---

## 🔬 System Architecture & Design Philosophy

Agentic RareGraphAI operates at the intersection of **Symbolic AI** (relying on structured, deterministic biomedical knowledge graphs, clinical ontologies, and logical inference rules) and **Connectionist AI** (leveraging modern deep representation learning, computer vision models, and large language models).

```
                            ┌────────────────────────────────────────┐
                            │      Unstructured Clinical Inputs      │
                            │   (Narratives, Photo Gestalts, Labs)   │
                            └───────────────────┬────────────────────┘
                                                │
                                                ▼ [Agentic Parse]
                            ┌────────────────────────────────────────┐
                            │      Multi-Agent Diagnostic Shell      │
                            │  (Clinical Entitizer, Variant Parser)  │
                            └───────────────────┬────────────────────┘
                                                │
                                                ▼ [Joint Synthesis]
                            ┌────────────────────────────────────────┐
                            │    Multi-Omic Neuro-Symbolic Graph     │
                            │    (Nodes: Patients, HPOs, Variants)   │
                            └─────────┬────────────────────┬─────────┘
                                      │                    │
          [Predictive Path Analysis] │                    │ [Consensus Resolving]
                                      ▼                    ▼
          ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
          │     Predictive Path Engine (PPA)     │  │      Consensus Agreement Hub        │
          │  - Dynamic Path Match Projections    │  │  - Cross-Agent Weight Resolution     │
          │  - Real-Time Simulation Latency      │  │  - Entropy Information Gain Tracking  │
          │  - Trace-Backed Evidence Generation  │  │  - Multi-Dimensional Alignment Gauge │
          └──────────────────────────────────────┘  └──────────────────────────────────────┘
```

### Advanced System Capabilities:
1. **Multi-Agent Orchestration**: Specialised, autonomous clinical agents coordinate asynchronously to parse patient data, compute ACMG variant pathogenicity, infer pedigree-based Mendelian risks, and integrate multi-omic expressions into a single, cohesive clinical network.
2. **Predictive Path Analysis (PPA) Engine**: An interactive, dynamic modeling pipeline that uses deep diagnostic models to project probable clinical paths. Clinicians can toggle PPA, view model match probabilities, execute simulations with real-time latency, and unlock trace-backed dynamic evidence tabs.
3. **Desktop-First Visual Precision**: Optimized for high-density clinical dashboard layouts with balanced negative space, strict slate-colored visual hierarchy, interactive SVG topology workspaces, and highly readable, professional typesetting.
4. **No-Mock Data Integrity**: Direct integration with standard biomedical schemas, true ACMG criteria rationale, authentic ClinVar/OMIM correlations, and standard HPO classification pipelines.

---

## 📂 Project Directory Structure

```
├── .env.example              # Template for server-side & client-side secrets
├── .gitignore                # Production ignored files and local node_modules
├── README.md                 # System master documentation (this file)
├── DEVELOPMENT.md            # Local developer onboarding instructions
├── metadata.json             # AI Studio applet permissions and metadata configuration
├── package.json              # NPM scripts, dependencies, and build configuration
├── vite.config.ts            # Vite asset pipeline configuration
├── tsconfig.json             # TypeScript compiler settings
├── src/
│   ├── main.tsx              # React application mounting entry point
│   ├── App.tsx               # Primary layout router, sidebar navigation, and shell
│   ├── index.css             # Tailwind CSS & custom typography imports (Inter, JetBrains Mono)
│   ├── components/           # Extracted modular visualization components
│   │   ├── MatchingScore.tsx # Clinical confidence/matching gauges
│   │   ├── RiskRadar.tsx     # Recharts-based multi-dimensional risk radar
│   │   └── ExportHub.tsx     # Standard and advanced MD-ready PDF generation
│   ├── services/             # API clients & external SDK integration layers
│   │   └── geminiService.ts  # Node-proxied @google/genai orchestration SDK
│   └── pages/                # High-fidelity workflow workspaces
│       ├── HomePage.tsx      # Landing platform & Research-Grade Clinical protocol
│       ├── AgenticOrchestratorPage.tsx # PRIMARY WORKSPACE: Multi-Agent Interactive Workspace & PPA Engine
│       ├── DiagnosisPage.tsx # Core Symbolic Inference Engine & Decision Chain Trace
│       ├── GraphExplorer.tsx # Interactive D3.js Neuro-Symbolic Knowledge Network
│       ├── EntitizerPage.tsx # Clinical NLP Narrative Parser & HPO Mapping Hub
│       ├── FacialGestaltPage.tsx # Computer Vision Dysmorphology Suite
│       ├── GenomicPage.tsx   # Genomic Variant Prioritizer & ACMG Classifier
│       ├── MultiOmicsPage.tsx # Expression Profiler & Cross-Layer Signal Integrator
│       ├── PedigreePage.tsx  # Dynamic Genogram Builder & Mendelian Inheritance Evaluator
│       ├── PathwaySimulatorPage.tsx # Mitochondrial Biochemical Flux Simulator
│       ├── PharmacogenomicsPage.tsx # PGx Drug-Response Profile & Safety Alerts
│       ├── TimelinePage.tsx  # Patient Longitudinal Trajectory & Progression Analyzer
│       ├── SimilarityPage.tsx # Multi-Dimensional Cohort Similarity Matcher
│       ├── TrialMatcherPage.tsx # Clinical Trial Eligibility Audit Hub
│       ├── ReportGeneratorPage.tsx # Export-Ready MD Synthesis & Patient Summary Panel
│       ├── UncertaintyPage.tsx # Bayesian Confidence Curves & Entropy Analysis
│       ├── LiteraturePage.tsx # PubMed & ClinVar Semantic Synthesis Assistant
│       ├── ComparisonHub.tsx # Case-to-Case Side-by-Side Diagnostic Profiler
│       ├── CollaborationPage.tsx # Peer Consensus Feed & Federated Sharing Console
│       └── AnalyticsPage.tsx # Computational System Performance & Trace Logs
```

---

## 🛠 Detailed Workflow Modules & Core Features

### 1. Primary Workspace: Agentic Orchestrator (`AgenticOrchestratorPage.tsx`)
* **Interactive SVG Stage**: Visualizes the live convergence of multi-agent nodes (Clinical Entitizer, Variant Classifier, Pedigree Analyzer, Multi-Omic Integrator) linking directly into the central **Consensus Hub**.
* **Predictive Path Analysis (PPA)**: Toggleable overlay highlighting predictive diagnostic pathways based on patient clinical context. 
  * Displays match probabilities (e.g., *MELAS Heteroplasmy*, *Splicing Defect Analysis*, *Biochemical Assembly*) alongside estimated computational latencies.
  * Allows interactive execution of predictive runs with simulated asynchronous latency, updating the real-time **Latency Monitor Dashboard**.
  * Unlocks trace-backed diagnostic evidence reports written in beautiful, clinical-grade markdown.
* **Consensus Properties Panel**: Provides clear, real-time metrics on match probability, objective rationale, and predicted parameters for selected graph nodes.

### 2. Diagnosis Page (`DiagnosisPage.tsx`)
* **Expert Reasoning Chains**: Outputs sequential diagnostic trace lines describing the logical bridges between patient symptoms, mutated genes, biochemical pathways, and OMIM diseases.
* **Clinical Protocol Recommender**: Recommends personalized action items and flags "clinical information gaps" based on active patient state.
* **Synchronized Gauges**: Embeds high-contrast radar charts (`RiskRadar.tsx`) and matching scores (`MatchingScore.tsx`) to evaluate diagnostic strength.

### 3. Neuro-Symbolic Graph Explorer (`GraphExplorer.tsx`)
* **Topological Force Simulation**: Employs a custom D3 force-directed layout to render connections between Patient Cases, HPO Terms, Genomic Variants, and Candidate Syndromes.
* **Interactive Filter Modes**: Toggles between **Filtering On** (collapsing non-matching nodes to view clean subnetworks) and **Filtering Off** (showing the whole network with glowing, pulsing halo rings around matching elements).
* **Shortest Path Solver**: Solves and tracks causal chains (e.g., $\text{Patient} \rightarrow \text{HPO} \rightarrow \text{Gene} \rightarrow \text{Disease}$) to pinpoint exact diagnostic linkage.

### 4. Note Entitizer (`EntitizerPage.tsx`)
* **Phenotypic NLP Parser**: Analyzes complex clinical dictations and discharge summaries to extract standardized HPO codes (e.g., *HP:0001324* for acroparaesthesia).
* **Direct Clinical Synchronization**: Supports staging and persisting recognized terms directly into the patient's active symptom registry.

### 5. Facial Gestalt Intelligence (`FacialGestaltPage.tsx`)
* **Dysmorphology Computer Vision**: Identifies structural patterns in patient clinical photography.
* **Quantified Landmark Ratios**: Generates standardized phenotypic annotations (e.g., epicanthal folds, low-set ears, synophrys) with clear visual confidence values.

### 6. Genomic Intel Hub (`GenomicPage.tsx`)
* **Variant Prioritization Engine**: Sifts through high-throughput sequencing files (VCFs) to surface variants of unknown significance (VUS) or pathogenic classifications.
* **ACMG Rule Automation**: Annotates variants against official ACMG/AMP rules (e.g., PVS1, PM2, PP3) with clear rationale.

### 7. Multi-Omics Integrator (`MultiOmicsPage.tsx`)
* **Cross-Layer Biological Analysis**: Synthesizes and plots genomics, transcriptomics, proteomics, and metabolomics data layers.
* **Signal Correlation Mapping**: Flags points of convergence where a nucleotide variant correlates directly with aberrant transcript levels or protein expression profiles.

### 8. Interactive Pedigree Analyzer (`PedigreePage.tsx`)
* **Mendelian Solver**: Uses a dynamic, interactive genogram builder to model familial pedigree structures.
* **Inheritance Inference**: Evaluates pedigree structure to calculate mathematically consistent likelihoods for Autosomal Dominant, Autosomal Recessive, X-Linked, and Mitochondrial inheritance.

### 9. Biochemical Pathway Simulator (`PathwaySimulatorPage.tsx`)
* **Flux Disruption Modeling**: Visualizes biochemical pathway flux (e.g., Mitochondrial Citric Acid/OXPHOS chains).
* **Therapeutic Rescue Simulation**: Lets clinicians model the downstream rescue effects of enzyme cofactors or targeted gene therapies.

### 10. PGx Hub (`PharmacogenomicsPage.tsx`)
* **Pharmacogenomic Screeners**: Profiles patient genotypes against CYP-450 enzyme guidelines (CPIC).
* **Automated Contraindication Alerts**: Triggers real-time safety warnings for cardiotoxic, neurotoxic, or compromised metabolizer pathways.

### 11. Patient Case Timeline (`TimelinePage.tsx`)
* **Longitudinal Development Mapping**: Tracks disease milestones and clinical onset patterns relative to average patient populations.
* **Diagnostic Velocity Analysis**: Visualizes timelines from initial clinical presentation to variant discovery and phenotypic staging.

### 12. Phenotypic Similarity Matcher (`SimilarityPage.tsx`)
* **Semantic Cohort Matching**: Computes multi-dimensional clinical similarity matrices (e.g., Jaccard, Resnik semantic similarity) to match cases against a global clinical repository.

### 13. Clinical Trial Matcher (`TrialMatcherPage.tsx`)
* **Automated Registry Auditing**: Harvests international databases (e.g., ClinicalTrials.gov) to map active, recruiting trials.
* **Mutation-Specific Inclusion Profiling**: Audits precise genetic variant matches and age thresholds against eligibility parameters.

### 14. Clinical Report Generator (`ReportGeneratorPage.tsx`)
* **MD-Ready Summary PDF**: Compiles full diagnostic profiles into structured, clean, download-ready summaries.
* **Visual Scope Controls**: Toggles sections (e.g., raw omics vs. curated clinical reasoning traces) depending on the target audience (patient vs. insurance vs. research board).

### 15. Uncertainty & Bayesian Risk Analysis (`UncertaintyPage.tsx`)
* **Bayesian Probability Updates**: Models diagnostics as dynamic probability waves that update in real time as new symptoms or tests are introduced.
* **Entropy Optimization**: Quantifies "highest information gain" test recommenders to direct clinicians toward testing that yields the highest entropy reduction.

### 16. Literature Assistant (`LiteraturePage.tsx`)
* **PubMed & ClinVar Synthesis**: Synthesizes unstructured research articles, PubMed abstracts, and ClinVar expert curations.
* **High-Impact Visual Profile**: Built with a dedicated, expert-curated sub-workflow for the pathogenic *MT-TL1 m.3243A>G* mutation, organizing complex ClinGen evidence codes into digestible clinical reference sections.

### 17. Peer Collaboration Portal (`CollaborationPage.tsx`)
* **Federated Case Exchange**: Enables secure, de-identified sharing of clinical diagnostic metrics with international advisory boards.

### 18. Computational Analytics (`AnalyticsPage.tsx`)
* **Trace-Level Logs**: Monitors processing times, D3 simulation heat, and token consumption parameters to ensure framework performance.

---

## 🛠 Local Setup & Development Onboarding

Agentic RareGraphAI runs on a modern React 18+ framework built on Vite.

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### 1. Installation
Clone the repository and install the dependencies from the project root:
```bash
npm install
```

### 2. Environment Variables Configuration
To use the fully active multi-agent reasoning functions (powered by Gemini), create a `.env` file at the root of your workspace using `.env.example` as a template:
```env
# .env
GEMINI_API_KEY=your_secure_server_side_gemini_api_key
```
*Note: Do not commit actual secrets or keys to version control.*

### 3. Running the Development Server
Launch the development server on port `3000`:
```bash
npm run dev
```

### 4. Running Verification Checks
To validate syntax, type definitions, and code formatting rules:
```bash
# Run ESLint and TypeScript checks
npm run lint

# Compile and build production-ready assets
npm run build
```

---

## 🔒 Security, Compliance, and Privacy Best Practices
1. **De-Identified Architecture**: Patient cases use synthetic identifiers (e.g., `Patient Case RC-785360`) to enforce HIPAA and GDPR principles by default in client-side state.
2. **Server-Side API Boundaries**: All API calls, including the Gemini LLM orchestration, are routed through server-side endpoints to safeguard API keys from exposure in the client browser console.
3. **Audit Trails**: All changes to symptom logs and inheritance assignments create verifiable history blocks within the local telemetry traces.
