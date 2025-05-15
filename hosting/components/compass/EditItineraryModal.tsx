
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ItineraryData } from "@/lib/types";
import { ScrollArea } from '../ui/scroll-area';

interface EditItineraryModalProps {
  isOpen: boolean;
  itineraryToEdit: ItineraryData | null;
  onSave: (updatedItinerary: ItineraryData) => void;
  onCancel: () => void;
}

export function EditItineraryModal({ isOpen, itineraryToEdit, onSave, onCancel }: EditItineraryModalProps) {
  const [editedContent, setEditedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (itineraryToEdit) {
      setEditedContent(itineraryToEdit.itinerary);
    } else {
      setEditedContent(""); // Reset if no itinerary is being edited
    }
  }, [itineraryToEdit]);

  const handleSave = async () => {
    if (!itineraryToEdit) return;
    setIsSaving(true);
    // Create a new object with the updated itinerary content
    const updatedItinerary: ItineraryData = {
      ...itineraryToEdit,
      itinerary: editedContent,
    };
    await onSave(updatedItinerary);
    setIsSaving(false);
  };

  if (!itineraryToEdit) {
    return null; // Don't render the modal if there's no itinerary to edit
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Itinerary for {itineraryToEdit.destination}</DialogTitle>
          <DialogDescription>
            Make changes to your travel plan below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="itinerary-content" className="text-left">
                Itinerary Details
              </Label>
              <Textarea
                id="itinerary-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px] text-sm"
                placeholder="Describe your planned activities, sights, etc."
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
