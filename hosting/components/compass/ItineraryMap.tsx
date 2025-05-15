"use client";

import { GoogleMap, useJsApiLoader, MarkerF as Marker } from '@react-google-maps/api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, MapPin } from 'lucide-react';

interface ItineraryMapProps {
  locations: string[];
  apiKey: string;
  destinationCity: string; // To help center the map initially
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem', // Match card radius
};

interface CustomMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
}

export function ItineraryMap({ locations, apiKey, destinationCity }: ItineraryMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: useMemo(() => ['geocoding'], []),
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [initialCenter, setInitialCenter] = useState<google.maps.LatLngLiteral | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Geocode the destination city to get an initial center for the map
  useEffect(() => {
    if (isLoaded && destinationCity && !initialCenter) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: destinationCity }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setInitialCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          console.warn(`Geocoding error for destination city "${destinationCity}": ${status}`);
          // Fallback center if city geocoding fails (e.g., world center)
          setInitialCenter({ lat: 0, lng: 0 });
        }
      });
    }
  }, [isLoaded, destinationCity, initialCenter]);


  useEffect(() => {
    if (isLoaded && map && locations.length > 0 && initialCenter) {
      const geocoder = new window.google.maps.Geocoder();
      const newMarkers: CustomMarker[] = [];
      const bounds = new window.google.maps.LatLngBounds();
      let geocodePromises = locations.map((location, index) => {
        return new Promise<void>((resolve, reject) => {
          geocoder.geocode({ address: location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const position = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };
              newMarkers.push({ id: `${location}-${index}`, position, title: location });
              bounds.extend(position);
              resolve();
            } else {
              console.warn(`Geocoding error for "${location}": ${status}`);
              // Don't reject, just skip this marker
              resolve(); 
            }
          });
        });
      });

      Promise.all(geocodePromises).then(() => {
        setMarkers(newMarkers);
        if (newMarkers.length > 0) {
          map.fitBounds(bounds);
          // Adjust zoom if only one marker to prevent over-zooming
          if (newMarkers.length === 1) {
            const listener = google.maps.event.addListenerOnce(map, "idle", () => {
                if (map.getZoom()! > 15) map.setZoom(15);
            });
             // Clean up the listener
            return () => {
                google.maps.event.removeListener(listener);
            };
          }
        } else if (locations.length > 0) {
            setGeocodingError("Could not find any of the suggested locations on the map.");
        }
      }).catch(err => {
        console.error("Error during geocoding promises:", err);
        setGeocodingError("An unexpected error occurred while trying to display locations.");
      });
    } else if (isLoaded && locations.length === 0 && initialCenter) {
        setMarkers([]); // Clear markers if no locations
    }
  }, [isLoaded, map, locations, initialCenter]); // Added initialCenter dependency

  if (loadError) {
    return (
      <div className="p-4 border rounded-md bg-destructive/10 text-destructive flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" /> Error loading Google Maps. Please check your API key and network connection.
      </div>
    );
  }

  if (!isLoaded || !initialCenter) {
    return <Skeleton style={containerStyle} className="bg-muted/50" />;
  }

  return (
    <div className="space-y-2">
      {geocodingError && (
         <div className="p-3 border rounded-md bg-amber-500/10 text-amber-700 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" /> {geocodingError}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={markers.length > 0 ? undefined : 10} // Default zoom if no markers, otherwise fitBounds handles it
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position} title={marker.title} />
        ))}
      </GoogleMap>
    </div>
  );
}