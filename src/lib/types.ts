export type CrowdType = "solo" | "couple" | "family" | "friends" | "business";

interface Activity {
  time: string;
  description: string;
  location?: string;
  coords?: {
    lat: number;
    lng: number;
  };
}

interface DailyItinerary {
  day: number;
  date: string;
  activities: Activity[];
}

export interface ItineraryData {
  id: string;
  destination: string;
  preferences: string;
  itinerary: string;
  weather: string;
  createdAt: string; // Or Date if you prefer Date objects
  crowdType: CrowdType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isDayTrip: boolean;
  suggestedLocations?: string[]; // Added for map integration
}

export interface ItineraryGenerationInput {
  destination: string;
  preferences: string;
  crowdType: CrowdType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isDayTrip: boolean;
}