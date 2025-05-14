
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
    throw new Error("Failed to save itinerary.");
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
      // Explicitly structure the object to match ItineraryData, ensuring id is from docSnapshot.id
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        destination: data.destination,
        preferences: data.preferences,
        itinerary: data.itinerary,
        weather: data.weather,
        createdAt: data.createdAt, // Assuming createdAt is stored as ISO string
        crowdType: data.crowdType,
        startDate: data.startDate,
        endDate: data.endDate,
        isDayTrip: data.isDayTrip,
      } as ItineraryData;
    });
  } catch (error) {
    console.error("Error fetching itineraries from Firestore:", error);
    throw new Error("Failed to fetch itineraries.");
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
    throw new Error("Failed to delete itinerary.");
  }
}
