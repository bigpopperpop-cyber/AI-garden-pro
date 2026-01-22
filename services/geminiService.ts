
import { GoogleGenAI } from "@google/genai";

/**
 * Sends a query and optional image to the Gemini API for plant diagnosis.
 * Uses gemini-3-flash-preview for the best balance of vision and speed.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    // We use the system-provided API key automatically.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // Add image if provided for visual diagnosis
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    
    // Add text prompt with expert system instructions
    parts.push({ 
      text: query || "Please examine this plant's health and provide a professional assessment." 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are 'HydroBot', a master botanist. Provide clear, professional, and beginner-friendly advice for hydroponic/aquaponic growers. If an image is provided, identify any pests or deficiencies. Provide a numbered list of fixes. Keep response under 150 words.",
        temperature: 0.7,
      }
    });

    return response.text || "The botanist is carefully reviewing your request. Please try again in a moment.";
  } catch (error: any) {
    console.error("Botanist API Error:", error);
    
    // Friendly fallback message for beginner growers
    return "The botanist is currently out in the field. Generally, for indoor hydroponics, ensure your pH is between 5.5-6.5, your water temperature is below 72°F (22°C), and your lighting is consistent. Please try the digital consultation again shortly!";
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
      contents: "Provide one short, professional tip (max 10 words) for a beginner indoor hydroponic grower.",
      config: { temperature: 1.0 }
    });
    return response.text?.trim() || "Consistently monitor your water's pH levels.";
  } catch (error) {
    return "Plants thrive on consistent care and attention.";
  }
};
