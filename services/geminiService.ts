import { GoogleGenAI, Type } from "@google/genai";
import { Anime, Recommendation } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is required");
  }
  return new GoogleGenAI({ apiKey });
};

export const getAnimeArcInfo = async (animeTitle: string, currentEpisode: number): Promise<{ currentArc: string; episodesToArcEnd: number; totalEpisodes: number }> => {
  try {
    const ai = getAI();
    const model = ai.models;

    const prompt = `
      For the anime "${animeTitle}", looking at episode ${currentEpisode}:
      1. What is the name of the current story arc?
      2. How many episodes are left until this specific arc ends?
      3. What is the total number of episodes currently released/planned?
      
      Return JSON.
    `;

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentArc: { type: Type.STRING },
            episodesToArcEnd: { type: Type.NUMBER },
            totalEpisodes: { type: Type.NUMBER },
          },
          required: ["currentArc", "episodesToArcEnd", "totalEpisodes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error) {
    console.error("Error fetching arc info:", error);
    // Fallback mock data if API fails or key is missing
    return {
      currentArc: "Unknown Arc",
      episodesToArcEnd: 0,
      totalEpisodes: 12
    };
  }
};

export const getCompletionProbability = async (animeTitle: string, userLikes: string[]): Promise<{ probability: number; reason: string }> => {
  try {
    const ai = getAI();

    const prompt = `
      The user wants to watch "${animeTitle}".
      User previously liked: ${userLikes.join(", ")}.
      
      Based on the anime's length, pacing, and genre fit with user likes:
      Calculate a percentage probability (0-100) that they will finish it.
      Give a short, witty reason.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probability: { type: Type.NUMBER },
            reason: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { probability: 50, reason: "AI is sleeping." };
    return JSON.parse(text);

  } catch (error) {
    return { probability: 45, reason: "It's a long journey, proceed with caution." };
  }
};

export const getRecommendations = async (watched: Anime[], likes: string[], dislikes: string[]): Promise<Recommendation[]> => {
  try {
    const ai = getAI();

    const watchedTitles = watched.map(a => `${a.title} (${a.rating || 'unrated'})`).join(", ");

    const prompt = `
      User History:
      ALREADY WATCHED / WATCHING (DO NOT RECOMMEND THESE): ${watchedTitles}
      
      User Likes: ${likes.join(", ")}
      User Dislikes: ${dislikes.join(", ")}
      
      Task: Recommend 3 NEW anime they haven't seen.
      Rules:
      1. IGNORE any title listed in "ALREADY WATCHED".
      2. Base recommendations on their "Likes" and "Dislikes".
      3. If "Likes" is empty, suggest generally highly-rated diverse anime not in the watched list.
      4. Ensure variety in genres.
      
      Return JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (error) {
    console.error(error);
    return [
      { title: "Cowboy Bebop", reason: "A classic you might have missed.", matchScore: 90 },
      { title: "Jujutsu Kaisen", reason: "Action packed and modern.", matchScore: 85 },
      { title: "Spy x Family", reason: "Wholesome and fun.", matchScore: 80 }
    ];
  }
};

// Helper for 'Prevent Hold' motivation
export const getMotivationalMessage = async (animeTitle: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user wants to put "${animeTitle}" on hold. Give a very short, intense 1-sentence motivation to keep watching because the next arc is fire.`
    });
    return response.text || "Don't give up now, the best part is coming!";
  } catch (e) {
    return "Don't give up now, the best part is coming!";
  }
}