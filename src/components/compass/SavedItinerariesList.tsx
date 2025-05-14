"use client";

import type { ItineraryData } from "@/lib/types";
import { ItineraryCard } from "./ItineraryCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedItinerariesListProps {
  savedItineraries: ItineraryData[];
  onRemove: (id: string) => void;
}

export function SavedItinerariesList({ savedItineraries, onRemove }: SavedItinerariesListProps) {
  if (savedItineraries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You have no saved itineraries yet.</p>
        <p className="text-sm text-muted-foreground">Start planning and save your favorite trips!</p>
      </div>
    );
  }

  // Sort by newest first
  const sortedItineraries = [...savedItineraries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* For larger screens, use columns. For smaller, stack them. */}
      <div className="md:columns-2 lg:columns-3 gap-6 space-y-6">
        {sortedItineraries.map((itinerary) => (
          <ItineraryCard
            key={itinerary.id}
            itineraryData={itinerary}
            onRemove={onRemove}
            isSaved={true}
          />
        ))}
      </div>
    </div>
  );
}
