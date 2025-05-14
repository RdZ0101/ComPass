
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/compass/Header";
import { ItineraryForm } from "@/components/compass/ItineraryForm";
import { ItineraryCard } from "@/components/compass/ItineraryCard";
import { SavedItinerariesList } from "@/components/compass/SavedItinerariesList";
import { LoadingSpinner } from "@/components/compass/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Button removed as it's not directly used on this page anymore
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";
import { runGenerateItineraryAction } from "./actions";
import type { ItineraryData, ItineraryGenerationInput } from "@/lib/types"; // ItineraryGenerationInput type is now more detailed
import { BookHeart, History, AlertCircle, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";


export default function HomePage() {
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedItineraries, setSavedItineraries] = useLocalStorage<ItineraryData[]>("compass-saved-itineraries", []);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleGenerateItinerary = async (values: ItineraryGenerationInput) => {
    setIsLoading(true);
    setError(null);
    setGeneratedItinerary(null);

    // Values already include all new fields (crowdType, startDate, endDate, isDayTrip)
    // and dates are pre-formatted to YYYY-MM-DD strings by ItineraryForm
    const result = await runGenerateItineraryAction(values);

    setIsLoading(false);
    if (result.data) {
      setGeneratedItinerary(result.data);
    } else if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }
  };

  const handleSaveItinerary = (itineraryToSave: ItineraryData) => {
    if (savedItineraries.find(item => item.id === itineraryToSave.id)) {
       toast({
        title: "Already Saved",
        description: "This itinerary is already in your favorites.",
      });
      return;
    }
    setSavedItineraries([...savedItineraries, itineraryToSave]);
    toast({
      title: "Itinerary Saved!",
      description: `${itineraryToSave.destination} has been added to your favorites.`,
      className: "bg-accent text-accent-foreground border-green-500",
    });
  };

  const handleRemoveItinerary = (id: string) => {
    setSavedItineraries(savedItineraries.filter((item) => item.id !== id));
     toast({
      title: "Itinerary Removed",
      description: "The itinerary has been removed from your favorites.",
    });
  };

  const isItinerarySaved = (itineraryId: string): boolean => {
    if (!hasMounted) return false; 
    return savedItineraries.some(saved => saved.id === itineraryId);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <ItineraryForm onSubmit={handleGenerateItinerary} isLoading={isLoading} />

        {isLoading && <LoadingSpinner />}

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Generating Itinerary</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedItinerary && !isLoading && (
          <section aria-labelledby="generated-itinerary-title">
            <div className="flex items-center justify-between mb-4">
              <h2 id="generated-itinerary-title" className="text-2xl font-semibold text-primary flex items-center">
                <BookHeart className="mr-3 h-7 w-7" /> Your Generated Itinerary
              </h2>
            </div>
            <ItineraryCard
              itineraryData={generatedItinerary}
              onSave={handleSaveItinerary}
              isSaved={isItinerarySaved(generatedItinerary.id)}
            />
          </section>
        )}

        {!isLoading && !generatedItinerary && !error && hasMounted && (
           <div className="text-center py-10 text-muted-foreground">
            <BookHeart className="mx-auto h-12 w-12 mb-4 text-primary opacity-50" />
            <p className="text-lg">Ready to plan your next adventure?</p>
            <p>Fill out the form above to generate your personalized itinerary!</p>
          </div>
        )}


        <Separator className="my-8" />

        <section aria-labelledby="saved-itineraries-title">
          <h2 id="saved-itineraries-title" className="text-2xl font-semibold text-primary mb-6 flex items-center">
            <History className="mr-3 h-7 w-7" /> Saved Itineraries
          </h2>
          {!hasMounted && (
            <div className="flex flex-col items-center justify-center space-y-2 py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading saved itineraries...</p>
            </div>
          )}
          {hasMounted && (
            <SavedItinerariesList
              savedItineraries={savedItineraries}
              onRemove={handleRemoveItinerary}
            />
          )}
        </section>
      </main>
      <footer className="text-center py-6 border-t bg-card">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ComPass. Your AI companion for unforgettable journeys.
        </p>
      </footer>
      <Toaster />
    </div>
  );
}
