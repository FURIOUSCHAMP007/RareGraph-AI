# RareGraph AI: Technical & Product Documentation

## 1. Executive Summary
**RareGraph AI** is a multi-modal clinical decision support system (CDSS) specifically engineered for the rare disease diagnostic odyssey. It transforms unstructured clinical narratives into structured knowledge graph nodes, enabling high-fidelity Bayesian inference for rare syndromes.

---

## 2. Platform Architecture

### 2.1 Technical Stack
- **Core Framework**: React 18 (Vite-based)
- **Programming Language**: TypeScript (with strict typing)
- **Styling Strategy**: Tailwind CSS using the "Executive/Clinical" aesthetic (Dark mode sidebars, high-contrast typography, 8px grid system).
- **Animation Engine**: Framer Motion (used for contextual transitions and state-based layout shifts).
- **Data Visualization**: Recharts (for probabilistic analysis) & D3.js (for topological mapping).

### 2.2 Intelligence Layer (The Reasoning Engine)
The platform utilizes a **Neuro-Symbolic** approach:
1.  **Linguistic Layer**: Uses LLMs (`gemini-2.0-flash`) to parse clinical notes and map them to the **Human Phenotype Ontology (HPO)**.
2.  **Symbolic Layer**: Uses the extracted HPO terms as seeds to query structured medical knowledge bases (OMIM, Orphanet, ClinVar).
3.  **Inference Layer**: Synthesizes a differential diagnosis by calculating the overlap between the patient’s phenotypic vector and known disease vectors.

---

## 3. Product Modules

### 📋 Note Entitizer
- **Function**: Natural Language Processing of clinical SOAP notes.
- **Output**: A list of verified HPO terms with semantic categorization (e.g., Neuromuscular, Metabolic).
- **Business Logic**: Reduces "paper-to-digital" friction for clinical geneticists.

### 🧠 Diagnostic Engine
- **Function**: The primary inference dashboard.
- **Features**: 
    - Clinical Intake (Symptoms, History, Genetics).
    - Multi-modal evidence upload (Imaging, Lab reports).
    - Confidence-weighted Differential (e.g., 94% Match for Leigh Syndrome).

### 🧬 PGx Hub (Pharmacogenomics)
- **Function**: Predicts drug response based on the patient's genetic profile.
- **Safety Features**: High-visibility contraindication flags to prevent life-threatening drug-gene interactions (e.g., DPYD and Fluorouracil).

### 🛡 Uncertainty Risk
- **Function**: Quantifies what the system *doesn't* know.
- **Invariants**: 
    - Visualizes the "Bayesian Prior" vs. the "Adjusted Posterior" after genomic evidence is introduced.
    - Identifies "Entropy Sources"—areas of the clinical profile that are too vague to support a diagnosis.

### 👥 Collaboration Portal
- **Function**: A "Shared Intelligence" network for de-identified cases.
- **Standards**: Uses a multi-tiered anonymization protocol to ensure patient privacy while enabling global expert peer review.

---

## 4. UI/UX Principles (Standard Operating Procedure)

### 🎨 Visual Language
- **Accent Color**: `#2563eb` (Royal Blue) for primary actions; `#e11d48` (Rose) for critical warnings.
- **Typography**: 
    - Headings: `font-black text-slate-900 uppercase tracking-tighter`.
    - Labels: `font-black text-slate-400 uppercase tracking-[0.2em]`.
    - Data: `font-mono`.
- **Radius Strategy**: 
    - Primary Containers: `rounded-[32px]` or `rounded-[40px]`.
    - Interactive Elements: `rounded-xl` or `rounded-2xl`.

### ⚡ Interaction Patterns
- **States**: All buttons must have an `active:scale-95` or `group-hover` state for tactile feedback.
- **Transitions**: Route changes and data loads use staggered `motion` entrances to avoid cognitive jar.

---

## 5. Security & Compliance (CDSS Guidelines)
- **De-identification**: Clinical notes are stripped of PII (Names, DOIs) before being passed to the AI inference layer.
- **Grounding**: Every AI response must be grounded in the provided HPO/Genomic identifiers to prevent "Hallucinations."
- **Transparency**: The system provides a "Reasoning Chain" for every diagnosis, allowing clinicians to verify the logic.

---

## 6. Future Roadmap
- **Real-time Literature Synthesis**: Direct semantic retrieval of PubMed papers related to unconfirmed VUS (Variants of Uncertain Significance).
- **Dynamic Pedigree Generator**: Automatically drawing 3-generation pedigrees from extracted family history text.
- **Heteroplasmy Tracking**: Specialized dashboard for mitochondrial inheritance patterns.

---

*Last Updated: May 2026*
*RareGraph AI Technical Division*
