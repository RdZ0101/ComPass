
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Trash2, ThermometerSnowflake, CloudSun, MapPin, CalendarDays, Edit3, Users, Sun } from 'lucide-react';
import type { ItineraryData, CrowdType } from "@/lib/types";
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface ItineraryCardProps {
  itineraryData: ItineraryData;
  onSave?: (itinerary: ItineraryData) => void;
  onRemove?: (id: string) => void;
  onEditRequest?: (itinerary: ItineraryData) => void; // Renamed from onUpdate and simplified
  isSaved?: boolean;
}

const crowdTypeLabels: Record<CrowdType, string> = {
  solo: "Solo Traveler",
  couple: "Couple",
  family: "Family",
  friends: "Friends",
  business: "Business Trip",
};

export function ItineraryCard({ itineraryData, onSave, onRemove, onEditRequest, isSaved }: ItineraryCardProps) {
  const {
    id, 
    destination, 
    preferences: rawPreferences, 
    itinerary: rawItinerary, 
    weather: rawWeather, 
    createdAt: rawCreatedAt, 
    crowdType: rawCrowdType, 
    startDate: rawStartDate, 
    endDate: rawEndDate, 
    isDayTrip: rawIsDayTrip 
  } = itineraryData; 

  const preferences = rawPreferences ?? "Preferences not specified.";
  const itinerary = rawItinerary ?? "Itinerary details not available.";
  const weather = rawWeather ?? "Weather data unavailable.";
  const createdAt = rawCreatedAt ? formatDistanceToNow(new Date(rawCreatedAt), { addSuffix: true }) : "Recently created";
  const crowdType = rawCrowdType ?? 'solo'; 
  const isDayTrip = rawIsDayTrip ?? false; 

  const parseAndFormatDate = (dateStr: string | undefined, defaultText: string = "Date not set"): string => {
    if (!dateStr) {
      return defaultText;
    }
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch (error) {
      console.warn(`Error parsing date for itinerary ${id}:`, dateStr, error);
      return "Invalid Date";
    }
  };

  const formattedStartDate = parseAndFormatDate(rawStartDate);
  const formattedEndDate = rawEndDate ? parseAndFormatDate(rawEndDate, "") : ""; 

  let tripDurationString = "Trip dates not specified";
  if (formattedStartDate !== "Date not set" && formattedStartDate !== "Invalid Date") {
    if (isDayTrip) {
      tripDurationString = `Day trip on ${formattedStartDate}`;
    } else {
      if (formattedEndDate && formattedEndDate !== "Invalid Date") {
        tripDurationString = `From ${formattedStartDate} to ${formattedEndDate}`;
      } else {
        tripDurationString = `Trip starting ${formattedStartDate}`;
      }
    }
  } else if (isDayTrip) { 
    tripDurationString = "Day trip (date not set)";
  }

  const currentCrowdLabel = crowdTypeLabels[crowdType as CrowdType] || crowdTypeLabels.solo;

  return (
    <Card className="shadow-lg break-inside-avoid-column">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-accent" /> {destination || "Unknown Destination"}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
              <span className="flex items-center"><CalendarDays className="mr-1 h-4 w-4" /> {tripDurationString}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center"><Users className="mr-1 h-4 w-4" /> {currentCrowdLabel}</span>
            </CardDescription>
            <CardDescription className="mt-1 text-xs">
              Created {createdAt}
            </CardDescription>
          </div>
          {isDayTrip && <Sun className="h-8 w-8 text-orange-500" />}
          {!isDayTrip && weather && weather !== "Weather data unavailable" && (weather.toLowerCase().includes("sun") || weather.toLowerCase().includes("clear") ? <CloudSun className="h-8 w-8 text-yellow-500" /> : <ThermometerSnowflake className="h-8 w-8 text-blue-400" />)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center mb-1">
              <Edit3 className="mr-2 h-5 w-5 text-muted-foreground" /> Preferences
            </h3>
            <p className="text-sm text-muted-foreground italic bg-secondary p-3 rounded-md">{preferences}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-1">Your Itinerary</h3>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap p-3 border rounded-md bg-card">
              {itinerary}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-1">Weather Outlook</h3>
            <Badge variant="outline" className="text-sm py-1 px-3">{weather}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onSave && !isSaved && (
          <Button variant="outline" onClick={() => onSave(itineraryData)} className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Heart className="mr-2 h-4 w-4" /> Save
          </Button>
        )}
        {isSaved && (
           <Badge variant="secondary" className="text-green-600 border-green-300">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Saved
          </Badge>
        )}
        {onEditRequest && (
          <Button variant="ghost" onClick={() => onEditRequest(itineraryData)} className="text-primary hover:bg-primary/10">
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
        {onRemove && (
          <Button variant="ghost" onClick={() => onRemove(id)} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
