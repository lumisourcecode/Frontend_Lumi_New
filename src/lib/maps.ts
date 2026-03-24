/** Open Google Maps with driving directions to a destination (pickup or dropoff address). */
export function googleMapsDirectionsUrl(destination: string): string {
  const q = encodeURIComponent(destination.trim());
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${q}`;
}

export function googleMapsMultiStopUrl(stop1: string, stop2: string): string {
  const origin = encodeURIComponent(stop1.trim());
  const dest = encodeURIComponent(stop2.trim());
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${origin}&destination=${dest}`;
}
