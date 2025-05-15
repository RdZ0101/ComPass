
"use server";

import { generateItinerary } from '@/ai/flows/itinerary-generation';
import type { GenerateItineraryInput as AIItineraryInput, GenerateItineraryOutput } from '@/ai/flows/itinerary-generation'; // Renamed to avoid conflict
import { updateItineraryForUser } from '@/lib/firebase/firestore';
import type { ItineraryData, ItineraryGenerationInput } from '@/lib/types';

const mockWeathers = [
  "Sunny, 28°C. Gentle breeze.",
  "Partly cloudy, 22°C. Chance of rain: 10%.",
  "Cloudy, 19°C. Light showers expected in the evening.",
  "Clear skies, 30°C. Perfect beach weather!",
  "Windy, 20°C. Bring a jacket.",
];

function getRandomWeather(): string {
  return mockWeathers[Math.floor(Math.random() * mockWeathers.length)];
}

export async function runGenerateItineraryAction(
  input: ItineraryGenerationInput // This type comes from @/lib/types
): Promise<{ data?: ItineraryData; error?: string }> {
  try {
    // The AI flow expects AIItineraryInput which matches structure but might have different Zod specifics
    const aiInput: AIItineraryInput = {
      destination: input.destination,
      preferences: input.preferences,
      crowdType: input.crowdType,
      startDate: input.startDate,
      endDate: input.isDayTrip ? undefined : input.endDate, // Ensure endDate is undefined for day trips for the AI
      isDayTrip: input.isDayTrip,
    };

    const result: GenerateItineraryOutput = await generateItinerary(aiInput);
    
    if (result.itinerary) {
      const itineraryData: ItineraryData = {
        id: new Date().toISOString(),
        destination: input.destination,
        preferences: input.preferences,
        itinerary: result.itinerary,
        weather: getRandomWeather(),
        createdAt: new Date().toISOString(),
        crowdType: input.crowdType,
        startDate: input.startDate,
        endDate: input.isDayTrip ? undefined : input.endDate,
        isDayTrip: input.isDayTrip,
      };
      return { data: itineraryData };
    }
    return { error: "Failed to generate itinerary content." };
  } catch (e) {
    console.error("Error generating itinerary:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during itinerary generation.";
    return { error: errorMessage };
  }
}

export async function updateItineraryAction(userId: string, itineraryId: string, updatedItineraryData: Partial<ItineraryData>): Promise<{ success: boolean; error?: string }> {
  try {
    await updateItineraryForUser(userId, itineraryId, updatedItineraryData);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred while updating the itinerary." };
  }
}
