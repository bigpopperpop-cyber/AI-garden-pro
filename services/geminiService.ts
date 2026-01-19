
import { GoogleGenAI } from "@google/genai";

export const troubleshootPlant = async (description: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  let contents;
  if (imageBase64) {
    contents = {
      parts: [
        { text: `You are a professional botanist and indoor farming expert. Analyze this plant issue. Description: ${description}` },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    };
  } else {
    contents = { 
      parts: [{ text: `You are a professional botanist and indoor farming expert. Analyze this plant issue described by the user: ${description}. Provide a diagnosis and actionable steps.` }] 
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "Format your response in Markdown with clear sections: Diagnosis, Immediate Actions, and Prevention Tips.",
        temperature: 0.7,
      }
    });
    return response.text || "I couldn't generate a diagnosis. Please try again with more details.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the AI consultant. Please check your connection and try again.";
  }
};

export const getGrowGuide = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Explain the topic "${topic}" for a beginner indoor hydroponic or aquaponic grower. Use simple terms, analogies, and explain WHY it matters. Keep it under 300 words and use Markdown.` }] },
    });
    return response.text || "Could not find guide content.";
  } catch (error) {
    return "Error fetching guide.";
  }
};

export const getDailyTip = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: "Provide a one-sentence expert tip for a beginner hydroponic/aquaponic grower today. Focus on things like water quality, lighting, or common beginner mistakes." }] },
    });
    return response.text?.trim() || "Keep your pH between 5.5 and 6.5 for optimal nutrient uptake!";
  } catch (error) {
    return "Ensure your water temperature stays below 72°F to prevent root rot.";
  }
};

export const getPlantingAdvice = async (plantName: string, systemType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Provide expert advice for growing ${plantName} in a ${systemType} system. Include ideal pH, EC levels, and common pitfalls.` }] },
    });
    return response.text;
  } catch (error) {
    return "Unable to get advice right now.";
  }
};
