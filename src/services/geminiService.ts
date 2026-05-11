import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, HPOTerm, Disease } from "../types";

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
      systemInstruction: "You are a clinical synthesis engine. Provide structured, concise, and highly visual medical summaries. If a specific HPO or OMIM identifier is provided, prioritize official ontology definitions."
    }
  });

  return response.text;
}
