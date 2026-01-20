import { GoogleGenAI, Type } from "@google/genai";

/**
 * Safely parses JSON from a string that might contain markdown backticks.
 */
const safeParseAIJson = (text: string) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Critical: AI JSON Parsing Error. Raw Text:", text, e);
    return null;
  }
};

/**
 * Expert troubleshooting for plant health.
 */
export const troubleshootPlant = async (description: string, imageBase64?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';

    let contents;
    if (imageBase64) {
      contents = {
        parts: [
          { text: `Professional Botanist Diagnosis Task: ${description}` },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      };
    } else {
      contents = { 
        parts: [{ text: `Professional Botanist Diagnosis Task: ${description}` }] 
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "You are a senior botanist. Return a professional Markdown report with sections: Diagnosis, Remediation, and Prevention.",
        temperature: 0.7,
      }
    });
    return response.text || "No diagnosis could be generated.";
  } catch (error) {
    console.error("troubleshootPlant Error:", error);
    return "The AI consultant is currently offline. Please try again in a few minutes.";
  }
};

/**
 * Basic growing guides.
 */
export const getGrowGuide = async (topic: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Explain '${topic}' for a beginner indoor farmer in 200 words using Markdown.` }] },
    });
    return response.text || "Guide content unavailable.";
  } catch (error) {
    console.error("getGrowGuide Error:", error);
    return "Wiki database connection error.";
  }
};

/**
 * Customized starter kit generation.
 */
export const generateStarterKit = async (budget: string, space: string, goal: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const prompt = `Hydroponic Starter Plan: Budget=${budget}, Space=${space}, Plants=${goal}. Provide equipment list and first-week guide.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a master hydroponic engineer. Provide a detailed, budget-conscious setup plan in Markdown.",
        temperature: 0.8,
      }
    });
    return response.text || "Plan generation failed.";
  } catch (error) {
    console.error("generateStarterKit Error:", error);
    return "Failed to connect to AI Mentor.";
  }
};

/**
 * Estimates growth milestones for plant forecasting.
 */
export const getPlantProjections = async (plantName: string, variety: string, systemType: string) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key configuration is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-flash-preview for speed and efficiency on basic text data tasks
    const model = 'gemini-3-flash-preview';
    
    const varietyStr = variety ? `(variety: ${variety})` : "";
    const prompt = `Research growth milestones for: ${plantName} ${varietyStr} in a ${systemType} indoor system.
    Return ONLY valid JSON with these keys: 
    "daysToGerminate" (integer), 
    "daysToFlower" (integer), 
    "daysToHarvest" (integer).`;

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
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
    if (!text) {
      throw new Error("Empty response from AI service.");
    }
    
    const data = safeParseAIJson(text);
    if (!data) {
      throw new Error("Invalid format received from AI.");
    }

    return {
      daysToGerminate: Math.max(1, Number(data.daysToGerminate) || 0),
      daysToFlower: Math.max(1, Number(data.daysToFlower) || 0),
      daysToHarvest: Math.max(1, Number(data.daysToHarvest) || 0)
    };
  } catch (error: any) {
    console.error("getPlantProjections Error Detail:", error);
    // Standardize error message for UI consumption
    throw new Error(error.message || "Unknown connectivity error.");
  }
};

/**
 * One-sentence expert daily tip.
 */
export const getDailyTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: "One sentence of expert advice for a beginner indoor hydroponic grower." }] },
    });
    return response.text?.trim() || "Clean your reservoir every 2 weeks!";
  } catch (error) {
    return "Maintain water temps between 18-22°C for optimal root health.";
  }
};