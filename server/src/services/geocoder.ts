import fetch from 'node-fetch';

export interface Coords {
  latitude: number;
  longitude: number;
  locationLabel?: string;
}

export interface GeocodingOptions {
  limit?: number;
  signal?: AbortSignal;
}

export async function geocode(
  query: string,
  options: GeocodingOptions = {}
): Promise<Coords[]> {
  const { limit = 5, signal } = options;
  const token = process.env.MAPBOX_TOKEN;
  const provider = process.env.GEOCODER_PROVIDER || 'mapbox';

  if (!token) {
    throw new Error('Missing MAPBOX_TOKEN environment variable');
  }

  if (provider === 'mapbox') {
    return mapboxGeocode(query, token, { limit, signal });
  } else if (provider === 'google') {
    // Future implementation for Google geocoding
    throw new Error('Google geocoding not yet implemented');
  } else {
    throw new Error(`Unsupported geocoder provider: ${provider}`);
  }
}

async function mapboxGeocode(
  query: string,
  token: string,
  options: GeocodingOptions = {}
): Promise<Coords[]> {
  const { limit = 5, signal } = options;
  
  const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json');
  url.searchParams.set('access_token', token);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('types', 'place,postcode,address');
  url.searchParams.set('autocomplete', 'true');

  try {
    const response = await fetch(url.toString(), { signal });
    
    if (!response.ok) {
      throw new Error(`Mapbox Geocoding error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    return data.features.map((feature: any) => ({
      longitude: feature.center[0],
      latitude: feature.center[1],
      locationLabel: feature.place_name
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Add a random privacy offset to coordinates
export function addPrivacyOffset(coords: Coords): Coords {
  // Random offset between 50-400 feet (15-120 meters)
  // 1 degree latitude ≈ 111,111 meters
  // 1 degree longitude ≈ 111,111 * cos(latitude) meters
  
  const metersOffset = Math.random() * (120 - 15) + 15;
  const direction = Math.random() * 2 * Math.PI; // Random direction in radians
  
  const latOffset = metersOffset / 111111;
  const lonOffset = metersOffset / (111111 * Math.cos(coords.latitude * Math.PI / 180));
  
  return {
    ...coords,
    latitude: coords.latitude + latOffset * Math.sin(direction),
    longitude: coords.longitude + lonOffset * Math.cos(direction)
  };
}