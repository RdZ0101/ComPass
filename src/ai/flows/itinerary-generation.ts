
// use server'

/**
 * @fileOverview Generates a personalized travel itinerary based on the destination and preferences.
 *
 * - generateItinerary - A function that generates a travel itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CrowdType } from '@/lib/types';

const GenerateItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the travel itinerary.'),
  preferences: z.string().describe('The user preferences for the travel itinerary, e.g., interests, budget, travel style.'),
  crowdType: z.string().describe("The type of crowd traveling (e.g., solo, couple, family, friends, business).") as z.ZodType<CrowdType>,
  isDayTrip: z.boolean().describe("Whether the trip is a single day trip."),
  startDate: z.string().describe("The start date of the trip in YYYY-MM-DD format."),
  endDate: z.string().optional().describe("The end date of the trip in YYYY-MM-DD format. This will be absent if it's a day trip or if isDayTrip is true."),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const generateItineraryPrompt = ai.definePrompt({
  name: 'generateItineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `You are a travel expert. Generate a personalized travel itinerary.

Destination: {{{destination}}}
Traveler Profile Details:
- Crowd Type: {{crowdType}} (Interpret 'family' as including children. For other types, phrase naturally, e.g., 'a solo traveler' or 'a couple').
Trip Duration:
{{#if isDayTrip}}
This is a day trip on {{startDate}}.
{{else}}
The trip is from {{startDate}} to {{endDate}}.
{{/if}}
User Preferences: {{{preferences}}}

Provide a detailed itinerary based on this information. Ensure the output is engaging and practical.
Itinerary:`,
});

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async input => {
    const {output} = await generateItineraryPrompt(input);
    return output!;
  }
);

