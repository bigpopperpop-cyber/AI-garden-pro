
import { GoogleGenAI } from "@google/genai";

/**
 * Sends a query and optional image to the Gemini API for plant diagnosis.
 * Uses gemini-3-pro-preview for high-quality complex reasoning.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    // Always create a new instance to ensure we use the latest injected API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // Vision input (if provided)
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    
    // Text prompt
    parts.push({ 
      text: query || "Please analyze this plant's health and provide professional cultivation advice." 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are 'HydroBot', a master botanist. Provide clear, professional, and beginner-friendly advice for hydroponic/aquaponic growers. If an image is provided, identify any pests or deficiencies. Provide a numbered list of fixes. Keep response under 150 words.",
        temperature: 0.7,
      }
    });

    return response.text || "The botanist is silent. Please try rephrasing.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error?.message?.includes('API Key')) {
      throw new Error("API Key required. Please use the 'Setup AI Access' button.");
    }
    
    throw error;
  }
};

export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide one short, professional tip (max 12 words) for an indoor plant grower.",
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || "Consistently monitor your water's pH levels.";
  } catch (error) {
    return "Plants thrive on consistent care and attention.";
  }
};
