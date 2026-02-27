
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SuggestedRecipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const suggestRecipeFromIngredients = async (ingredients: string[]): Promise<SuggestedRecipe[]> => {
  const prompt = `En tant que chef expert, propose 3 idées de recettes créatives et variées en utilisant principalement ces ingrédients: ${ingredients.join(', ')}. Réponds en français. Inclus un temps de préparation estimé court (ex: 15 min) et des informations nutritionnelles approximatives.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            prepTime: {
              type: Type.STRING,
              description: 'Estimation du temps de préparation, ex: "20 min"'
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                advice: { type: Type.STRING }
              },
              required: ["calories", "protein", "carbs", "fat"]
            }
          },
          required: ["title", "description", "ingredients", "steps", "prepTime", "nutrition"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]') as SuggestedRecipe[];
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
};

export const getNutritionInfo = async (title: string, ingredients: string[]): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse les informations nutritionnelles pour la recette "${title}" avec les ingrédients suivants : ${ingredients.join(', ')}. Réponds en français au format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            advice: { type: Type.STRING }
          },
          required: ["calories", "protein", "carbs", "fat", "advice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erreur analyse nutritionnelle:", error);
    return null;
  }
};

export const editRecipeImage = async (base64Image: string, instruction: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/jpeg'
            }
          },
          {
            text: `Modifie cette image de plat selon l'instruction suivante : ${instruction}. Rends le résultat professionnel et appétissant.`
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur édition image:", error);
    return null;
  }
};

export const generateRecipeImage = async (title: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Une photo culinaire professionnelle, appétissante, haute résolution, cadrage serré sur le plat, lumière naturelle, fond neutre et élégant pour : ${title}`
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur génération image:", error);
    return null;
  }
};

export const searchRecipeVideo = async (title: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find a YouTube video tutorial for the recipe "${title}". Return ONLY the YouTube URL (e.g., https://www.youtube.com/watch?v=...) and nothing else. If you can't find one, return an empty string.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text?.trim() || '';
    // Basic validation to ensure it looks like a URL
    if (text.startsWith('http') && text.includes('youtube.com') || text.includes('youtu.be')) {
      return text;
    }
    return null;
  } catch (error) {
    console.error("Erreur recherche vidéo:", error);
    return null;
  }
};
export const analyzeFridgeImage = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/jpeg'
            }
          },
          {
            text: "Analyse cette photo de l'intérieur d'un réfrigérateur ou de placards et liste tous les ingrédients comestibles que tu vois. Réponds en français. Format: Donne uniquement une liste d'ingrédients séparés par des virgules, sans autre texte."
          }
        ]
      }
    });

    const text = response.text || '';
    return text.split(',').map(item => item.trim()).filter(Boolean);
  } catch (error) {
    console.error("Erreur analyse image frigo:", error);
    return [];
  }
};
