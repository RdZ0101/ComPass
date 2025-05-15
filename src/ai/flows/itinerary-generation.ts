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
  itinerary: z.string().describe('The generated travel itinerary, formatted as Markdown. Use headings, lists, bold text, etc., to make it readable and engaging.'),
  suggestedLocations: z.array(z.string().describe("A key location, landmark, or address name mentioned in the itinerary that can be plotted on a map. This should be a specific place name or address suitable for geocoding, e.g., 'Eiffel Tower, Paris' or '1600 Amphitheatre Parkway, Mountain View, CA'. Do not include generic terms like 'local markets'.")).min(1).max(10).describe("An array of 1 to 10 key location names or addresses from the itinerary, suitable for plotting on a map."),
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

Provide a detailed itinerary based on this information. **Format the itinerary using Markdown** (e.g., using # for headings, - or * for bullet points, **bold text** for emphasis). Ensure the output is engaging, practical, and well-structured.

After the itinerary, list up to 10 key locations, landmarks, or specific addresses mentioned in the itinerary that would be suitable for plotting on a map. These locations should be specific and geocodable (e.g., "Louvre Museum, Paris", "Golden Gate Bridge, San Francisco", "221B Baker Street, London"). Do not include generic terms like "a local restaurant" or "the beach".

Itinerary:
[Generate the Markdown itinerary here]

Suggested Locations for Map:
[List the suggested locations here, one per line, to be extracted into the suggestedLocations array output field. Ensure these are specific and geocodable.]
`,
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