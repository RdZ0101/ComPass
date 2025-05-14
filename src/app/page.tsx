
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/compass/Header";
import { ItineraryForm } from "@/components/compass/ItineraryForm";
import { ItineraryCard } from "@/components/compass/ItineraryCard";
import { SavedItinerariesList } from "@/components/compass/SavedItinerariesList";
import { LoadingSpinner } from "@/components/compass/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { runGenerateItineraryAction } from "./actions";
import type { ItineraryData, ItineraryGenerationInput } from "@/lib/types";
import { BookHeart, History, AlertCircle, Loader2, DatabaseBackup } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { getUserItineraries, saveItineraryForUser, deleteItineraryForUser } from "@/lib/firebase/firestore";

export default function HomePage() {
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryData | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false); // Renamed to avoid conflict
  const [apiError, setApiError] = useState<string | null>(null); // Renamed
  
  const { user, isLoading: isLoadingUser } = useAuth();
  const [savedItineraries, setSavedItineraries] = useState<ItineraryData[]>([]);
  const [isFetchingItineraries, setIsFetchingItineraries] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // For localStorage dependent components, still useful for general hydration
  }, []);

  useEffect(() => {
    if (user && !isLoadingUser) {
      const fetchItineraries = async () => {
        setIsFetchingItineraries(true);
        setFirestoreError(null);
        try {
          const itineraries = await getUserItineraries(user.uid);
          setSavedItineraries(itineraries);
        } catch (err) {
          console.error("Error fetching itineraries:", err);
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
          setFirestoreError(`Failed to load saved itineraries: ${errorMessage}`);
          toast({ variant: "destructive", title: "Loading Error", description: `Could not fetch your itineraries. ${errorMessage}` });
        } finally {
          setIsFetchingItineraries(false);
        }
      };
      fetchItineraries();
    } else if (!user && !isLoadingUser) {
      setSavedItineraries([]); // Clear itineraries if user logs out or isn't loaded
      setIsFetchingItineraries(false); // No fetching if no user
    }
  }, [user, isLoadingUser, toast]);

  const handleGenerateItinerary = async (values: ItineraryGenerationInput) => {
    setIsLoadingApi(true);
    setApiError(null);
    setGeneratedItinerary(null);

    const result = await runGenerateItineraryAction(values);

    setIsLoadingApi(false);
    if (result.data) {
      setGeneratedItinerary(result.data);
    } else if (result.error) {
      setApiError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }
  };

  const handleSaveItinerary = async (itineraryToSave: ItineraryData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to save itineraries.",
      });
      return;
    }
    if (savedItineraries.find(item => item.id === itineraryToSave.id)) {
       toast({
        title: "Already Saved",
        description: "This itinerary is already in your favorites.",
      });
      return;
    }
    try {
      await saveItineraryForUser(user.uid, itineraryToSave);
      // Optimistically update UI: add to the beginning as list is sorted by newest
      setSavedItineraries(prev => [itineraryToSave, ...prev]);
      toast({
        title: "Itinerary Saved!",
        description: `${itineraryToSave.destination} has been saved to your account.`,
        className: "bg-accent text-accent-foreground border-green-500",
      });
    } catch (error) {
      console.error("Error saving itinerary to Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: `Could not save itinerary: ${errorMessage}`,
      });
    }
  };

  const handleRemoveItinerary = async (id: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to remove itineraries.",
      });
      return;
    }
    try {
      await deleteItineraryForUser(user.uid, id);
      // Optimistically update UI
      setSavedItineraries(prev => prev.filter((item) => item.id !== id));
      toast({
        title: "Itinerary Removed",
        description: "The itinerary has been removed from your account.",
      });
    } catch (error) {
      console.error("Error removing itinerary from Firestore:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Remove Failed",
        description: `Could not remove itinerary: ${errorMessage}`,
      });
    }
  };

  const isItinerarySaved = (itineraryId: string): boolean => {
    if (!hasMounted || !user) return false; 
    return savedItineraries.some(saved => saved.id === itineraryId);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <ItineraryForm onSubmit={handleGenerateItinerary} isLoading={isLoadingApi} />

        {isLoadingApi && <LoadingSpinner />}

        {apiError && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Generating Itinerary</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {generatedItinerary && !isLoadingApi && (
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

        {!isLoadingApi && !generatedItinerary && !apiError && hasMounted && (
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
          {(isLoadingUser || (user && isFetchingItineraries)) && ( // Show loading if user is loading OR if user exists and itineraries are fetching
            <div className="flex flex-col items-center justify-center space-y-2 py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading saved itineraries...</p>
            </div>
          )}

          {!isLoadingUser && !user && hasMounted && (
             <div className="text-center py-10 text-muted-foreground bg-secondary/50 p-6 rounded-lg shadow">
              <DatabaseBackup className="mx-auto h-12 w-12 mb-4 text-primary opacity-70" />
              <p className="text-lg font-medium">Sign in to see your saved trips!</p>
              <p className="text-sm">Your personalized itineraries will appear here once you're logged in.</p>
            </div>
          )}

          {firestoreError && !isFetchingItineraries && (
            <Alert variant="destructive" className="shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error Loading Saved Itineraries</AlertTitle>
              <AlertDescription>{firestoreError}</AlertDescription>
            </Alert>
          )}
          
          {!isFetchingItineraries && !firestoreError && user && hasMounted && (
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
