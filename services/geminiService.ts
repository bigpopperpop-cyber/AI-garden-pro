import { GoogleGenAI, Type } from "@google/genai";
import { GrowthProjection, Garden } from "../types.ts";

/**
 * Predicts the growth timeline for a specific plant variety.
 */
export const predictGrowthTimeline = async (
  name: string,
  variety: string,
  plantedDate: string
): Promise<GrowthProjection | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict the botanical growth stages for a plant named "${name}" (variety: "${variety}") planted on ${plantedDate}. 
      Consider typical hydroponic/indoor growth rates which are often 20-30% faster than soil. 
      Return realistic estimated dates for Germination, Vegetative start, Flowering start, and expected Harvest.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            germinationDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            vegetativeDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            floweringDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            harvestDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            notes: { type: Type.STRING, description: "A brief care tip based on this specific variety." },
          },
          required: ["germinationDate", "vegetativeDate", "floweringDate", "harvestDate", "notes"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GrowthProjection;
  } catch (error) {
    console.error("AI Prediction failed:", error);
    return null;
  }
};

/**
 * Provides a holistic system analysis of all gardens.
 */
export const getSystemAnalysis = async (gardens: Garden[]): Promise<string | null> => {
  if (!gardens.length) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const gardenContext = gardens.map(g => ({
      name: g.name,
      type: g.type,
      plantCount: g.plants.length,
      stages: g.plants.map(p => p.stage)
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a 1-sentence expert grower analysis and "System Health Score" (0-100) based on these gardens: ${JSON.stringify(gardenContext)}. Be encouraging but scientific.`
    });

    return response.text || null;
  } catch (error) {
    console.error("System analysis failed:", error);
    return null;
  }
};
