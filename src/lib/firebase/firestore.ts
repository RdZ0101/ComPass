
// src/lib/firebase/firestore.ts
'use server'; // Can be used by server actions if needed, but these are client-callable

import { db } from './config';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import type { ItineraryData } from '@/lib/types';

/**
 * Saves an itinerary for a specific user to Firestore.
 * Uses the itinerary.id as the document ID.
 */
export async function saveItineraryForUser(userId: string, itinerary: ItineraryData): Promise<void> {
  try {
    const itineraryDocRef = doc(db, 'users', userId, 'itineraries', itinerary.id);
    await setDoc(itineraryDocRef, itinerary);
  } catch (error) {
    console.error("Error saving itinerary to Firestore:", error);
    const specificMessage = error instanceof Error ? error.message : "Unknown Firestore error occurred while saving.";
    throw new Error(`Failed to save itinerary: ${specificMessage}`);
  }
}

/**
 * Fetches all itineraries for a specific user from Firestore, ordered by creation date (newest first).
 */
export async function getUserItineraries(userId: string): Promise<ItineraryData[]> {
  try {
    const itinerariesCol = collection(db, 'users', userId, 'itineraries');
    const q = query(itinerariesCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        destination: data.destination,
        preferences: data.preferences,
        itinerary: data.itinerary,
        weather: data.weather,
        createdAt: data.createdAt, 
        crowdType: data.crowdType,
        startDate: data.startDate,
        endDate: data.endDate,
        isDayTrip: data.isDayTrip,
      } as ItineraryData;
    });
  } catch (error) {
    console.error("Error fetching itineraries from Firestore:", error);
    // Propagate a more specific error message
    const specificMessage = error instanceof Error ? error.message : "Unknown Firestore error occurred during fetch.";
    throw new Error(`Failed to fetch itineraries. Firestore error: ${specificMessage}`);
  }
}

/**
 * Deletes a specific itinerary for a user from Firestore.
 */
export async function deleteItineraryForUser(userId: string, itineraryId: string): Promise<void> {
  try {
    const itineraryDocRef = doc(db, 'users', userId, 'itineraries', itineraryId);
    await deleteDoc(itineraryDocRef);
  } catch (error) {
    console.error("Error deleting itinerary from Firestore:", error);
    const specificMessage = error instanceof Error ? error.message : "Unknown Firestore error occurred while deleting.";
    throw new Error(`Failed to delete itinerary: ${specificMessage}`);
  }
}
