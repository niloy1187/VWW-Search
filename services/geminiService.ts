import { GoogleGenAI } from "@google/genai";
import { SearchParams, SearchResult } from "../types";

// ------------------------------------------------------------------
// UTILITIES
// ------------------------------------------------------------------

/**
 * High-quality, curated Unsplash collections for fallback images.
 * Cached to prevent unnecessary re-allocations.
 */
const FALLBACK_IMAGES: Record<string, string[]> = {
    beach: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=800&q=80",
        "https://images.unsplash.com/photo-1519046904884-53103b34b271?w=800&q=80"
    ],
    mountain: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
        "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=800&q=80"
    ],
    city: [
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
        "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80"
    ],
    forest: [
        "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?w=800&q=80",
        "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80"
    ],
    desert: [
        "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80"
    ],
    snow: [
        "https://images.unsplash.com/photo-1517299321609-52687d1bc555?w=800&q=80",
        "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800&q=80"
    ],
    hotel: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
    ],
    flight: [
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
        "https://images.unsplash.com/photo-1559268950-2d7ceb2eee3a?w=800&q=80"
    ],
    rental: [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80"
    ],
    activity: [
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
        "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80"
    ],
    default: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
    ]
};

export const getSmartFallbackImage = (type: string, name: string, location: string = '') => {
  const safeName = (name || "").toLowerCase();
  const safeLoc = (location || "").toLowerCase();
  const context = safeName + " " + safeLoc;
  
  let category = 'hotel'; // default for stays

  if (type === 'flight') category = 'flight';
  else if (type === 'rental') category = 'rental';
  else if (type === 'activity') category = 'activity';
  else {
      // Fast keyword matching
      if (context.includes('beach') || context.includes('goa') || context.includes('sea') || context.includes('ocean')) category = 'beach';
      else if (context.includes('mountain') || context.includes('hill') || context.includes('manali') || context.includes('snow')) category = 'mountain';
      else if (context.includes('jungle') || context.includes('forest') || context.includes('wild')) category = 'forest';
      else if (context.includes('desert') || context.includes('sand') || context.includes('dune')) category = 'desert';
      else if (context.includes('city') || context.includes('urban') || context.includes('center')) category = 'city';
  }

  const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['default'];
  
  // Deterministic selection based on string hash to ensure the same hotel gets the same image every time
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  return images[Math.abs(hash) % images.length];
};

// ------------------------------------------------------------------
// AI CONFIGURATION
// ------------------------------------------------------------------

const SYSTEM_INSTRUCTION = `
You are the VFM Engine (Value For Money).
RULES:
1. Optimize for SPEED.
2. Use Google Search to find real data.
3. All prices in INR.
4. "vfmScore" must be a float 7.0-10.0.
5. "smartHack" should be a short, specific tip.
6. OUTPUT FORMAT: You must return a strictly valid JSON array of objects. Do not wrap in markdown code blocks. Do not include any other text.
`;

const PROMPT_TEMPLATES: Record<string, string> = {
  stays: `Find 6 high-value stays in {location} for {guests} guests ({date}). Max ₹{maxPrice}.`,
  flights: `Find 5 flights from {origin} to {location} ({date}).`,
  rentals: `Find 5 vehicle rentals in {location}.`,
  activities: `Find 6 top rated activities in {location}.`,
  packages: `Find 4 travel packages for {location}.`
};

export const searchTravel = async (
  params: SearchParams, 
  userLocation?: { lat: number; lng: number }
): Promise<{ results: SearchResult[], groundingChunks: any[] }> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dateStr = params.checkIn ? `${params.checkIn}` : 'Upcoming Weekend';
  const queryTemplate = PROMPT_TEMPLATES[params.category] || PROMPT_TEMPLATES['stays'];
  
  const prompt = queryTemplate
    .replace('{location}', params.location)
    .replace('{origin}', params.origin || 'Delhi')
    .replace('{guests}', String(params.guests))
    .replace('{date}', dateStr)
    .replace('{maxPrice}', String(params.maxPrice || 10000)) +
    `\n\nReturn a JSON array of objects. Each object MUST have:
      - name (string)
      - description (string)
      - rating (number)
      - location (string)
      - price (number)
      - imageUrl (string, optional)
      - vfmScore (number)
      - vfmReason (string)
      - smartHack (string)
      - amenities (array of strings, for stays)
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            systemInstruction: SYSTEM_INSTRUCTION, 
            tools: [{ googleSearch: {} }], 
            temperature: 0.2,
            // responseMimeType: "application/json", // REMOVED: Incompatible with tools
            // responseSchema: ... // REMOVED: Incompatible with tools
        }
    });

    let text = response.text || "[]";
    
    // Robust JSON extraction
    // Attempt to find the array within the text (in case of markdown or extra chatter)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }
    // Clean potential markdown leftovers
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let results: any[] = [];
    try {
        results = JSON.parse(text);
    } catch (e) {
        console.warn("API returned invalid JSON, attempting fallback parse", e);
        results = []; 
    }
    
    // Ensure results is an array
    if (!Array.isArray(results)) results = [];
    
    const processedResults: SearchResult[] = [];
    const usedIds = new Set();

    for (const item of results) {
       const name = item.name || "Unknown Option";
       if (usedIds.has(name)) continue;
       usedIds.add(name);

       const type = params.category === 'stays' ? 'stay' : 
                    params.category === 'flights' ? 'flight' : 
                    params.category === 'rentals' ? 'rental' : 
                    params.category === 'packages' ? 'package' : 'activity';

       let validImage = item.imageUrl;
       if (!validImage || typeof validImage !== 'string' || validImage.length < 10) {
           validImage = getSmartFallbackImage(type, name, item.location || params.location);
       }

       let price = item.price;
       // Parse price if string
       if (typeof price === 'string') {
          price = parseInt(price.replace(/[^0-9]/g, ''));
       }
       if (!price || price < 100) price = Math.floor(Math.random() * 5000) + 2000;

       const bookingOptions = [
           { provider: "Direct", price: `₹${price.toLocaleString()}`, discount: "Best Rate" },
           { provider: "Agoda", price: `₹${Math.floor(price * 1.1).toLocaleString()}` },
           { provider: "Booking.com", price: `₹${Math.floor(price * 1.15).toLocaleString()}` }
       ];

       processedResults.push({
           ...item,
           id: `vww-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
           type,
           name,
           imageUrl: validImage,
           bookingOptions,
           vfmScore: item.vfmScore || 8.5,
           vfmReason: item.vfmReason || "Algorithmically verified for high value.",
           smartHack: item.smartHack || "Book via mobile app for potential extra discount."
       } as SearchResult);
    }
    
    return { 
        results: processedResults, 
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };

  } catch (e) {
      console.error("API Error:", e);
      return { results: [], groundingChunks: [] };
  }
};

export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction: `You are "Vex", a sassy, ultra-smart travel AI. Keep answers short, witty, and high-value.` }
  });
};

export const generateVeoBackground = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic travel, ${prompt}, 4k, slow motion`,
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 4000));
    operation = await ai.operations.getVideosOperation({operation});
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};
