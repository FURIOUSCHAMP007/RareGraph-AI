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
