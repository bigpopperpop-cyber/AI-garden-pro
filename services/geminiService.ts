
import { GoogleGenAI } from "@google/genai";

/**
 * Sends a query and optional image to the Gemini API for plant diagnosis.
 * Uses gemini-3-flash-preview for the best balance of vision and speed.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // Add image if provided
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    
    // Add text prompt
    parts.push({ 
      text: query || "Please examine this plant's health and provide a professional assessment." 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are 'HydroBot', a world-class botanist and indoor growing expert. Provide beginner-friendly, concise, and professional advice. Diagnose visible issues from photos and provide 3-5 actionable steps. Keep response under 150 words.",
        temperature: 0.7,
      }
    });

    return response.text || "I'm processing the data but couldn't generate a report. Please try a different query.";
  } catch (error: any) {
    console.error("Botanist API Error:", error);
    return "The botanist is currently unavailable. Please check your connection and try again.";
  }
};

/**
 * Generates a quick daily tip for the dashboard.
 */
export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide one short, professional tip (max 10 words) for a beginner hydroponic grower.",
      config: { temperature: 1.0 }
    });
    return response.text?.trim() || "Check your reservoir water levels daily.";
  } catch (error) {
    return "Healthy roots make for happy plants.";
  }
};
