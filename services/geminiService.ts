import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * Safely parses JSON from a string that might contain markdown backticks.
 */
const safeParseAIJson = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI JSON Parsing Error:", e);
    return null;
  }
};

/**
 * Expert troubleshooting for plant health.
 */
export const troubleshootPlant = async (description: string, imageBase64?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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
    return "The AI consultant is currently offline. Please try again shortly.";
  }
};

/**
 * Basic growing guides enhanced with Google Search for real-time data.
 */
export const getGrowGuide = async (topic: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Provide a detailed beginner guide for '${topic}' in an indoor hydroponic context. Include current market considerations for hardware.` }] },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    let text = response.text || "Guide content unavailable.";
    
    // Extract grounding URLs if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      text += "\n\n### Current Market Sources:\n";
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          text += `- [${chunk.web.title || 'Market Link'}](${chunk.web.uri})\n`;
        }
      });
    }
    
    return text;
  } catch (error) {
    return "Error connecting to guide database.";
  }
};

/**
 * Estimates growth milestones for plant forecasting.
 */
export const getPlantProjections = async (plantName: string, variety: string, systemType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const model = 'gemini-3-flash-preview';
    
    const varietyStr = variety ? `(variety: ${variety})` : "";
    const prompt = `Calculate typical growth milestones for: ${plantName} ${varietyStr} in a ${systemType} system.
    Return ONLY JSON: {"daysToGerminate": int, "daysToFlower": int, "daysToHarvest": int}`;

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
    
    const data = safeParseAIJson(response.text);
    if (!data) throw new Error("Invalid AI format");

    return {
      daysToGerminate: data.daysToGerminate || 7,
      daysToFlower: data.daysToFlower || 30,
      daysToHarvest: data.daysToHarvest || 60
    };
  } catch (error) {
    console.error("Projections error:", error);
    return null;
  }
};

/**
 * One-sentence expert daily tip.
 */
export const getDailyTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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

/**
 * Live API connection for the hands-free botanist.
 */
export const connectLiveBotanist = (callbacks: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: 'You are an expert indoor hydroponic and aquaponic consultant. You are helping a user hands-free. Keep responses concise and practical.',
    },
  });
};
