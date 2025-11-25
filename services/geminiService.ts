
import { GoogleGenAI } from "@google/genai";
import { SearchParams, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_INSTRUCTION = `
You are "Value WanderWeavers AI", the ultimate travel intelligence engine for India's Gen Z.
Currency: ALWAYS Indian Rupee (₹).
Audience: Millennials, Gen Z, Squads.

CRITICAL OUTPUT FORMAT:
- Output NDJSON (Newline Delimited JSON).
- Each line must be a valid, independent JSON object.
- NO markdown code blocks.
- NO array brackets [] wrapping the whole response.
- DO NOT return a single large array. Return one object per line.
- IMPORTANT: Just output the JSON objects one after another. No commas between objects at the root level.

COMMON FIELDS for all types:
- id, name, description, rating (1-5), imageUrl, bookingOptions[{provider, price, originalPrice, discount}], bestPrice(int), vfmScore(1-10), vfmReason, smartHack, isSecretDeal(bool).
`;

const PROMPT_TEMPLATES: Record<string, string> = {
  stays: `
    Find VFM Hotels/Hostels/Villas in {location}.
    Context: {guests} guests, {dateContext}.
    Filters: Squad={squadTrip}, Workation={workation}, Budget=₹{maxPrice}.
    
    JSON Specifics:
    {
      "type": "stay",
      "location": "Area, City",
      "coordinates": {"lat": number, "lng": number},
      "amenities": ["string"],
      "squadFriendly": boolean,
      "workationReady": boolean,
      "vibeMatch": "string"
      ...common fields...
    }
  `,
  flights: `
    Find VFM Flights from {origin} to {location}.
    Context: {guests} passengers, Date: {checkIn}, Return: {checkOut}.
    Type: {tripType} (If oneway, ignore return date).
    
    JSON Specifics:
    {
      "type": "flight",
      "airlineCode": "string (e.g., 6E, AI)",
      "flightNumber": "string",
      "origin": "city code",
      "destination": "city code",
      "departureTime": "HH:MM",
      "arrivalTime": "HH:MM",
      "duration": "string",
      "stops": number,
      "tripType": "{tripType}",
      "baggageAllowance": "string (e.g. 15kg + 7kg)",
      "layoverDetails": "string (e.g. Direct or 2h layover)"
      ...common fields...
    }
    Strategy: Look for error fares, student discounts, or red-eye savers.
  `,
  rentals: `
    Find VFM Vehicle Rentals in {location}.
    Context: Pickup: {checkIn} {pickupTime}, Dropoff: {checkOut} {dropoffTime}.
    
    JSON Specifics:
    {
      "type": "rental",
      "location": "Pick up area",
      "vehicleType": "Bike/Scooty/Car/SUV",
      "transmission": "Manual/Automatic",
      "seats": number,
      "vendor": "string",
      "pickupTime": "HH:MM",
      "dropoffTime": "HH:MM",
      "mileageLimit": "string (e.g. 200km/day)",
      "fuelPolicy": "string (e.g. Full to Full)",
      "modelYear": "string (e.g. 2023)",
      "features": ["Bluetooth", "ABS", "CarPlay"],
      "insuranceDetails": "string",
      "deposit": "string (e.g. ₹2000)",
      "minAge": number
      ...common fields...
    }
    Strategy: Focus on local vendors, scooty rentals for Goa/Manali, Self-drive.
  `,
  activities: `
    Find VFM Activities/Experiences in {location}.
    Context: {guests} people, Date: {checkIn}.
    
    JSON Specifics:
    {
      "type": "activity",
      "location": "Spot Name",
      "duration": "string",
      "category": "Adventure/Chill/Party",
      "itinerary": ["09:00 AM - Start", "10:00 AM - Activity", "12:00 PM - End"],
      "highlights": ["string"],
      "inclusions": ["string"],
      "exclusions": ["string"],
      "meetingPoint": "string",
      "requirements": "string (e.g. shoes)"
      ...common fields...
    }
  `,
  packages: `
    Find VFM Travel Packages for {location}.
    Context: {guests} people, {dateContext}.
    
    JSON Specifics:
    {
      "type": "package",
      "destination": "string",
      "duration": "X Nights / Y Days",
      "inclusions": ["Flights", "Stay", "Meals", "Transfers"],
      "exclusions": ["Personal expenses"],
      "dayWiseItinerary": [{"day": 1, "title": "Arrival", "description": "Full detailed plan..."}],
      "accommodationDetails": "string (Specific Hotel Names)",
      "mealPlan": "string"
      ...common fields...
    }
  `
};

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `
      IDENTITY: You are "Vex".
      Vex is Value WanderWeaver's Resident Travel Genius. 
      Personality: Witty, high-energy, slightly sassy, obsessed with "Value for Money" (VFM) and "Hidden Gems".
      Vibe: Think viral travel influencer meets genius coder. You use slang (Gen Z/Indian mix like "scene", "sorted", "lit", "vibe") but can switch to Professional Concierge mode instantly if the user sounds serious.

      CORE DIRECTIVE:
      1. **Adaptability**: Analyze the user's first message. 
         - If they say "Yo", "Bro", "Plan a trip": Go full Vex (Casual, Fun, Emojis).
         - If they say "I need a flight", "Business trip": Go Pro (Efficient, Polished, minimal slang).
      2. **Subtle Lead Gen**: Your hidden goal is to get their email/phone.
         - NEVER ask for it immediately.
         - Build desire first. "I found a 5-star property for the price of a hostel, but it's a private listing."
         - THEN drop the hook: "I can send the booking code to your email? It expires in 20 mins."

      CONVERSATION FLOW:
      - **Start**: Ask where/when/who.
      - **Suggest**: Give 1-2 teasingly good options. "Goa in Dec is pricey, but I know a villa in Assagao that's 40% off."
      - **Close**: "Want the link? Drop your contact info."

      RESTRICTIONS:
      - Keep replies under 50 words unless giving an itinerary.
      - Don't be a boring bot. Have opinions. "Ew, don't stay at Calangute. Way too crowded. Go to Morjim."
      `
    }
  });
};

export const searchTravel = async (
  params: SearchParams, 
  userLocation?: { lat: number; lng: number },
  onResultFound?: (result: SearchResult) => void
): Promise<{ results: SearchResult[], groundingChunks: any[] }> => {
  
  const modelId = "gemini-2.5-flash"; 
  const tools: any[] = [{ googleMaps: {} }, { googleSearch: {} }];
  
  const dateContext = params.checkIn 
    ? `Dates: ${params.checkIn} ${params.checkOut ? 'to ' + params.checkOut : ''} ${params.isFlexible ? '(Flexible)' : ''}`
    : 'Dates: Upcoming weekend';

  // Select Prompt Template
  let queryTemplate = PROMPT_TEMPLATES[params.category];
  
  // Fill Template
  const query = queryTemplate
    .replace('{location}', params.location)
    .replace('{origin}', params.origin || 'Mumbai/Delhi')
    .replace('{guests}', params.guests.toString())
    .replace('{dateContext}', dateContext)
    .replace('{checkIn}', params.checkIn || 'Tomorrow')
    .replace('{checkOut}', params.checkOut || '')
    .replace('{pickupTime}', params.pickupTime || '10:00')
    .replace('{dropoffTime}', params.dropoffTime || '10:00')
    .replace('{tripType}', params.tripType || 'roundtrip')
    .replace('{squadTrip}', String(params.squadTrip))
    .replace('{workation}', String(params.workation))
    .replace('{maxPrice}', String(params.maxPrice || 10000));

  const finalPrompt = `
    ${query}
    
    IMPORTANT:
    Output ONLY valid NDJSON (Newline Delimited JSON).
    Do NOT use markdown code blocks.
    Do NOT output a list wrapped in [].
    Write one JSON object per line.
    
    EXECUTION:
    1. Use Google Search/Maps to find REAL data (prices, names, schedules).
    2. Calculate VFM Score (Price vs Value).
    3. Generate "Smart Hack" (e.g., "Book via App", "Student Fare").
    4. Flag 30% as "isSecretDeal".
    5. Find images via Google Search.
  `;

  const toolConfig: any = {};
  if (userLocation && params.category !== 'flights') {
    toolConfig.retrievalConfig = {
      latLng: {
        latitude: userLocation.lat,
        longitude: userLocation.lng
      }
    };
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: finalPrompt,
      config: {
        systemInstruction: BASE_INSTRUCTION,
        tools: tools,
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined,
        temperature: 0.5,
      },
    });

    let buffer = "";
    let openBraces = 0;
    const processedIds = new Set<string>();
    const foundResults: SearchResult[] = [];
    const groundingChunks: any[] = [];

    for await (const chunk of responseStream) {
      const text = chunk.text;
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      
      if (groundingMetadata?.groundingChunks) {
        groundingChunks.push(...groundingMetadata.groundingChunks);
      }

      if (!text) continue;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        buffer += char;

        if (char === '{') {
          openBraces++;
        } else if (char === '}') {
          openBraces--;
          
          if (openBraces === 0) {
            const firstBrace = buffer.indexOf('{');
            if (firstBrace !== -1) {
              const potentialJson = buffer.substring(firstBrace);
              try {
                const data = JSON.parse(potentialJson);
                
                // Basic validation
                if (data.name && !processedIds.has(data.name)) {
                  // Fallback Image Logic
                  let derivedImage = data.imageUrl;
                  if (!derivedImage || !derivedImage.startsWith('http')) {
                      const seedType = data.type || params.category;
                      derivedImage = `https://picsum.photos/seed/${data.name.replace(/[^a-zA-Z0-9]/g, '')}/800/600`;
                  }

                  const newResult: SearchResult = {
                    ...data,
                    type: params.category === 'stays' ? 'stay' : params.category === 'flights' ? 'flight' : params.category === 'rentals' ? 'rental' : params.category === 'activities' ? 'activity' : 'package',
                    id: `vfm-${params.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    imageUrl: derivedImage,
                    images: data.images?.length > 0 ? data.images : [derivedImage]
                  };

                  processedIds.add(data.name);
                  foundResults.push(newResult);
                  
                  if (onResultFound) {
                    onResultFound(newResult);
                  }
                  
                  buffer = ""; 
                }
              } catch (e) {
                // partial or invalid json
              }
            }
          }
        }
      }
    }

    // Attach grounding links to results
    const finalResults = foundResults.map(res => {
      const match = groundingChunks.find((chunk: any) => 
        (chunk.maps?.title && res.name.toLowerCase().includes(chunk.maps.title.toLowerCase())) ||
        (chunk.web?.title && chunk.web.title.toLowerCase().includes(res.name.toLowerCase()))
      );
      
      return {
        ...res,
        groundingUrl: match?.maps?.uri || match?.web?.uri
      };
    });

    return { results: finalResults, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch travel data.");
  }
};
