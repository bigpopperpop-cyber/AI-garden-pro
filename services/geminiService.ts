
import { GoogleGenAI } from "@google/genai";

/**
 * Local Heuristics Engine (The "Keyless AI")
 * Provides immediate botanical advice based on common symptoms if the primary AI is unreachable.
 */
const getLocalExpertAdvice = (query: string): string => {
  const q = query.toLowerCase();
  
  if (q.includes("yellow") || q.includes("pale")) {
    return "HEURISTIC ANALYSIS: Yellowing leaves (Chlorosis) typically indicate a Nitrogen deficiency or pH imbalance. Action: Check that your pH is between 5.5 and 6.5. If pH is correct, increase Nitrogen (N) nutrients slightly.";
  }
  if (q.includes("brown") || q.includes("burnt") || q.includes("tips")) {
    return "HEURISTIC ANALYSIS: Brown, 'burnt' leaf edges usually suggest 'Nutrient Burn' or high salinity. Action: Check your EC/PPM levels. Flush the system with pH-balanced water for 24 hours and reduce nutrient concentration by 20%.";
  }
  if (q.includes("wilting") || q.includes("droop") || q.includes("sad")) {
    return "HEURISTIC ANALYSIS: Wilting is often a sign of root zone issues or oxygen deprivation (Root Rot). Action: Inspect roots; they should be white and firm. If brown/slimy, add H2O2 to the reservoir and increase aeration with a larger air stone.";
  }
  if (q.includes("spot") || q.includes("dot") || q.includes("rust")) {
    return "HEURISTIC ANALYSIS: Spots on leaves can indicate Calcium/Magnesium deficiency or fungal pathogens. Action: Supplement with a Cal-Mag additive. Ensure humidity is below 60% and improve airflow with oscillating fans.";
  }
  if (q.includes("bug") || q.includes("pest") || q.includes("spider") || q.includes("fly")) {
    return "HEURISTIC ANALYSIS: Pest activity detected. Action: Identify the specific insect. For soft-bodied pests like aphids or mites, use a diluted Neem Oil spray during dark cycles. Check the undersides of all leaves.";
  }
  if (q.includes("white") || q.includes("powder") || q.includes("mold")) {
    return "HEURISTIC ANALYSIS: Possible Powdery Mildew or mineral buildup. Action: Improve air circulation and reduce humidity. A 1:9 milk-to-water spray can act as a safe, natural fungicide for early-stage mildew.";
  }
  if (q.includes("curl") || q.includes("claw")) {
    return "HEURISTIC ANALYSIS: Leaf curling or 'clawing' is a classic sign of Nitrogen toxicity or heat stress. Action: Lower your grow light or reduce Nitrogen levels. Ensure canopy temperatures do not exceed 82°F (28°C).";
  }

  return "HYDRO-BOT DIAGNOSIS: Based on your description, I recommend a 'System Reset'. Check your three pillars: 1. pH (5.8 target), 2. Light intensity/distance, and 3. Water Oxygenation. If symptoms persist, provide more detail about leaf color and texture.";
};

/**
 * Sends a query and optional image to the Gemini API for plant diagnosis.
 * Falls back to Local Heuristics if the API is unavailable.
 */
export const getExpertAdvice = async (query: string, image?: { data: string, mimeType: string }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }
    parts.push({ 
      text: query || "Please examine this plant's health and provide a professional assessment." 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: "You are 'HydroBot', a master botanist. Provide clear, professional, and beginner-friendly advice for hydroponic/aquaponic growers. If an image is provided, identify any pests or deficiencies. Provide a numbered list of fixes. Keep response under 150 words.",
        temperature: 0.7,
      }
    });

    return response.text || getLocalExpertAdvice(query);
  } catch (error: any) {
    console.error("Botanist API (Gemini) unavailable, switching to Local Heuristics.");
    // Return local heuristic advice so the user is never left without a helpful answer.
    return getLocalExpertAdvice(query);
  }
};

/**
 * Generates a quick daily tip for the dashboard.
 */
export const getDailyGrowerTip = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide one short, professional tip (max 10 words) for a beginner indoor hydroponic grower.",
      config: { temperature: 1.0 }
    });
    return response.text?.trim() || "Check your reservoir pH levels every 48 hours.";
  } catch (error) {
    const fallbackTips = [
      "Keep reservoir temps below 72°F to prevent rot.",
      "Always calibrate your pH pen before use.",
      "Clean your air stones every 30 days.",
      "Prune lower leaves to improve airflow.",
      "Healthy roots should look like white noodles."
    ];
    return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
  }
};
