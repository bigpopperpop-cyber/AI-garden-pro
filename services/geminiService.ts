
import { GoogleGenAI, Type } from "@google/genai";
import { GrowthProjection } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Predicts the growth timeline for a specific plant variety.
 */
export const predictGrowthTimeline = async (
  name: string,
  variety: string,
  plantedDate: string
): Promise<GrowthProjection | null> => {
  try {
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
 * Expert troubleshooting advice.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const contents: any[] = [{ text: query }];
    if (image) {
      contents.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction: "You are a world-class hydroponic and aquaponic consultant. Provide concise, actionable advice for indoor gardeners.",
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please check your parameters.";
  } catch (error) {
    console.error("Expert advice failed:", error);
    return "I'm having trouble connecting to the botanical database. Please check your internet or try again later.";
  }
};
