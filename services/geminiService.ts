
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Product, UserProfile, Order } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use a simplified representation of products to save tokens and improve latency
const simplifyProducts = (products: Product[]) => {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tags: p.tags,
    category: p.category,
    price: p.price,
    color: p.color
  }));
};

export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<string[]> => {
  try {
    const simplifiedCatalog = simplifyProducts(allProducts);
    
    let prompt;
    if (!query || query.trim() === '') {
        const personas = [
            "a tech enthusiast looking for the latest gadgets",
            "someone planning a cozy weekend at home with comfort food and relaxation",
            "a fashionista looking for a stylish, color-coordinated outfit",
            "someone looking for a healthy lifestyle upgrade with fitness gear",
            "a student organizing their desk for productivity",
            "a coffee lover looking for the perfect morning setup",
            "a traveler packing for a weekend getaway"
        ];
        const randomPersona = personas[Math.floor(Math.random() * personas.length)];
        
        prompt = `
            You are an intelligent shopping curator.
            The user has asked for a surprise recommendation.
            Curate a collection for: ${randomPersona}.
            
            Here is the product catalog:
            ${JSON.stringify(simplifiedCatalog)}
            
            Task: Pick 5-7 products that fit this specific persona perfectly.
            Return a JSON array of product IDs (strings).
        `;
    } else {
        prompt = `
          You are an intelligent shopping assistant.
          User Query: "${query}"
          
          Here is the product catalog:
          ${JSON.stringify(simplifiedCatalog)}
          
          Task: Return a JSON array of product IDs (strings) that best match the user's intent.
          Consider synonyms, semantic meaning, pricing constraints, and usage context (e.g., "beach" matches sunglasses or towels).
          Sort the IDs by relevance. Return AT MOST 6 IDs.
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const productIds = JSON.parse(response.text || '[]');
    return productIds;
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};

export const searchProductsWithImage = async (base64Image: string, allProducts: Product[]): Promise<string[]> => {
  try {
    const simplifiedCatalog = simplifyProducts(allProducts);

    const prompt = `
      I am providing an image of a product I want to buy.
      Look at the image visually and find the best matches from the provided Product Catalog below.
      
      Product Catalog:
      ${JSON.stringify(simplifiedCatalog)}
      
      Task:
      1. Analyze the image for item type, color, style, and context.
      2. Return a JSON array of the top 4 Product IDs from the catalog that visually resemble the image.
    `;

    // Remove data:image/png;base64, prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using a vision-capable model
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const productIds = JSON.parse(response.text || '[]');
    return productIds;
  } catch (error) {
    console.error("AI Image Search Error:", error);
    return [];
  }
};

export const getRecommendationsWithAI = async (purchasedItems: Product[], allProducts: Product[]): Promise<{ productIds: string[], reason: string }> => {
  try {
    const simplifiedCatalog = simplifyProducts(allProducts);
    const purchasedSummary = purchasedItems.map(p => p.name).join(', ');

    const prompt = `
      The user just bought the following items: ${purchasedSummary}.
      
      Catalog:
      ${JSON.stringify(simplifiedCatalog)}
      
      Task: Recommend 3 other products from the catalog that complement the purchase.
      Return a JSON object with two properties:
      1. "productIds": an array of 3 product IDs strings.
      2. "reason": A short, catchy sentence explaining why these were picked (e.g., "Great matches for your new gear!").
      
      Do not recommend items that are already in the purchased list.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"productIds": [], "reason": ""}');
    return result;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return { productIds: [], reason: "Top picks for you" };
  }
};

export const createSupportChatSession = (userProfile: UserProfile, orders: Order[]): Chat => {
    const systemInstruction = `
    You are a helpful, friendly, and efficient customer support agent for HarbourMart.
    
    User Context:
    Name: ${userProfile.name || 'Guest'}
    Email: ${userProfile.email || 'Not provided'}
    
    Order History:
    ${JSON.stringify(orders.map(o => ({
        id: o.id,
        date: o.date,
        total: o.total,
        status: o.status,
        items: o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')
    })))}
    
    Your capabilities:
    1. Answer questions about product availability (assume standard catalog).
    2. Check order status based on the history provided above.
    3. Process refunds: If a user asks for a refund for a specific order, check if the order exists in their history. If it does, simulate processing the refund and tell them it has been approved and will take 3-5 business days. ALWAYS ask for a reason for the refund first.
    4. General Support: Help with shipping inquiries, account issues, etc.
    
    Tone: Professional, empathetic, and concise. Do not sound robotic.
    
    IMPORTANT: If the user explicitly asks to speak to a "real person", "human", or "agent", acknowledge it politely and say you are connecting them to a human agent now.
    `;

    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: systemInstruction,
        }
    });
};
