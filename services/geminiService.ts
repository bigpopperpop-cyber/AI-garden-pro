import { GoogleGenAI, Type } from "@google/genai";

// AI troubleshooting function using Gemini Pro for expert plant diagnosis
export const troubleshootPlant = async (description: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

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
    return response.text || "I couldn't generate a diagnosis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the AI consultant.";
  }
};

// Fetches growth guides
export const getGrowGuide = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Explain the topic "${topic}" for a beginner indoor hydroponic grower. Keep it under 300 words and use Markdown.` }] },
    });
    return response.text || "Could not find guide content.";
  } catch (error) {
    return "Error fetching guide.";
  }
};

// Expert projections for plant growth
export const getPlantProjections = async (plantName: string, variety: string, systemType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `For a ${plantName} (${variety}) grown in a ${systemType} system, provide the typical number of days from planting to: germination, flowering/first fruit, and first harvest.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            daysToGerminate: { type: Type.INTEGER },
            daysToFlower: { type: Type.INTEGER },
            daysToHarvest: { type: Type.INTEGER },
          },
          required: ["daysToGerminate", "daysToFlower", "daysToHarvest"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    // Ensure we have numbers and not just empty strings/nulls
    return {
      daysToGerminate: Number(data.daysToGerminate) || 0,
      daysToFlower: Number(data.daysToFlower) || 0,
      daysToHarvest: Number(data.daysToHarvest) || 0
    };
  } catch (error) {
    console.error("Projection Error:", error);
    return null;
  }
};

// Dashboard tip
export const getDailyTip = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: "Provide a one-sentence expert tip for a beginner hydroponic/aquaponic grower today." }] },
    });
    return response.text?.trim() || "Keep your pH between 5.5 and 6.5!";
  } catch (error) {
    return "Ensure your water temperature stays below 72°F.";
  }
};