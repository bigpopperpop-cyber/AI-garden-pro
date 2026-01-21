
import { GoogleGenAI } from "@google/genai";

export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: query || "Please analyze this plant and check for health issues." }];
    
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    // Use gemini-3-pro-preview for complex multimodal analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: "You are a professional botanist and hydroponic expert. Provide beginner-friendly, concise advice. If an image is provided, analyze it for signs of pests, nutrient deficiencies, or diseases. Use bullet points for actionable steps. Keep total response under 150 words.",
        temperature: 0.7,
      }
    });

    if (response.text) {
      return response.text;
    }
    
    return "The AI expert was unable to generate a response. Please try rephrasing your question or using a clearer photo.";
  } catch (error) {
    console.error("AI Expert Error:", error);
    return "The AI expert is currently unavailable. This could be due to an issue with the image format or connection. Please try again with just text or a different photo.";
  }
};

export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence beginner tip for hydroponic or outdoor gardening.",
      config: {
        temperature: 0.8
      }
    });
    return response.text?.trim() || "Check your water levels daily!";
  } catch (error) {
    return "Proper pH is the key to healthy plant growth.";
  }
};
