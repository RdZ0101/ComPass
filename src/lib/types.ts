
export type CrowdType = "solo" | "couple" | "family" | "friends" | "business";

export interface ItineraryData {
  id: string;
  destination: string;
  preferences: string;
  itinerary: string;
  weather: string;
  createdAt: string;
  crowdType: CrowdType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isDayTrip: boolean;
}

export interface ItineraryGenerationInput {
  destination: string;
  preferences: string;
  crowdType: CrowdType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isDayTrip: boolean;
}
