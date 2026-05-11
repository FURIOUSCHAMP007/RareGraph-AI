# RareGraph AI: Reasoning Beyond Symptoms

**RareGraph AI** is a research-grade computational clinical reasoning system designed to help clinicians and researchers navigate the complexity of rare and undiagnosed diseases. By integrating genomic intelligence, phenotypic knowledge graphs, and multi-generational pedigree mapping, the platform synthesizes disparate data points into a unified diagnostic narrative.

## 🧬 Diagnostic Architecture

RareGraph operates on a multi-modal inference engine that cross-references several high-dimensional clinical domains:

### 1. Genomic Intelligence Module
*   **ACMG Scoring Engine:** Automated variant classification following ACMG/AMP clinical guidelines.
*   **GO Enrichment Analysis:** Statistical mapping of gene sets to Biological Processes and Molecular Functions.
*   **Hierarchical Visualization:** Interactive D3-powered tree structures to explore gene-pathway associations.

### 2. Knowledge Graph Interaction Network
*   **Topological Mapping:** Visualizes relationships between Patients, Symptoms (HPO), Genes, and Diseases.
*   **Predictive Neighborhood Expansion:** Uses AI to infer latent biological proximity between distant entities in the clinical knowledge base.

### 3. Bayesian Uncertainty & Risk
*   **Entropy Analysis:** Quantifies the "reasoning gap" in a case, identifying exactly which missing data (e.g., restricted genomics or low-res imaging) is preventing a definitive diagnosis.
*   **Alternative Hypothesis Pathing:** Generates weighted clinical differentials (Leigh Syndrome, MERRF, etc.) with real-time posterior probability adjustments.

### 4. Longitudinal Case Timeline
*   **Temporal Progression:** Maps clinical milestones over a 48-month span.
*   **Raw Data Inspector:** Secure access to underlying FASTQ/VCF genomic data and DICOM imaging files directly from timeline events.

### 5. Pedigree & Inheritance Mapping
*   **Multigenerational Pedigree:** Interactive inheritance charts designed for mitochondrial and complex mendelian patterns.
*   **Maternal Lineage Detection:** Specialized tracking for heteroplasmy and maternal inheritance clusters.

### 6. Literature Synthesis (AI Assistant)
*   **LLM-Powered Summaries:** Real-time synthesis of medical literature using Gemini 2.0 Flash.
*   **Ontology Native:** Directly accepts and interprets HPO (HP:XXXXXXX) and OMIM (#XXXXXX) identifiers for precision retrieval.

## 🛠 Technical Stack

*   **Frontend:** React 18 + TypeScript + Vite
*   **Styling:** Tailwind CSS (Fluid utility-first design)
*   **Data Visualization:** D3.js (Networks/Trees), Recharts (Risk/Analytics)
*   **Motion:** Framer Motion (State-aware layout transitions)
*   **AI Engine:** Google Gemini Pro / Flash via `@google/genai`
*   **Icons:** Lucide React

## 🚀 Getting Started

1.  **Exploration:** Start in the **Diagnostic Engine** to see the current inference confidence.
2.  **Genomics:** Visit **Genomic Intel** to run GO enrichment on detected pathogenic variants.
3.  **Mapping:** Use the **Graph Explorer** to see how symptoms link to literature-derived disease networks.
4.  **Synthesis:** Generate research-grade clinical summaries in the **Literature Assistant**.

---
*Disclaimer: RareGraph AI is a research tool and should be used as a clinical decision support system, not as a replacement for expert professional medical judgment.*
