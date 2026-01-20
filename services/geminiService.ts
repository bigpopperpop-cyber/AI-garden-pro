
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExpertAdvice = async (query: string) => {
  try {
    // Use gemini-3-flash-preview for basic text tasks like simple Q&A.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a friendly hydroponic assistant for beginners. Answer the following question concisely and simply: ${query}`,
      config: {
        systemInstruction: "Keep answers under 150 words. Use bullet points for steps.",
        temperature: 0.7,
      }
    });
    // Access response.text as a property.
    return response.text || "I'm sorry, I couldn't find an answer for that right now.";
  } catch (error) {
    console.error("AI Error:", error);
    return "The AI expert is currently resting. Please try again later.";
  }
};

export const getDailyGrowerTip = async () => {
  try {
    // Use gemini-3-flash-preview for a quick one-sentence tip.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence beginner tip for hydroponic or outdoor gardening.",
    });
    return response.text?.trim() || "Check your water levels daily!";
  } catch (error) {
    return "Proper pH is the key to healthy plant growth.";
  }
};
