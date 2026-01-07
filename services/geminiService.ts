
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const getAPIKey = () => {
  const key = process.env.API_KEY;
  return typeof key === 'string' ? key : '';
};

const getAIClient = () => new GoogleGenAI({ apiKey: getAPIKey() });

export const parseBulkImport = async (input: string): Promise<Omit<Product, 'id' | 'lastUpdated'>[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse this natural language inventory update into a JSON array of items. The prices are in KES (Kenyan Shillings). Extract both the "selling price" (what customers pay) and the "buying price" (the cost to the boutique). If only one price is mentioned, assume it is the selling price and estimate a buying price at 60% of that value: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The name of the garment' },
            category: { type: Type.STRING, description: 'e.g., Tops, Bottoms, Outerwear, Accessories' },
            size: { type: Type.STRING, description: 'The size (S, M, L, XL, OS)' },
            color: { type: Type.STRING, description: 'The color or pattern' },
            price: { type: Type.NUMBER, description: 'Selling price as a number in KES' },
            buyingPrice: { type: Type.NUMBER, description: 'Buying price (cost) as a number in KES' },
            stock: { type: Type.NUMBER, description: 'Quantity received' },
            minStockThreshold: { type: Type.NUMBER, description: 'Recommended minimum stock alert level (default to 3)' }
          },
          required: ["name", "category", "size", "color", "price", "buyingPrice", "stock"]
        }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Parsing Error:", e);
    return [];
  }
};

export const getInventoryAssistantResponse = async (
  query: string,
  currentInventory: Product[],
  chatHistory: { role: 'user' | 'assistant', content: string }[]
): Promise<string> => {
  const ai = getAIClient();
  
  const inventoryContext = JSON.stringify(currentInventory.map(p => ({
    name: p.name,
    stock: p.stock,
    price: p.price,
    cost: p.buyingPrice,
    color: p.color,
    size: p.size,
    lowStock: p.stock <= p.minStockThreshold,
    category: p.category
  })));

  const systemInstruction = `You are the exclusive AI Inventory Strategist for 'Marimaya Closet', a high-end luxury fashion boutique in Nairobi, Kenya.
    Your tone is ultra-premium, articulate, and strategically minded.
    
    CAPABILITIES:
    - Real-time Inventory Insight: You know exactly what is in stock.
    - Financial Reasoning: You understand the margin between "cost" (buyingPrice) and "retail" (price). You can discuss profitability if asked.
    - Styling & Curation: You can suggest pairings (e.g., "The Ivory Cashmere Wrap would perfectly complement the Midnight Blue Silk Palazzo Trousers").
    - Trend Forecasting: You can provide advice on what to restock based on inventory levels.

    RULES:
    - All prices are in KES (Kenyan Shillings).
    - Refer to garments by their full names.
    - If asked about "value", clarify if the user means "Retail Value" or "Asset Cost".
    - Never refer to the shop as a warehouse or factory; it is an "Atelier" or "Boutique".
    
    Current Boutique Records: ${inventoryContext}`;

  const historyParts = chatHistory
    .map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: String(h.content) }] }));
  
  const firstUserIndex = historyParts.findIndex(p => p.role === 'user');
  const validHistory = firstUserIndex !== -1 ? historyParts.slice(firstUserIndex) : [];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...validHistory,
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.65,
      topP: 0.95,
      topK: 40
    }
  });

  const resultText = response.text;
  return typeof resultText === 'string' ? resultText : "I apologize, but I am momentarily unable to retrieve the boutique archives. Shall we try again?";
};
