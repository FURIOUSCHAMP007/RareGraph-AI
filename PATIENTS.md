# 📂 Patient Registry Dashboard 

This document catalogs the clinical cases and patient profiles integrated into the **RareGraph** diagnostic ecosystem.

---

## 🧬 Clinical Cases (Diagnostic Engine)
*Used for high-fidelity clinical reasoning and phenotypic synthesis.*

| Condition | Class | Core Presentation | Genetic Profile |
| :--- | :--- | :--- | :--- |
| **MELAS** | Mitochondrial | Muscle weakness, focal seizures, strokes | `MT-TL1`, ↑ Lactic Acid |
| **hEDS** | Connective | Joint hypermobility, POTS, chronic pain | `COL5A1` Neg (hEDS) |
| **Fabry** | Lysosomal | Acroparesthesia, corneal verticillata | `GLA` sequencing pending |
| **Huntington** | Neuro | Involuntary chorea, cognitive decline | `HTT` CAG Expansion |
| **Usher II** | Sensory | Dual loss (Hearing/Vision), Night blindness | `USH2A` candidate |

---

## 🕸️ Graph Explorer Nodes
*Network entities representing patient-phenotype-gene interactions.*

> [!TIP]
> Use these IDs in the **Graph Explorer** to isolate specific sub-networks.

| ID | Label | Diagnostic Summary | High-Confidence Links |
| :--- | :--- | :--- | :--- |
| `p1` | **PATIENT_01** | Multisystem mitochondrial index case | `MT-TL1`, Myopathy |
| `p2` | **PATIENT_02** | Pediatric muscular dystrophy suspect | `DMD`, Gowers Sign |
| `p3` | **PATIENT_03** | Infant metabolic/immunological failure | `Failure to Thrive` |
| `p4` | **PATIENT_04** | Adult neurodegenerative profile | `HTT`, Chorea |
| `p5` | **PATIENT_05** | Chronic systemic acroparesthesia | `GLA`, Renal Failure |
| `p6` | **PATIENT_06** | Progressive neurosensory decline | `Retinitis Pigmentosa` |

---

## 🛠️ Data Integration Status
- [x] Phenotype mapping (HPO)
- [x] Genetic variant annotation (ACMG)
- [x] Relational link generation (D3-Graph)
- [x] Clinical documentation (MD)
