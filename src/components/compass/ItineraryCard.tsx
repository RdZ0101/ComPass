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
import { Heart, Trash2, ThermometerSnowflake, CloudSun, MapPin, CalendarDays, Edit3 } from 'lucide-react';
import type { ItineraryData } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';


interface ItineraryCardProps {
  itineraryData: ItineraryData;
  onSave?: (itinerary: ItineraryData) => void;
  onRemove?: (id: string) => void;
  isSaved?: boolean;
}

export function ItineraryCard({ itineraryData, onSave, onRemove, isSaved }: ItineraryCardProps) {
  const { id, destination, preferences, itinerary, weather, createdAt } = itineraryData;

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="shadow-lg break-inside-avoid-column">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-accent" /> {destination}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> Created {formattedDate}
            </CardDescription>
          </div>
          {weather.toLowerCase().includes("sun") || weather.toLowerCase().includes("clear") ? <CloudSun className="h-8 w-8 text-yellow-500" /> : <ThermometerSnowflake className="h-8 w-8 text-blue-400" />}
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
        {onRemove && (
          <Button variant="ghost" onClick={() => onRemove(id)} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
