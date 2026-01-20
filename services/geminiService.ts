import { GoogleGenAI, Type } from "@google/genai";

// AI troubleshooting function using Gemini Pro for expert plant diagnosis
export const troubleshootPlant = async (description: string, imageBase64?: string) => {
  try {
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
    console.error("Gemini Troubleshooting Error:", error);
    return "Error connecting to the AI consultant.";
  }
};

// Fetches growth guides
export const getGrowGuide = async (topic: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Explain the topic "${topic}" for a beginner indoor hydroponic grower. Keep it under 300 words and use Markdown.`,
    });
    return response.text || "Could not find guide content.";
  } catch (error) {
    console.error("Gemini Guide Error:", error);
    return "Error fetching guide.";
  }
};

// AI Shopping List / Starter Kit generator
export const generateStarterKit = async (budget: string, space: string, goal: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const prompt = `Create a complete hydroponic starter kit guide. Constraints: Budget is ${budget}, Space available is ${space}, Goal is to grow ${goal}. Provide a list of necessary equipment, estimated costs, and a first-week checklist. Use Markdown.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an encouraging mentor for new hydroponic growers. Be practical and cost-effective.",
        temperature: 0.8,
      }
    });
    return response.text || "Could not generate kit guide.";
  } catch (error) {
    console.error("Gemini Starter Kit Error:", error);
    return "Failed to connect to AI mentor.";
  }
};

// Expert projections for plant growth
export const getPlantProjections = async (plantName: string, variety: string, systemType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const varietyStr = variety ? `(${variety})` : "";
    const prompt = `For a ${plantName} ${varietyStr} grown in a ${systemType} system, provide the typical number of days from planting to: germination, flowering or first fruit set, and first harvest.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            daysToGerminate: { type: Type.INTEGER, description: "Days from planting until seeds typically sprout" },
            daysToFlower: { type: Type.INTEGER, description: "Days from planting until the first flowers or fruit set appear" },
            daysToHarvest: { type: Type.INTEGER, description: "Days from planting until the first harvest can be taken" },
          },
          required: ["daysToGerminate", "daysToFlower", "daysToHarvest"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text.trim());
    return {
      daysToGerminate: Math.max(0, Number(data.daysToGerminate) || 0),
      daysToFlower: Math.max(0, Number(data.daysToFlower) || 0),
      daysToHarvest: Math.max(0, Number(data.daysToHarvest) || 0)
    };
  } catch (error) {
    console.error("Gemini Projection API Error:", error);
    throw error;
  }
};

// Dashboard tip
export const getDailyTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: "Provide a one-sentence expert tip for a beginner hydroponic or aquaponic grower today. Focus on nutrient levels, pH, light, or air flow.",
    });
    return response.text?.trim() || "Keep your pH between 5.5 and 6.5!";
  } catch (error) {
    console.error("Gemini Daily Tip Error:", error);
    return "Ensure your water temperature stays below 72°F (22°C) to prevent root rot.";
  }
};