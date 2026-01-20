
import { GoogleGenAI } from "@google/genai";

export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: `You are a friendly hydroponic assistant for beginners. Answer the following question concisely and simply: ${query}` }];
    
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    // Use gemini-3-flash-preview for multimodal tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are a professional botanist and hydroponic expert. If an image is provided, analyze it for signs of pests, nutrient deficiencies, or diseases. Keep answers under 150 words. Use bullet points for steps.",
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't find an answer for that right now.";
  } catch (error) {
    console.error("AI Error:", error);
    return "The AI expert is currently resting. Please try again later.";
  }
};

export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence beginner tip for hydroponic or outdoor gardening.",
    });
    return response.text?.trim() || "Check your water levels daily!";
  } catch (error) {
    return "Proper pH is the key to healthy plant growth.";
  }
};
