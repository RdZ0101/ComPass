"use server";

import { generateItinerary } from '@/ai/flows/itinerary-generation';
import type { GenerateItineraryInput, GenerateItineraryOutput } from '@/ai/flows/itinerary-generation';
import type { ItineraryData } from '@/lib/types';

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
  input: GenerateItineraryInput
): Promise<{ data?: ItineraryData; error?: string }> {
  try {
    const result: GenerateItineraryOutput = await generateItinerary(input);
    if (result.itinerary) {
      const itineraryData: ItineraryData = {
        id: new Date().toISOString(),
        destination: input.destination,
        preferences: input.preferences,
        itinerary: result.itinerary,
        weather: getRandomWeather(),
        createdAt: new Date().toISOString(),
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
