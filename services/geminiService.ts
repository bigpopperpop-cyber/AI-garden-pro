
import { GoogleGenAI } from "@google/genai";

/**
 * Local Expert Knowledge Base (Zero-Key AI)
 * Deterministic botanical engine for instant, keyless troubleshooting.
 */
const getLocalExpertAdvice = (query: string): string => {
  const q = query.toLowerCase();
  
  const rules = [
    {
      keys: ["yellow", "pale", "nitrogen"],
      advice: "LOCAL EXPERT: Likely Nitrogen deficiency or pH lock-out. Check pH (5.5-6.5). If pH is correct, increase Nitrogen PPM."
    },
    {
      keys: ["brown", "burnt", "tips", "dry"],
      advice: "LOCAL EXPERT: Suggests Nutrient Burn (high EC) or low humidity. Flush with pH-neutral water and reduce nutrient strength by 25%."
    },
    {
      keys: ["wilting", "droop", "roots", "slimy"],
      advice: "LOCAL EXPERT: Warning: Possible Root Rot (Pythium). Oxygenate your reservoir immediately and check water temps (>72°F is dangerous)."
    },
    {
      keys: ["spots", "rust", "calcium", "magnesium"],
      advice: "LOCAL EXPERT: Classic Cal-Mag deficiency. Hydroponic setups often lack these. Supplement with 2ml/gal of Cal-Mag solution."
    },
    {
      keys: ["bugs", "spider", "mites", "pests"],
      advice: "LOCAL EXPERT: Pest infestation detected. Quarantine the plant. Use Neem oil or insecticidal soap during the dark cycle only."
    },
    {
      keys: ["curl", "claw", "downward"],
      advice: "LOCAL EXPERT: 'Canoeing' or leaf clawing is often caused by excessive Nitrogen or heat stress. Dim your lights or move fans."
    }
  ];

  const matched = rules.find(r => r.keys.some(k => q.includes(k)));
  
  if (matched) return matched.advice;

  return "LOCAL EXPERT: Your description suggests a general environmental imbalance. Ensure the 'Big Three' are calibrated: pH (5.8), Light Height (18-24\"), and Reservoir Temps (<70°F). Provide more symptom details for a deeper scan.";
};

export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    if (image) parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
    parts.push({ text: query || "Examine plant health." });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are 'HydroBot'. Diagnose issues professionally. Keep it under 100 words.",
        temperature: 0.7,
      }
    });

    return response.text || getLocalExpertAdvice(query);
  } catch (error: any) {
    // If API fails (no key, network down, etc), use local knowledge
    return getLocalExpertAdvice(query);
  }
};

export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "One short hydro tip (10 words).",
      config: { temperature: 1.0 }
    });
    return response.text?.trim() || "Target pH 5.8 for optimal nutrient uptake.";
  } catch (error) {
    return "Consistently check water levels daily.";
  }
};
