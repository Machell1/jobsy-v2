import { geocodingClient } from '../../lib/mapbox';
import { JAMAICA_PARISHES } from '@jobsy/shared';

export interface GeocodeResult {
  placeName: string;
  coordinates: [number, number]; // [lng, lat]
  relevance: number;
}

export interface PlaceInfo {
  placeName: string;
  coordinates: [number, number];
}

export async function forwardGeocode(address: string): Promise<GeocodeResult[]> {
  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: address,
        countries: ['JM'],
        limit: 5,
      })
      .send();

    const features = response.body.features || [];

    return features.map((feature: any) => ({
      placeName: feature.place_name,
      coordinates: feature.center as [number, number],
      relevance: feature.relevance,
    }));
  } catch (error) {
    console.error('Forward geocode error:', error);
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<PlaceInfo | null> {
  try {
    const response = await geocodingClient
      .reverseGeocode({
        query: [lng, lat],
        limit: 1,
      })
      .send();

    const feature = response.body.features?.[0];
    if (!feature) return null;

    return {
      placeName: feature.place_name,
      coordinates: feature.center as [number, number],
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}

export function getParishes(): readonly string[] {
  return JAMAICA_PARISHES;
}

export async function autocomplete(
  query: string,
  limit: number = 5,
): Promise<GeocodeResult[]> {
  try {
    const response = await geocodingClient
      .forwardGeocode({
        query,
        countries: ['JM'],
        autocomplete: true,
        limit,
      })
      .send();

    const features = response.body.features || [];

    return features.map((feature: any) => ({
      placeName: feature.place_name,
      coordinates: feature.center as [number, number],
      relevance: feature.relevance,
    }));
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}
