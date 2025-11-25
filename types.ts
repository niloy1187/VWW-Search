
export type SearchCategory = 'stays' | 'flights' | 'rentals' | 'activities' | 'packages';

export interface BookingOption {
  provider: string;
  price: string; // e.g. "₹4,500"
  originalPrice?: string; // For strikethrough "₹6,000"
  discount?: string; // "25% OFF"
}

export interface BaseResult {
  id: string;
  name: string; // Hotel Name, Airline, Car Model, Package Title
  description: string;
  rating: number;
  imageUrl?: string;
  groundingUrl?: string;
  bookingOptions: BookingOption[];
  bestPrice?: number;
  
  // VFM Specifics
  vfmScore: number;
  vfmReason: string;
  smartHack?: string;
  isSecretDeal?: boolean;
}

export interface Hotel extends BaseResult {
  type: 'stay';
  location: string;
  coordinates?: { lat: number; lng: number };
  amenities: string[];
  reviewsSummary: string;
  images?: string[];
  squadFriendly: boolean;
  workationReady: boolean;
  vibeMatch?: string;
}

export interface Flight extends BaseResult {
  type: 'flight';
  airlineCode: string; // e.g., "6E" for Indigo
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number; // 0 for direct
  tripType: 'oneway' | 'roundtrip';
  baggageAllowance?: string; // "15kg Check-in"
  layoverDetails?: string; // "2h layover in BOM"
}

export interface Rental extends BaseResult {
  type: 'rental';
  location: string;
  vehicleType: string; // SUV, Sedan, Bike
  transmission: 'Automatic' | 'Manual';
  seats: number;
  vendor: string;
  
  // Deep Details
  pickupTime?: string;
  dropoffTime?: string;
  mileageLimit?: string; // e.g., "Unlimited" or "300km/day"
  fuelPolicy?: string; // "Full to Full"
  modelYear?: string; // "2023 Model"
  features?: string[]; // ["Bluetooth", "CarPlay", "Sunroof"]
  insuranceDetails?: string; // e.g., "Basic Coverage"
  minAge?: number;
  deposit?: string; // e.g. "₹5000"
}

export interface Activity extends BaseResult {
  type: 'activity';
  location: string;
  duration: string; // "3 Hours"
  category: string; // "Adventure", "Food"
  
  // Lightbox Details
  itinerary?: string[]; // Steps of the activity
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  meetingPoint?: string;
  images?: string[];
  requirements?: string; // "Wear comfortable shoes"
}

export interface TravelPackage extends BaseResult {
  type: 'package';
  destination: string;
  duration: string; // "3 Nights / 4 Days"
  inclusions: string[]; // ["Flights", "Stay", "Breakfast"]
  exclusions?: string[];
  
  // Lightbox Details
  dayWiseItinerary?: { day: number; title: string; description: string }[];
  accommodationDetails?: string; // "3 Star Hotel in North Goa"
  mealPlan?: string; // "MAP (Breakfast + Dinner)"
  images?: string[];
}

export type SearchResult = Hotel | Flight | Rental | Activity | TravelPackage;

export interface SearchParams {
  category: SearchCategory;
  location: string; // Destination for most, Pick-up for rentals
  origin?: string; // For flights
  
  // Dates & Times
  checkIn?: string; // Date
  checkOut?: string; // Return Date
  pickupTime?: string; // Rentals
  dropoffTime?: string; // Rentals
  isFlexible?: boolean;
  
  // Flight Specific
  tripType?: 'oneway' | 'roundtrip';

  guests: number; // Travelers/Passengers
  minPrice?: number;
  maxPrice?: number;
  
  // Filters
  squadTrip: boolean;
  workation: boolean;
  vibe?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText: string;
      }[];
    };
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: number;
  completed: boolean;
  icon: string;
}

export interface UserStats {
  xp: number;
  level: number;
  badges: string[];
  searches: number;
  streak: number;
  quests: Quest[];
}
