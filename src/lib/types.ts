export interface ItineraryData {
  id: string;
  destination: string;
  preferences: string;
  itinerary: string;
  weather: string;
  createdAt: string;
}

export interface ItineraryGenerationInput {
  destination: string;
  preferences: string;
}
