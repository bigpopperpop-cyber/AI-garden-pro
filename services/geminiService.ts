
import { GoogleGenAI } from "@google/genai";

/**
 * Sends a query and optional image to the Gemini API for plant diagnosis.
 * Uses gemini-3-flash-preview for the best balance of vision capabilities and reliability.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct parts array
    const parts: any[] = [];
    
    // If an image is provided, add it as the first part for better vision model context
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    
    // Add the user text prompt
    parts.push({ 
      text: query || "Please examine this plant and provide a health assessment or maintenance advice." 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts }, // Strict parts-based structure for multimodal requests
      config: {
        systemInstruction: "You are 'HydroBot', a world-class botanist and hydroponic/aquaponic expert. Provide beginner-friendly, professional, and concise advice. If a photo is provided, diagnose visible pests, deficiencies, or diseases. Give clear, numbered actionable steps. Keep your response under 150 words.",
        temperature: 0.7,
      }
    });

    if (response && response.text) {
      return response.text;
    }
    
    return "The botanist is thinking, but couldn't find the right words. Try rephrasing your question.";
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    
    // Friendly user-facing error messages
    if (error?.message?.includes('API_KEY')) {
      return "Configuration Error: The botanist's license (API Key) is missing or invalid.";
    }
    
    return `The botanist is currently unavailable (${error.message || 'Connection Error'}). Please try again with a simpler text query or a smaller photo.`;
  }
};

/**
 * Fetches a simple daily tip for the dashboard.
 */
export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide one short, helpful tip (max 15 words) for a beginner indoor hydroponic grower.",
      config: {
        temperature: 1.0 // More variety for daily tips
      }
    });
    return response.text?.trim() || "Clean your reservoir every 2 weeks!";
  } catch (error) {
    return "Consistently check your pH levels for optimal nutrient uptake.";
  }
};
