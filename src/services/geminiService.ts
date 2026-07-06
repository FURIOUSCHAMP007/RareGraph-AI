import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, HPOTerm, Disease, PGxResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are RareGraph AI, a advanced multimodal clinical reasoning system for rare diseases.
Your mission is to perform 'Reasoning Beyond Symptoms' by synthesizing clinical observations, genetic data, and multimodal evidence.
1. MAP: Map clinical findings to Human Phenotype Ontology (HPO) terms.
2. INFER: Use clinical logic to infer possible gene-disease relationships.
3. RANK: Provide a ranked list of candidate diseases with OMIM IDs and confidence scores.
4. EXPLAIN: Provide a stepwise reasoning chain justifying the ranking.
5. RECOMMEND: Suggest specific clinical tests or evidence needed to reduce diagnostic uncertainty.
Always return structured JSON only. Terminology must be research-grade and precise.`;

export async function diagnosePatient(
  symptoms: string,
  history: string,
  genetics: string,
  files: Array<{ name: string; type: string; data: string }>
): Promise<DiagnosisResult> {
  const parts: any[] = [
    { text: `BEGIN CLINICAL ANALYSIS:
SYMPTOMS: ${symptoms}
HISTORY: ${history}
GENETICS: ${genetics}

Perform deep clinical reasoning. Identify HPO terms and rank rare conditions.` }
  ];

  for (const file of files) {
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: file.data.split(',')[1] || file.data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hpo_terms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["id", "name", "category"]
            }
          },
          diseases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                genes: { type: Type.ARRAY, items: { type: Type.STRING } },
                omim: { type: Type.STRING }
              },
              required: ["id", "name", "confidence", "reasoning"]
            }
          },
          reasoning_chain: { type: Type.STRING },
          missing_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_tests: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["hpo_terms", "diseases", "reasoning_chain", "missing_evidence", "recommended_tests"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function synthesizeClinicalReport(
  patientName: string,
  hpoTerms: HPOTerm[],
  variants: any[],
  pedigreeData?: any
): Promise<string> {
  const hpoString = hpoTerms.map(t => `${t.name} (${t.id})`).join(', ');
  const variantsString = variants.map(v => `${v.gene}: ${v.variant} (${v.pathogenicity})`).join(', ');

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Synthesize a professional clinical narrative summary for patient ${patientName}.
    OBSERVED PHENOTYPES: ${hpoString}
    IDENTIFIED VARIANTS: ${variantsString}
    ${pedigreeData ? `PEDIGREE CONTEXT: ${JSON.stringify(pedigreeData)}` : ''}
    
    Structure your synthesis into:
    1. CLINICAL OVERVIEW (A cohesive narrative of how the symptoms and genetics overlap)
    2. DIFFERENTIAL DIAGNOSIS (Ranked list of potential syndromes with justification)
    3. MOLECULAR MECHANISM (How the variants explain the cellular phenotype)
    4. DIAGNOSTIC REASONING (The 'Logic Chain' used to arrive at this synthesis)
    5. RECOMMENDATIONS (Immediate next steps for clinical validation)
    
    Use a highly technical, professional tone suitable for a specialist peer-review. Use Bold headers and concise, logic-driven synthesis. Avoid fillers.`,
    config: {
      systemInstruction: "You are a clinical geneticist and expert medical synthesist. Your goal is to provide a comprehensive, deep-reasoning narrative that connects disparate data points into a unified diagnostic theory.",
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text;
}

export async function fetchClinicalEvidence(
  gene: string,
  variant: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Retrieve and summarize recent clinical evidence and PubMed papers for gene variant: ${gene} ${variant}.
    Focus on:
    1. ClinVar pathogenicity status
    2. Molecular function impact
    3. Associated phenotypes (HPO terms)
    4. Notable case studies in literature
    
    Structure as a concise, professional evidence summary with Markdown citations where possible. Use a highly technical tone.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text;
}

export async function chatWithCopilot(
  message: string,
  patientContext: {
    hpoTerms: HPOTerm[];
    variants: any[];
    currentPage: string;
  },
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are the RareGraph AI Diagnostic Copilot. You are currently viewing the '${patientContext.currentPage}' page.
      PATIENT CONTEXT:
      - PHENOTYPES: ${patientContext.hpoTerms.map(t => t.name).join(', ')}
      - GENETICS: ${patientContext.variants.map(v => v.gene).join(', ')}
      
      Your goal is to provide real-time, context-aware assistance. If the user asks about prioritization, use the current phenotypic clusters to justify your reasoning.
      Be concise, technical, and proactive. If you identify an inconsistency between the variants and the phenotypes, highlight it immediately.
      Use Markdown for formatting. Use the googleSearch tool to pull in the latest ClinVar or PubMed data when relevant.`,
      tools: [{ googleSearch: {} }]
    },
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function summarizeLiterature(topic: string): Promise<string> {
  const isHPO = topic.match(/HP:\d{7}/i);
  const isOMIM = topic.match(/(OMIM:)?\d{6}/i);

  const contextPrompt = isHPO 
    ? `Summarize clinical context for the HPO term: ${topic}. Identify the precise phenotype, associated diseases, and frequency patterns.`
    : isOMIM 
    ? `Summarize clinical context for the OMIM entry: ${topic}. Detail the disease, molecular basis, and key phenotypic features.`
    : `Summarize clinical context for: ${topic}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${contextPrompt}
    
    Structure the response as follows:
    1. SUMMARY (Brief clinical overview)
    2. PATHOPHYSIOLOGY (3-5 key mechanisms as bullet points)
    3. GENETIC DRIVERS (Major genes/variants involved)
    4. PHENOTYPE SPECTRUM (Key clinical findings)
    5. GUIDELINES (Current diagnostic/management standards)
    
    Use Bold Headers, Emojis for each section, and concise bullet points. Avoid long paragraphs.`,
    config: {
      systemInstruction: "You are a clinical synthesis engine. Provide structured, concise, and highly visual medical summaries. If a specific HPO or OMIM identifier is provided, prioritize official ontology definitions. CRITICAL: Use the googleSearch tool to ground your findings in real biomedical literature.",
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text;
}

export async function extractHPOTerms(note: string): Promise<HPOTerm[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract all relevant clinical phenotypes from the following clinical note and map them to Human Phenotype Ontology (HPO) terms.
    CLINICAL NOTE:
    ${note}
    
    Identify specific signs, symptoms, and morphological abnormalities.`,
    config: {
      systemInstruction: "You are a clinical phenotyping agent. Extract phenotypes and map to HPO (HP:XXXXXXX). Return only the JSON list of terms.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "HPO ID, e.g. HP:0001250" },
            name: { type: Type.STRING, description: "HPO Name, e.g. Seizures" },
            category: { type: Type.STRING, description: "Phenotypic category" }
          },
          required: ["id", "name", "category"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzePharmacogenomics(genetics: string): Promise<PGxResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following genetic data for pharmacogenomic (PGx) implications. Identify relevant CPIC or PharmGKB-level evidence for drug metabolism and contraindications.
    GENETIC DATA:
    ${genetics}`,
    config: {
      systemInstruction: "You are a clinical pharmacogenomics expert. Provide structured drug response predictions based on genetic variants.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                gene: { type: Type.STRING },
                variant: { type: Type.STRING },
                phenotype: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["Increased", "Decreased", "Normal", "Unknown"] },
                drugs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      recommendation: { type: Type.STRING },
                      level: { type: Type.STRING, enum: ["Strong", "Moderate", "Weak"] }
                    },
                    required: ["name", "recommendation", "level"]
                  }
                }
              },
              required: ["gene", "variant", "phenotype", "impact", "drugs"]
            }
          },
          contraindications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                drug: { type: Type.STRING },
                reason: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["High", "Moderate"] }
              },
              required: ["drug", "reason", "severity"]
            }
          }
        },
        required: ["variants", "contraindications"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function queryBiomedicalRegistry(registry: 'ClinVar' | 'OMIM' | 'Orphanet', query: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Query the official ${registry} database/registry for: "${query}".
    Retrieve high-confidence registry details:
    - If ClinVar: Provide Variant Pathogenicity, ACMG classifications, ClinVar variation ID, review status (stars), clinical significance, and phenotypic associations.
    - If OMIM: Provide OMIM number, phenotype description, gene/locus details, inheritance mode, and key features.
    - If Orphanet: Provide ORPHA code, disease classification, prevalence, age of onset, inheritance mode, and search details.

    Synthesize a clean, professional, and structured lookup report with Markdown formatting. Use bullet points and bold highlights. CRITICAL: Use the googleSearch tool to ground your findings in real biomedical databases. If not found, mention that, but perform a deep search first.`,
    config: {
      systemInstruction: `You are a specialized medical registry search assistant. Your job is to return precise, verified details from ${registry}. Ground all answers in Google Search results from official NIH ClinVar, OMIM, or Orphanet/Orphanet-DRUG pages.`,
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text;
}

export interface LiteraturePaper {
  title: string;
  authors: string;
  journal: string;
  year: string;
  pmid: string;
  pmcId?: string;
  evidenceLevel: string;
  studyType: string;
  sampleSize: string;
  keyFindings: string;
  hpoAssociations: string[];
  variantSignificance: string;
  tldr: string;
}

export interface LiteratureMonitorResponse {
  papers: LiteraturePaper[];
  synthesis: string;
  phenotypicOverlapAnalysis: string;
  alertStatus: string;
}

export async function monitorLiterature(
  query: string,
  patientPhenotypes?: string[]
): Promise<LiteratureMonitorResponse> {
  const phenotypesContext = patientPhenotypes && patientPhenotypes.length > 0
    ? `Patient Phenotypes to cross-reference: ${patientPhenotypes.join(', ')}`
    : 'No specific patient phenotypes provided.';

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Perform a real-time literature scan and monitoring analysis for: "${query}".
    ${phenotypesContext}
    
    Using Google Search, find real, peer-reviewed medical publications (such as from PubMed, NCBI, ClinGen, or reputable journals) published recently (especially 2023–2026).
    
    Extract a list of 3-5 of the most highly relevant, real published papers. For each paper, extract:
    1. Precise Title
    2. Authors (formatted as "Author A, et al.")
    3. Journal & Publication Year
    4. PMID or PMC ID (real numbers)
    5. Study Type (e.g., Case Study, Cohort Study, Clinical Trial, Review)
    6. Sample Size/Cohort
    7. Evidence Level (CEBM scale: e.g., "Level 1b", "Level 2a", "Level 4")
    8. Key clinical findings
    9. Pathogenic variant significance (e.g., "Pathogenic", "VUS", "Benign")
    10. Short, punchy clinical TL;DR summary
    11. Associated HPO Terms or Phenotypes (as a list of strings)
    
    Provide an overall SYNTHESIS summarizing the latest research trajectory and updates for "${query}", and a PHENOTYPIC OVERLAP ANALYSIS cross-referencing findings against the patient phenotypes: "${patientPhenotypes?.join(', ')}".`,
    config: {
      systemInstruction: `You are a clinical literature monitoring assistant. Your task is to perform an actual search using the googleSearch tool to find genuine, published papers on the queried variant, gene, or syndrome, and output them in the requested JSON structure. Keep everything highly objective and precise.`,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          papers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                authors: { type: Type.STRING },
                journal: { type: Type.STRING },
                year: { type: Type.STRING },
                pmid: { type: Type.STRING },
                pmcId: { type: Type.STRING },
                evidenceLevel: { type: Type.STRING },
                studyType: { type: Type.STRING },
                sampleSize: { type: Type.STRING },
                keyFindings: { type: Type.STRING },
                hpoAssociations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                variantSignificance: { type: Type.STRING },
                tldr: { type: Type.STRING }
              },
              required: [
                "title", "authors", "journal", "year", "pmid", 
                "evidenceLevel", "studyType", "sampleSize", 
                "keyFindings", "hpoAssociations", "variantSignificance", "tldr"
              ]
            }
          },
          synthesis: { type: Type.STRING },
          phenotypicOverlapAnalysis: { type: Type.STRING },
          alertStatus: { type: Type.STRING }
        },
        required: ["papers", "synthesis", "phenotypicOverlapAnalysis", "alertStatus"]
      }
    }
  });

  return JSON.parse(response.text);
}

