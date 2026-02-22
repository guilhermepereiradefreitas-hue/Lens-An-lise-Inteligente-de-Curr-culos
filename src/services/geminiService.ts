import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// @ts-ignore
const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY) || (process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({ apiKey: apiKey });

export async function analyzeResume(name: string, role: string, pdfText: string, jobDesc: string): Promise<Omit<AnalysisResult, 'id' | 'date'>> {
  const prompt = `Você é um especialista sênior em recrutamento e seleção. Analise este currículo em relação à vaga.

CANDIDATO: ${name}
VAGA: ${role}

CURRÍCULO:
${pdfText.substring(0, 6000)}

DESCRIÇÃO DA VAGA:
${jobDesc.substring(0, 2000)}

Responda APENAS com JSON válido, sem markdown, sem texto extra.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Score from 0 to 100" },
          verdict: { type: Type.STRING, description: "GO, MAYBE, or NO" },
          title: { type: Type.STRING, description: "Short evaluation phrase" },
          summary: { type: Type.STRING, description: "2-3 sentences executive summary" },
          subscores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.INTEGER }
              }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          blindspots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING }
              }
            }
          },
          questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "verdict", "title", "summary", "subscores", "strengths", "gaps", "blindspots", "questions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text);
}
