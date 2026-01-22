
import { GoogleGenAI } from "@google/genai";

export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // Add image first if provided, as vision models often perform better with this ordering
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    
    // Add text query
    parts.push({ text: query || "Please analyze this plant and check for health issues." });

    // Use gemini-3-pro-preview for complex multimodal analysis (plant diagnosis)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: "You are a professional botanist and expert in indoor gardening (hydroponics/aquaponics). Provide beginner-friendly, concise advice. If an image is provided, analyze it for signs of pests, nutrient deficiencies, or diseases. Identify problems clearly and provide a numbered list of actionable steps to fix the issue. Keep the total response under 150 words.",
        temperature: 0.7,
      }
    });

    if (response && response.text) {
      return response.text;
    }
    
    return "The AI expert was unable to generate a response. Please try rephrasing your question or using a clearer photo.";
  } catch (error: any) {
    console.error("AI Expert Error Details:", error);
    
    // Provide a more descriptive error to the user to help debug "not working" states
    let errorMessage = "The AI expert is currently unavailable.";
    
    if (error?.message?.includes('API_KEY')) {
      errorMessage = "Configuration Error: Valid API key not found.";
    } else if (error?.message?.includes('fetch')) {
      errorMessage = "Network Error: Please check your internet connection and try again.";
    } else if (error?.message) {
      errorMessage = `Analysis Error: ${error.message}`;
    }
    
    return errorMessage + " Please try again with a smaller photo or just a text description.";
  }
};

export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a one-sentence beginner tip for indoor hydroponic or aquaponic gardening.",
      config: {
        temperature: 0.9
      }
    });
    return response.text?.trim() || "Check your water levels daily!";
  } catch (error) {
    return "Proper pH is the key to healthy plant growth.";
  }
};
