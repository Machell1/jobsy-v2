// @mapbox/mapbox-sdk doesn't ship reliable TS types — use require pattern.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAPBOX_ACCESS_TOKEN!,
});

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeName: string;
}

/**
 * Forward-geocode an address string into coordinates.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const response = await geocodingClient
    .forwardGeocode({ query: address, limit: 1 })
    .send();

  const feature = response.body.features?.[0];
  if (!feature) return null;

  const [longitude, latitude] = feature.center;
  return { latitude, longitude, placeName: feature.place_name };
}

/**
 * Reverse-geocode coordinates into a place name.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const response = await geocodingClient
    .reverseGeocode({ query: [longitude, latitude], limit: 1 })
    .send();

  return response.body.features?.[0]?.place_name ?? null;
}

export { geocodingClient };
