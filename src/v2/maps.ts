export interface PlaceDetails {
  location: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string;
}

let mapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  const existing = (window as any).google?.maps;
  if (existing) return Promise.resolve(existing);
  if (mapsPromise) return mapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error("Google Maps is not configured."));

  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google.maps);
    script.onerror = () => reject(new Error("Google Maps could not load."));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

export function mapsSearchUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
