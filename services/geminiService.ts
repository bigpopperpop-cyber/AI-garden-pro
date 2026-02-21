import { GoogleGenAI, Type } from "@google/genai";
import { Garden, AIAnalysisResult, GrowthInsights, LifecycleStage } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const analyzePlantHealth = async (imageBase64: string): Promise<AIAnalysisResult> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  // Strip the prefix if it exists (e.g., "data:image/png;base64,")
  const base64Data = imageBase64.split(",")[1] || imageBase64;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `Analyze this plant photo for health issues. 
            Identify any nutrient deficiencies (e.g., yellowing, tip burn), pests (e.g., spider mites, aphids), and verify the current growth stage.
            Return the analysis in JSON format.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthStatus: { type: Type.STRING, description: "Healthy, Warning, or Critical" },
          diagnosis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          detectedPests: { type: Type.ARRAY, items: { type: Type.STRING } },
          detectedDeficiencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          stageVerification: { type: Type.STRING, description: "Germination, Vegetative, Flowering, Fruiting, or Harvested" },
        },
        required: ["healthStatus", "diagnosis", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const getGrowthInsights = async (garden: Garden): Promise<GrowthInsights> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const gardenContext = JSON.stringify(garden);

  const response = await ai.models.generateContent({
    model,
    contents: `Based on this garden data: ${gardenContext}, provide growth insights. 
    Include nutrient advice, pH/EC targets for the current plants/stage, and a harvest prediction.
    Return in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nutrientAdvice: { type: Type.STRING },
          phTarget: { type: Type.STRING },
          ecTarget: { type: Type.STRING },
          harvestPrediction: { type: Type.STRING },
          generalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["nutrientAdvice", "phTarget", "ecTarget", "harvestPrediction", "generalTips"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const processNaturalLanguageLog = async (text: string) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Extract logging information from this text: "${text}". 
    Look for pH levels, EC levels, water changes, or general observations. 
    Also, identify if any reminders/tasks should be created (e.g., "clean reservoir").
    Return in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          logEntry: { type: Type.STRING },
          extractedStats: {
            type: Type.OBJECT,
            properties: {
              ph: { type: Type.NUMBER },
              ec: { type: Type.NUMBER },
            }
          },
          suggestedReminders: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING, description: "low, medium, high" }
              }
            }
          }
        }
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const getTroubleshootingAdvice = async (query: string, gardens: Garden[]): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";
  const context = JSON.stringify(gardens);

  const response = await ai.models.generateContent({
    model,
    contents: `You are a professional hydroponic and aquaponic consultant. 
    Using the user's garden data as context: ${context}, answer the following question: "${query}".
    Provide practical, science-based advice.`,
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
};
