import { GoogleGenAI, Type } from "@google/genai";
import { GrowthProjection } from "../types.ts";

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